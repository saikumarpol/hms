
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
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

    appointmentDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    durationMinutes: {
      type: Number,
      default: 15,
      min: 5,
    },

    reason: {
      type: String,
      trim: true,
      required: true,
      maxlength: 500,
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "confirmed",
        "checked_in",
        "in_consultation",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "scheduled",
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

appointmentSchema.index({
  doctor: 1,
  appointmentDate: 1,
  startTime: 1,
});

appointmentSchema.index({
  patient: 1,
  appointmentDate: -1,
});

const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema
);

export default Appointment;
