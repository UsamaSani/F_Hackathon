import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import { router as userRouter } from "./router/user.router.js";
import { router as authRouter } from "./router/auth.router.js";
import { router as ticketRouter } from "./router/ticket.router.js";
import { router as reportRouter } from "./router/report.router.js";
import { familyRouter } from "./router/family.router.js";
import cors from "cors";
import { API_PREFIX } from "./lib/constants.js";

dotenv.config();

const app = express();

const PORT = 5000;
const HOST = "127.0.0.1";
// Allow a set of local development origins. You can override by setting ALLOWED_ORIGINS env var
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser requests (like curl, or same-origin server requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(bodyParser.json());

app.use(`${API_PREFIX}/user`, userRouter);
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/ticket`, ticketRouter);
app.use(`${API_PREFIX}/reports`, reportRouter);
app.use(`${API_PREFIX}/family`, familyRouter);

app.get("/", (req, res) => {
  res.send("Working fine");
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, HOST, () => {
    console.log(`app is running on , and ${HOST}:${PORT}`);
  });
};

startServer();
