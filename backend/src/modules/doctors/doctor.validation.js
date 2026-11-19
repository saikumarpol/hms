
import { z } from "zod";

export const createDoctorSchema = z.object({
  userId: z.string().min(1, "Doctor user ID is required"),
  specialization: z.string().trim().min(2).max(100),
  qualification: z.string().trim().min(2).max(100),
  department: z.string().trim().min(2).max(100),
  experience: z.coerce.number().min(0).max(60),
  consultationFee: z.coerce.number().min(0),
  registrationNumber: z.string().trim().max(50).optional(),
});

export const updateDoctorSchema = z.object({
  specialization: z.string().trim().min(2).max(100).optional(),
  qualification: z.string().trim().min(2).max(100).optional(),
  department: z.string().trim().min(2).max(100).optional(),
  experience: z.coerce.number().min(0).max(60).optional(),
  consultationFee: z.coerce.number().min(0).optional(),
  registrationNumber: z.string().trim().max(50).optional(),
  isAvailable: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required",
});
