
import {
  createConsultation as createConsultationService,
  getConsultations as getConsultationsService,
  getConsultationById as getConsultationByIdService,
  getConsultationByAppointment as getConsultationByAppointmentService,
  updateConsultation as updateConsultationService,
  completeConsultation as completeConsultationService,
} from "./consultation.service.js";

export const createConsultation = async (req, res) => {
  const consultation = await createConsultationService(
    req.body,
    req.user
  );

  res.status(201).json({
    success: true,
    message: "Consultation started successfully",
    data: consultation,
  });
};

export const listConsultations = async (req, res) => {
  const consultations = await getConsultationsService(
    req.query,
    req.user
  );

  res.status(200).json({
    success: true,
    count: consultations.length,
    data: consultations,
  });
};

export const getConsultation = async (req, res) => {
  const consultation = await getConsultationByIdService(
    req.params.id,
    req.user
  );

  res.status(200).json({
    success: true,
    data: consultation,
  });
};

export const getConsultationByAppointment = async (req, res) => {
  const consultation = await getConsultationByAppointmentService(
    req.params.appointmentId,
    req.user
  );

  res.status(200).json({
    success: true,
    data: consultation,
  });
};

export const editConsultation = async (req, res) => {
  const consultation = await updateConsultationService(
    req.params.id,
    req.body,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Consultation updated successfully",
    data: consultation,
  });
};

export const finishConsultation = async (req, res) => {
  const consultation = await completeConsultationService(
    req.params.id,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Consultation completed successfully",
    data: consultation,
  });
};
