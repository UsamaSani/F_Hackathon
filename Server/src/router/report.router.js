// routes/report.router.js
import express from "express";
import { Report } from "../schema/report.schema.js";
import { authGuard } from "../middlewares/auth.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // pdf-parse is CommonJS
import dotenv from "dotenv";
dotenv.config();
import fs from "fs/promises";
import fsSync from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import { execFile as execFileCb } from "child_process";
import pLimit from "p-limit";
const execFile = promisify(execFileCb);

import { GoogleGenAI } from "@google/genai";
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const router = express.Router();

// Required fields
const REQUIRED_FIELDS = ["title", "test", "hospital", "doctor", "date", "price"];

// multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// robust extraction helper (unchanged)
function extractSummary(result) {
  if (!result) return null;
  const tries = [
    () => result.response && result.response.text,
    () => result.text,
    () =>
      result.candidates &&
      result.candidates[0] &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts[0] &&
      result.candidates[0].content.parts[0].text,
    () =>
      result.output &&
      result.output[0] &&
      result.output[0].content &&
      result.output[0].content[0] &&
      result.output[0].content[0].text,
    () => (result.messages && result.messages.map((m) => m.content).join("\n")),
  ];

  for (const fn of tries) {
    try {
      const v = fn();
      if (v && typeof v === "string" && v.trim().length > 0) return v.trim();
    } catch (e) {}
  }
  return null;
}

// chunker
function chunkTextByChars(s, maxLen) {
  if (!s) return [];
  const chunks = [];
  let start = 0;
  while (start < s.length) {
    let end = Math.min(start + maxLen, s.length);
    if (end < s.length) {
      const slice = s.slice(start, end);
      const lastNewline = slice.lastIndexOf("\n");
      const lastSpace = slice.lastIndexOf(" ");
      const split = Math.max(lastNewline, lastSpace);
      if (split > Math.floor(maxLen * 0.6)) end = start + split;
    }
    chunks.push(s.slice(start, end));
    start = end;
  }
  return chunks;
}

function tryParseDate(s) {
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d;
}

