
import mongoose from "mongoose";
import Doctor from "./models/doctor.model.js";
import User from "../users/models/user.model.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createDoctor = async (data) => {
  if (!mongoose.Types.ObjectId.isValid(data.userId)) {
    throw createError("Invalid doctor user ID", 400);
  }

  const user = await User.findById(data.userId);

  if (!user) {
    throw createError("User account not found", 404);
  }

  if (user.role !== "doctor") {
    throw createError("Selected user does not have the doctor role", 400);
  }

  const existingDoctor = await Doctor.findOne({ user: user._id });

  if (existingDoctor) {
    throw createError("Doctor profile already exists for this user", 409);
  }

  const doctor = await Doctor.create({
    user: user._id,
    specialization: data.specialization,
    qualification: data.qualification,
    department: data.department,
    experience: data.experience,
    consultationFee: data.consultationFee,
    registrationNumber: data.registrationNumber || null,
  });

  return Doctor.findById(doctor._id).populate(
    "user",
    "name email phone role"
  );
};

export const getDoctors = async (search) => {
  const query = {};

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSearch, "i");

    query.$or = [
      { specialization: regex },
      { department: regex },
      { qualification: regex },
    ];
  }

  return Doctor.find(query)
    .populate("user", "name email phone role isActive")
    .sort({ createdAt: -1 })
    .limit(100);
};

export const getDoctorById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError("Invalid doctor ID", 400);
  }

  const doctor = await Doctor.findById(id).populate(
    "user",
    "name email phone role isActive"
  );

  if (!doctor) {
    throw createError("Doctor not found", 404);
  }

  return doctor;
};

export const updateDoctor = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError("Invalid doctor ID", 400);
  }

  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).populate("user", "name email phone role isActive");

  if (!doctor) {
    throw createError("Doctor not found", 404);
  }

  return doctor;
};
