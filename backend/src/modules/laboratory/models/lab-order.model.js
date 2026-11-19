
import mongoose from "mongoose";

const resultParameterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      default: "",
    },
    unit: {
      type: String,
      default: "",
    },
    referenceRange: {
      type: String,
      default: "",
    },
    flag: {
      type: String,
      enum: ["normal", "low", "high", "critical", ""],
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const labOrderItemSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTest",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    specimen: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["requested", "processing", "completed"],
      default: "requested",
    },
    parameters: {
      type: [resultParameterSchema],
      default: [],
    },
  },
  { _id: false }
);

const labOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    tests: {
      type: [labOrderItemSchema],
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one test is required",
      },
    },
    priority: {
      type: String,
      enum: ["routine", "urgent", "stat"],
      default: "routine",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: [
        "requested",
        "sample_collected",
        "processing",
        "completed",
        "cancelled",
      ],
      default: "requested",
    },
    collectedAt: {
      type: Date,
      default: null,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

labOrderSchema.index({ patient: 1, createdAt: -1 });
labOrderSchema.index({ doctor: 1, createdAt: -1 });
labOrderSchema.index({ status: 1, createdAt: -1 });

const LabOrder = mongoose.model("LabOrder", labOrderSchema);

export default LabOrder;
