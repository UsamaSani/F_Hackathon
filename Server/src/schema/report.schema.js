import mongoose from "mongoose";
const { Schema, model } = mongoose;

const reportSchema = new Schema(
  {
    title: { type: String, required: true },
    test: { type: String, required: true },
    hospital: { type: String, required: true },
    doctor: { type: String, required: true },
    date: { type: Date, required: true },
    price: { type: String, required: true },
    flag: { type: Boolean, default: true },
    report: { type: String, required: false },
    pdfUrl: { type: String, required: false }, // Cloudinary PDF URL
    summary: { type: String, required: false }, // Gemini summary
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    familyMemberId: { type: Schema.Types.ObjectId, ref: "familyMember", required: true },
  },
  { timestamps: true, strictPopulate: false }
);

reportSchema.index({ userId: 1, flag: 1 });
reportSchema.index({ familyMemberId: 1 });
const Report = model("report", reportSchema);
export { Report };
