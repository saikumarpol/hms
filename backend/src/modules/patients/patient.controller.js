
import {
  registerPatient,
  getPatients,
  getPatientById,
} from "./patient.service.js";

export const createPatient = async (req, res) => {
  const patient = await registerPatient(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Patient registered successfully",
    data: patient,
  });
};

export const listPatients = async (req, res) => {
  const patients = await getPatients(req.query.search);

  res.status(200).json({
    success: true,
    message: "Patients fetched successfully",
    count: patients.length,
    data: patients,
  });
};

export const getPatient = async (req, res) => {
  const patient = await getPatientById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Patient details fetched successfully",
    data: patient,
  });
};