// upload buffer -> cloudinary (raw)
function uploadBufferToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "reports", public_id: `${Date.now()}-${path.basename(filename, ".pdf")}` },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// text sanitizer: strip many repeated header/footer lines and collapse whitespace
function sanitizeExtractedText(s) {
  if (!s) return "";
  // normalize newlines
  let txt = s.replace(/\r\n/g, "\n").replace(/\t/g, " ");
  // collapse long runs of whitespace
  txt = txt.replace(/[ ]{2,}/g, " ");
  // remove lines that are extremely short or repeated many times.
  const lines = txt.split("\n").map((l) => l.trim());
  const freq = {};
  for (const l of lines) {
    if (!l) continue;
    freq[l] = (freq[l] || 0) + 1;
  }
  const filtered = [];
  for (const l of lines) {
    if (!l) { filtered.push(""); continue; }
    // remove lines that occur > 6 times (likely headers/footers) or are just page numbers
    if (freq[l] > 6) continue;
    if (/^page\s*\d+$/i.test(l)) continue;
    // drop repeated short junk lines
    if (l.length <= 2) continue;
    filtered.push(l);
  }
  // reassemble and remove excessive blank lines
  let out = filtered.join("\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

/**
 * OCR fallback (local system):
 * - write PDF to temp file
 * - run pdftoppm (poppler) to make PNGs
 * - run tesseract on each PNG (concurrent with p-limit)
 *
 * Requires `pdftoppm` and `tesseract` on PATH.
 */
async function ocrPdfBufferLocal(pdfBuffer, options = { dpi: 300, lang: "eng", concurrent: 2 }) {
  const tmpDir = os.tmpdir();
  const stamp = Date.now();
  const tmpPdfPath = path.join(tmpDir, `ocr-pdf-${stamp}.pdf`);
  const tmpPrefix = path.join(tmpDir, `ocr-img-${stamp}`); // pdftoppm will append -1, -2, etc.

  try {
    await fs.writeFile(tmpPdfPath, pdfBuffer);

    // run pdftoppm to produce PNGs
    // pdftoppm -png -r <dpi> <input.pdf> <out_prefix>
    await execFile("pdftoppm", ["-png", "-r", String(options.dpi || 300), tmpPdfPath, tmpPrefix]);

    // gather produced images in tmpDir matching prefix
    const allFiles = await fs.readdir(tmpDir);
    const basename = path.basename(tmpPrefix);
    const pngs = allFiles
      .filter((f) => f.startsWith(basename) && f.endsWith(".png"))
      .sort((a, b) => {
        const pa = a.match(/-(\d+)\.png$/);
        const pb = b.match(/-(\d+)\.png$/);
        const ia = pa ? Number(pa[1]) : 0;
        const ib = pb ? Number(pb[1]) : 0;
        return ia - ib;
      })
      .map((f) => path.join(tmpDir, f));

    if (pngs.length === 0) throw new Error("pdftoppm produced no images; check poppler installation and PATH");

    // OCR each PNG using tesseract concurrently (bounded)
    const limit = pLimit(options.concurrent || 2);
    const ocrPromises = pngs.map((imgPath, idx) =>
      limit(async () => {
        try {
          // tesseract <image> stdout -l <lang>
          const { stdout } = await execFile("tesseract", [imgPath, "stdout", "-l", options.lang || "eng"]);
          return `--- page ${idx + 1} ---\n${(stdout || "").trim()}`;
        } catch (e) {
          return `--- page ${idx + 1} ---\n[Tesseract failed: ${e.message || e}]`;
        }
      })
    );

    const pagesText = await Promise.all(ocrPromises);
    return pagesText.join("\n\n");
  } finally {
    // cleanup tmp pdf and generated images (best-effort)
    try { if (await fileExists(tmpPdfPath)) await fs.unlink(tmpPdfPath); } catch (e) {}
    try {
      const tmpFiles = await fs.readdir(tmpDir);
      const basename = path.basename(tmpPrefix);
      const generated = tmpFiles.filter((f) => f.startsWith(basename));
      await Promise.all(generated.map((f) => fs.unlink(path.join(tmpDir, f)).catch(() => {})));
    } catch (e) {}
  }
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch (e) {
    return false;
  }
}

// Medical-specific summarization prompt
function getChunkPrompt(chunkIndex, totalChunks) {
  return `You are a concise, clinically-aware medical report summarizer.
Focus on accuracy and brevity for clinicians.

Instructions:
1) Produce a short list of bullet points (3-6 bullets) with the most important findings.
2) Then produce a JSON object with keys: "test", "date", "patient_info" (if present), "key_findings", "impression", "recommendations", "critical_values" (or empty strings if not present).
3) If the report contains numerical/critical lab values, call them out under "critical_values".
4) Use clear, unambiguous language. If something is unclear, mark it as "uncertain" in the JSON fields.

Chunk metadata: chunk ${chunkIndex} of ${totalChunks}.
Now summarize the following extracted text (do not invent facts):\n\n`;
}

// Final combine prompt (summarize chunk summaries)
const finalCombinePrompt = `You are a senior clinical summarizer. You are provided multiple chunk summaries (already in bullet + JSON format).
Produce:
- A single concise clinical summary (3-6 bullets) suitable to show on a patient dashboard.
- A merged JSON with fields: "test", "date", "patient_info", "key_findings" (array), "impression", "recommendations", "critical_values" (array). Merge and deduplicate items from chunk JSONs. If items conflict, prefer the most recent chunk's statement and mark conflicts in a "notes" field.
Be concise.`;


// POST /upload
router.post("/upload", authGuard, upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No PDF file uploaded" });

  // validate required fields before heavy work
  const missing = REQUIRED_FIELDS.filter((f) => !req.body[f]);
  if (missing.length) return res.status(400).json({ message: "Missing required fields", missing });

  const parsedDate = tryParseDate(req.body.date);
  if (!parsedDate) return res.status(400).json({ message: "Invalid date format. Use ISO or YYYY-MM-DD." });

  const pdfBuffer = req.file.buffer;
  console.log("Received upload:", { originalname: req.file.originalname, size: pdfBuffer.length, user: req.user._id });

  try {
    // 1) upload to Cloudinary (raw)
    const cloudRes = await uploadBufferToCloudinary(pdfBuffer, req.file.originalname);
    const pdfUrl = cloudRes.secure_url;
    console.log("Cloud upload OK:", pdfUrl);

    // 2) try pdf-parse first
    let extractedText = "";
    try {
      const parsed = await pdfParse(pdfBuffer);
      extractedText = parsed && parsed.text ? parsed.text.trim() : "";
      console.log("pdf-parse length:", extractedText.length);
    } catch (err) {
      console.warn("pdf-parse error:", err?.message || err);
      extractedText = "";
    }

    // 3) if insufficient text, run OCR fallback
    if (!extractedText || extractedText.length < 50) {
      console.log("No or too little selectable text — running OCR fallback...");
      try {
        // on Windows you may prefer dpi 200 for speed, increase to 300 for quality
        const ocrText = await ocrPdfBufferLocal(pdfBuffer, { dpi: 300, lang: "eng", concurrent: 2 });
        extractedText = (ocrText || "").trim();
        console.log("OCR extracted length:", extractedText.length);
      } catch (ocrErr) {
        console.error("OCR fallback failed:", ocrErr?.message || ocrErr);
        extractedText = extractedText || "";
      }
    }

    // 4) sanitize text
    extractedText = sanitizeExtractedText(extractedText);
    if (!extractedText || extractedText.length < 30) {
      const finalSummary = "No extractable text found in this PDF after OCR attempt. Please ensure Poppler and Tesseract are installed and on PATH, or use a cloud OCR option.";
      // save minimal record with message
      const reportPayload = {
        title: req.body.title,
        test: req.body.test,
        hospital: req.body.hospital,
        doctor: req.body.doctor,
        date: parsedDate,
        price: String(req.body.price),
        pdfUrl,
        summary: finalSummary,
        createdBy: req.user._id,
      };
      const report = new Report(reportPayload);
      await report.save();
      return res.status(201).json({ message: "Report created (no text extracted)", report });
    }

    // 5) chunk and summarize chunks concurrently (bounded)
    const MAX_CHARS = 90000; // tune according to your model's context; conservative default
    const chunks = chunkTextByChars(extractedText, MAX_CHARS);
    console.log("Chunks:", chunks.length);

    const limit = pLimit(2); // concurrency for model calls
    const chunkSummaries = await Promise.all(
      chunks.map((chunk, i) =>
        limit(async () => {
          try {
            const contents = [
              {
                role: "user",
                parts: [
                  { text: getChunkPrompt(i + 1, chunks.length) + chunk },
                ],
              },
            ];
            const resp = await genAI.models.generateContent({
              model: "gemini-1.5-pro",
              contents,
            });
            const s = extractSummary(resp) || `Chunk ${i + 1}: [no summary produced]`;
            console.log(`Chunk ${i + 1} done (${s.length} chars).`);
            return s;
          } catch (e) {
            console.error(`Chunk ${i + 1} failed:`, e?.message || e);
            return `Chunk ${i + 1}: [summary failed]`;
          }
        })
      )
    );

    // 6) combine chunk summaries and produce final summary + merged JSON
    const combinedSummaries = chunkSummaries.join("\n\n");
    let finalSummary = combinedSummaries;
    try {
      const finalResp = await genAI.models.generateContent({
        model: "gemini-1.5-pro",
        contents: [
          {
            role: "user",
            parts: [{ text: finalCombinePrompt }, { text: combinedSummaries }],
          },
        ],
      });
      const combinedText = extractSummary(finalResp);
      if (combinedText) finalSummary = combinedText;
    } catch (e) {
      console.error("Final combine failed:", e?.message || e);
      // fallback to chunk summaries
    }

    // 7) save report
    const reportPayload = {
      title: req.body.title,
      test: req.body.test,
      hospital: req.body.hospital,
      doctor: req.body.doctor,
      date: parsedDate,
      price: String(req.body.price),
      pdfUrl,
      summary: finalSummary,
      createdBy: req.user._id,
    };

    const report = new Report(reportPayload);
    await report.save();

    return res.status(201).json({ message: "Report created", report });
  } catch (error) {
    console.error("Upload failed:", { message: error?.message, stack: error?.stack });
    const payload = { message: "Upload failed", details: error.message || String(error) };
    return res.status(500).json(payload);
  }
});

// CRUD endpoints (unchanged) - keep the ones you already have...
router.get("/", authGuard, async (req, res) => {
  try {
    const { hospital, doctor, startDate, endDate } = req.query;
    const query = { flag: true };
    if (hospital) query.hospital = hospital;
    if (doctor) query.doctor = doctor;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const reports = await Report.find(query).sort({ date: -1 }).populate("createdBy", "firstName lastName");
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authGuard, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, flag: true }).populate("createdBy", "firstName lastName");
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authGuard, async (req, res) => {
  try {
    const reportData = { ...req.body, createdBy: req.user._id };
    const report = new Report(reportData);
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", authGuard, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, flag: true });
    if (!report) return res.status(404).json({ message: "Report not found" });
    if (report.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized to update this report" });

    delete req.body.createdBy;
    Object.assign(report, req.body);
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", authGuard, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, flag: true });
    if (!report) return res.status(404).json({ message: "Report not found" });
    if (report.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized to delete this report" });

    report.flag = false;
    await report.save();
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export { router };
