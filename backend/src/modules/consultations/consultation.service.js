

import mongoose from "mongoose";

import Consultation from "./models/consultation.model.js";
import Appointment from "../appointments/models/appointment.model.js";
import Doctor from "../doctors/models/doctor.model.js";
import Counter from "../patients/models/counter.model.js";

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const getDoctorForUser = async (userId) => {
  const doctor = await Doctor.findOne({ user: userId });

  if (!doctor) {
    throwError("Doctor profile not found", 404);
  }

  return doctor;
};

const ensureDoctorOwnsConsultation = async (consultation, userId) => {
  const doctor = await getDoctorForUser(userId);

  const consultationDoctorId =
    consultation.doctor?._id?.toString() ||
    consultation.doctor?.toString();

  if (consultationDoctorId !== doctor._id.toString()) {
    throwError(
      "You are not authorized to access this consultation",
      403
    );
  }

  return doctor;
};

// Generate unique consultation number using existing Counter model
const generateConsultationNumber = async () => {
  const year = new Date().getFullYear();
  const counterId = `consultation-${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `CON-${year}-${String(counter.sequence).padStart(6, "0")}`;
};

const populateConsultation = (query) =>
  query
    .populate({
      path: "patient",
      select: "uhid firstName lastName gender dateOfBirth phone",
    })
    .populate({
      path: "doctor",
      select: "specialization department user",
      populate: {
        path: "user",
        select: "name email phone",
      },
    })
    .populate({
      path: "appointment",
      select:
        "appointmentNumber appointmentDate startTime endTime reason status",
    })
    .populate("createdBy", "name role");

// Start consultation
export const createConsultation = async (data, user) => {
  const doctor = await getDoctorForUser(user.userId);

  if (!mongoose.isValidObjectId(data.appointmentId)) {
    throwError("Invalid appointment ID");
  }

  const appointment = await Appointment.findById(data.appointmentId);

  if (!appointment) {
    throwError("Appointment not found", 404);
  }

  if (appointment.doctor.toString() !== doctor._id.toString()) {
    throwError("This appointment is not assigned to you", 403);
  }

  if (appointment.status !== "checked_in") {
    throwError(
      "Appointment must be checked in before starting consultation"
    );
  }

  const existing = await Consultation.findOne({
    appointment: appointment._id,
  });

  if (existing) {
    throwError(
      "A consultation already exists for this appointment",
      409
    );
  }

  const consultationNumber = await generateConsultationNumber();

  const consultation = await Consultation.create({
    consultationNumber,
    appointment: appointment._id,
    patient: appointment.patient,
    doctor: doctor._id,
    chiefComplaint: data.chiefComplaint,
    symptoms: data.symptoms || [],
    vitals: data.vitals || {},
    diagnosis: data.diagnosis || "",
    additionalDiagnosis: data.additionalDiagnosis || [],
    treatmentPlan: data.treatmentPlan || "",
    clinicalNotes: data.clinicalNotes || "",
    followUpDate: data.followUpDate || null,
    createdBy: user.userId,
  });

  appointment.status = "in_consultation";
  await appointment.save();

  return populateConsultation(
    Consultation.findById(consultation._id)
  );
};

// List consultations
export const getConsultations = async (filters, user) => {
  const query = {};

  if (user.role === "doctor") {
    const doctor = await getDoctorForUser(user.userId);
    query.doctor = doctor._id;
  } else {
    if (filters.patientId) {
      query.patient = filters.patientId;
    }

    if (filters.doctorId) {
      query.doctor = filters.doctorId;
    }
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const consultations = await populateConsultation(
    Consultation.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
  );

  return consultations;
};

// Get consultation by ID
export const getConsultationById = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throwError("Invalid consultation ID");
  }

  const consultation = await populateConsultation(
    Consultation.findById(id)
  );

  if (!consultation) {
    throwError("Consultation not found", 404);
  }

  if (user.role === "doctor") {
    await ensureDoctorOwnsConsultation(consultation, user.userId);
  }

  return consultation;
};

// Get consultation by appointment ID
export const getConsultationByAppointment = async (
  appointmentId,
  user
) => {
  if (!mongoose.isValidObjectId(appointmentId)) {
    throwError("Invalid appointment ID");
  }

  const consultation = await populateConsultation(
    Consultation.findOne({ appointment: appointmentId })
  );

  if (!consultation) {
    throwError(
      "Consultation not found for this appointment",
      404
    );
  }

  if (user.role === "doctor") {
    await ensureDoctorOwnsConsultation(consultation, user.userId);
  }

  return consultation;
};

// Update consultation
export const updateConsultation = async (id, data, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throwError("Invalid consultation ID");
  }

  const consultation = await Consultation.findById(id);

  if (!consultation) {
    throwError("Consultation not found", 404);
  }

  await ensureDoctorOwnsConsultation(consultation, user.userId);

  if (consultation.status === "completed") {
    throwError("Completed consultations cannot be edited");
  }

  const allowedFields = [
    "chiefComplaint",
    "symptoms",
    "vitals",
    "diagnosis",
    "additionalDiagnosis",
    "treatmentPlan",
    "clinicalNotes",
    "followUpDate",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      consultation[field] =
        field === "followUpDate" && data[field]
          ? new Date(data[field])
          : data[field];
    }
  }

  await consultation.save();

  return populateConsultation(
    Consultation.findById(consultation._id)
  );
};

// Complete consultation
export const completeConsultation = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throwError("Invalid consultation ID");
  }

  const consultation = await Consultation.findById(id);

  if (!consultation) {
    throwError("Consultation not found", 404);
  }

  await ensureDoctorOwnsConsultation(consultation, user.userId);

  if (consultation.status === "completed") {
    throwError("Consultation is already completed");
  }

  if (!consultation.diagnosis?.trim()) {
    throwError(
      "Please enter a diagnosis before completing the consultation"
    );
  }

  const appointment = await Appointment.findById(
    consultation.appointment
  );

  if (!appointment) {
    throwError("Linked appointment not found", 404);
  }

  if (appointment.status !== "in_consultation") {
    throwError(
      "Appointment is not currently in consultation"
    );
  }

  consultation.status = "completed";
  consultation.completedAt = new Date();

  await consultation.save();

  appointment.status = "completed";
  await appointment.save();

  return populateConsultation(
    Consultation.findById(consultation._id)
  );
};

