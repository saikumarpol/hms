
import mongoose from "mongoose";

import Appointment from "./models/appointment.model.js";
import Patient from "../patients/models/patient.model.js";
import Doctor from "../doctors/models/doctor.model.js";
import Counter from "../patients/models/counter.model.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateAppointmentNumber = async () => {
  const year = new Date().getFullYear();
  const counterId = `APPOINTMENT_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `APT-${year}-${String(counter.sequence).padStart(6, "0")}`;
};

const getAppointmentDate = (dateString) => {
  return new Date(`${dateString}T00:00:00.000Z`);
};

const calculateEndTime = (startTime, durationMinutes) => {
  const [hours, minutes] = startTime.split(":").map(Number);

  const totalMinutes = hours * 60 + minutes + durationMinutes;

  if (totalMinutes > 24 * 60) {
    throw createError("Appointment cannot extend beyond midnight");
  }

  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
};

const verifyPatientAndDoctor = async (patientId, doctorId) => {
  if (!mongoose.isValidObjectId(patientId)) {
    throw createError("Invalid patient ID");
  }

  if (!mongoose.isValidObjectId(doctorId)) {
    throw createError("Invalid doctor ID");
  }

  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    Doctor.findById(doctorId),
  ]);

  if (!patient) {
    throw createError("Patient not found", 404);
  }

  if (!doctor) {
    throw createError("Doctor not found", 404);
  }

  if (!doctor.isAvailable) {
    throw createError("Doctor is currently unavailable");
  }

  return { patient, doctor };
};

const checkDoctorAvailability = async ({
  doctorId,
  appointmentDate,
  startTime,
  endTime,
  excludeAppointmentId = null,
}) => {
  const query = {
    doctor: doctorId,
    appointmentDate,
    status: { $nin: ["cancelled", "no_show"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const conflictingAppointment = await Appointment.findOne(query);

  if (conflictingAppointment) {
    throw createError(
      `Doctor already has an appointment between ${conflictingAppointment.startTime} and ${conflictingAppointment.endTime}`
    );
  }
};

const populateAppointment = (query) => {
  return query
    .populate("patient", "uhid firstName lastName phone gender")
    .populate({
      path: "doctor",
      select: "specialization department consultationFee user",
      populate: {
        path: "user",
        select: "name email phone",
      },
    })
    .populate("createdBy", "name role");
};

// Create appointment
export const createAppointment = async (data, currentUser) => {
  const { patient, doctor } = await verifyPatientAndDoctor(
    data.patientId,
    data.doctorId
  );

  const appointmentDate = getAppointmentDate(data.appointmentDate);

  const durationMinutes = data.durationMinutes ?? 15;

  const endTime = calculateEndTime(
    data.startTime,
    durationMinutes
  );

  await checkDoctorAvailability({
    doctorId: doctor._id,
    appointmentDate,
    startTime: data.startTime,
    endTime,
  });

  const appointmentNumber = await generateAppointmentNumber();

  const appointment = await Appointment.create({
    appointmentNumber,
    patient: patient._id,
    doctor: doctor._id,
    appointmentDate,
    startTime: data.startTime,
    endTime,
    durationMinutes,
    reason: data.reason,
    notes: data.notes || null,
    createdBy: currentUser.userId,
  });

  return populateAppointment(
    Appointment.findById(appointment._id)
  );
};

// List and filter appointments
export const getAppointments = async (filters = {}) => {
  const query = {};

  if (filters.date) {
    query.appointmentDate = getAppointmentDate(filters.date);
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.doctorId) {
    query.doctor = filters.doctorId;
  }

  if (filters.patientId) {
    query.patient = filters.patientId;
  }

  return populateAppointment(
    Appointment.find(query)
      .sort({ appointmentDate: 1, startTime: 1 })
      .limit(100)
  );
};

// Get appointment by ID
export const getAppointmentById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid appointment ID");
  }

  const appointment = await populateAppointment(
    Appointment.findById(id)
  );

  if (!appointment) {
    throw createError("Appointment not found", 404);
  }

  return appointment;
};

// Get doctor schedule
export const getDoctorAppointments = async (doctorId, date) => {
  if (!mongoose.isValidObjectId(doctorId)) {
    throw createError("Invalid doctor ID");
  }

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw createError("Doctor not found", 404);
  }

  const query = { doctor: doctorId };

  if (date) {
    query.appointmentDate = getAppointmentDate(date);
  }

  return populateAppointment(
    Appointment.find(query)
      .sort({ appointmentDate: 1, startTime: 1 })
  );
};

// Get patient appointment history
export const getPatientAppointments = async (patientId) => {
  if (!mongoose.isValidObjectId(patientId)) {
    throw createError("Invalid patient ID");
  }

  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw createError("Patient not found", 404);
  }

  return populateAppointment(
    Appointment.find({ patient: patientId })
      .sort({ appointmentDate: -1, startTime: -1 })
  );
};

// Update appointment details
export const updateAppointment = async (id, data) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid appointment ID");
  }

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw createError("Appointment not found", 404);
  }

  if (
    ["completed", "cancelled", "no_show"].includes(appointment.status)
  ) {
    throw createError(
      "Cannot edit an appointment with its current status"
    );
  }

  const patientId = data.patientId || appointment.patient.toString();
  const doctorId = data.doctorId || appointment.doctor.toString();

  await verifyPatientAndDoctor(patientId, doctorId);

  const dateString = data.appointmentDate ||
    appointment.appointmentDate.toISOString().slice(0, 10);

  const appointmentDate = getAppointmentDate(dateString);

  const startTime = data.startTime || appointment.startTime;

  const durationMinutes =
    data.durationMinutes ?? appointment.durationMinutes;

  const endTime = calculateEndTime(startTime, durationMinutes);

  await checkDoctorAvailability({
    doctorId,
    appointmentDate,
    startTime,
    endTime,
    excludeAppointmentId: id,
  });

  if (data.patientId) appointment.patient = patientId;
  if (data.doctorId) appointment.doctor = doctorId;

  appointment.appointmentDate = appointmentDate;
  appointment.startTime = startTime;
  appointment.endTime = endTime;
  appointment.durationMinutes = durationMinutes;

  if (data.reason !== undefined) appointment.reason = data.reason;
  if (data.notes !== undefined) appointment.notes = data.notes;

  await appointment.save();

  return populateAppointment(
    Appointment.findById(appointment._id)
  );
};

// Update appointment status
export const updateAppointmentStatus = async (id, status) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid appointment ID");
  }

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw createError("Appointment not found", 404);
  }

  const transitions = {
    scheduled: ["confirmed", "checked_in", "cancelled", "no_show"],
    confirmed: ["checked_in", "cancelled", "no_show"],
    checked_in: ["in_consultation", "cancelled"],
    in_consultation: ["completed"],
    completed: [],
    cancelled: [],
    no_show: [],
  };

  if (!transitions[appointment.status].includes(status)) {
    throw createError(
      `Cannot change status from ${appointment.status} to ${status}`
    );
  }

  appointment.status = status;

  await appointment.save();

  return populateAppointment(
    Appointment.findById(appointment._id)
  );
};
