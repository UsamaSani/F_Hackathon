import mongoose from "mongoose";
const { Schema, model } = mongoose;

const familyMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    relation: { type: String, required: true },
    color: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true }, // Reference to the user who added this family member
  },
  { timestamps: true }
);

familyMemberSchema.index({ userId: 1 });

const FamilyMember = model("familyMember", familyMemberSchema);
export { FamilyMember };