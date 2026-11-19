
import mongoose from "mongoose";

const parameterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      default: "",
      trim: true,
    },
    referenceRange: {
      type: String,
      default: "",
      trim: true,
    },
    resultType: {
      type: String,
      enum: ["number", "text"],
      default: "number",
    },
  },
  { _id: false }
);

const labTestSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    specimen: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    turnaroundHours: {
      type: Number,
      default: 24,
      min: 1,
    },
    parameters: {
      type: [parameterSchema],
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one test parameter is required",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

labTestSchema.index({ name: "text", code: "text", category: "text" });

const LabTest = mongoose.model("LabTest", labTestSchema);

export default LabTest;
