
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
} from "./doctor.service.js";

export const addDoctor = async (req, res) => {
  const doctor = await createDoctor(req.body);

  res.status(201).json({
    success: true,
    message: "Doctor profile created successfully",
    data: doctor,
  });
};

export const listDoctors = async (req, res) => {
  const doctors = await getDoctors(req.query.search);

  res.status(200).json({
    success: true,
    message: "Doctors fetched successfully",
    count: doctors.length,
    data: doctors,
  });
};

export const getDoctor = async (req, res) => {
  const doctor = await getDoctorById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Doctor details fetched successfully",
    data: doctor,
  });
};

export const editDoctor = async (req, res) => {
  const doctor = await updateDoctor(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Doctor profile updated successfully",
    data: doctor,
  });
};
