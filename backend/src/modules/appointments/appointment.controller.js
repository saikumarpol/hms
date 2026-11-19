
import Doctor from "../doctors/models/doctor.model.js";
import Appointment from "./models/appointment.model.js";

import {
  createAppointment as createAppointmentService,
  getAppointments,
  getAppointmentById,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "./appointment.service.js";

const ensureDoctorOwnsAppointment = async (req, appointment) => {
  if (req.user.role !== "doctor") return;

  const doctor = await Doctor.findOne({
    user: req.user.userId,
  });

  if (!doctor || doctor._id.toString() !== appointment.doctor.toString()) {
    const error = new Error("You are not authorized to access this appointment");
    error.statusCode = 403;
    throw error;
  }
};

export const createAppointment = async (req, res) => {
  const appointment = await createAppointmentService(
    req.body,
    req.user
  );

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    data: appointment,
  });
};

export const listAppointments = async (req, res) => {
  const appointments = await getAppointments(req.query);

  res.status(200).json({
    success: true,
    message: "Appointments fetched successfully",
    count: appointments.length,
    data: appointments,
  });
};

export const getAppointment = async (req, res) => {
  const appointment = await getAppointmentById(req.params.id);

  await ensureDoctorOwnsAppointment(req, appointment);

  res.status(200).json({
    success: true,
    message: "Appointment details fetched successfully",
    data: appointment,
  });
};

export const getDoctorSchedule = async (req, res) => {
  const { doctorId } = req.params;

  if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({
      user: req.user.userId,
    });

    if (!doctor || doctor._id.toString() !== doctorId) {
      const error = new Error("You can only view your own schedule");
      error.statusCode = 403;
      throw error;
    }
  }

  const appointments = await getDoctorAppointments(
    doctorId,
    req.query.date
  );

  res.status(200).json({
    success: true,
    message: "Doctor appointments fetched successfully",
    count: appointments.length,
    data: appointments,
  });
};

export const getPatientHistory = async (req, res) => {
  const appointments = await getPatientAppointments(
    req.params.patientId
  );

  res.status(200).json({
    success: true,
    message: "Patient appointment history fetched successfully",
    count: appointments.length,
    data: appointments,
  });
};

export const editAppointment = async (req, res) => {
  const appointment = await updateAppointment(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Appointment updated successfully",
    data: appointment,
  });
};

export const changeAppointmentStatus = async (req, res) => {
  const existingAppointment = await Appointment.findById(
    req.params.id
  );

  if (!existingAppointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }

  await ensureDoctorOwnsAppointment(req, existingAppointment);

  const appointment = await updateAppointmentStatus(
    req.params.id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: "Appointment status updated successfully",
    data: appointment,
  });
};
