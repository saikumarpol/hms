
import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    consultationNumber: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
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

    chiefComplaint: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    symptoms: {
      type: [String],
      default: [],
    },

    vitals: {
      bloodPressure: { type: String, default: null },
      pulse: { type: Number, default: null },
      temperature: { type: Number, default: null },
      respiratoryRate: { type: Number, default: null },
      spo2: { type: Number, default: null },
      height: { type: Number, default: null },
      weight: { type: Number, default: null },
    },

    diagnosis: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    additionalDiagnosis: {
      type: [String],
      default: [],
    },

    treatmentPlan: {
      type: String,
      trim: true,
      default: "",
      maxlength: 3000,
    },

    clinicalNotes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

consultationSchema.index({ patient: 1, createdAt: -1 });
consultationSchema.index({ doctor: 1, createdAt: -1 });

const Consultation = mongoose.model(
  "Consultation",
  consultationSchema
);

export default Consultation;
