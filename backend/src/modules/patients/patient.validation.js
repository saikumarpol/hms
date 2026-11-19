
import { z } from "zod";

export const createPatientSchema = z.object({
  firstName: z.string().trim().min(2).max(50),

  lastName: z.string().trim().min(1).max(50),

  gender: z.enum(["male", "female", "other"]),

  dateOfBirth: z.string().refine(
    (value) =>
      !Number.isNaN(Date.parse(value)) &&
      new Date(value) <= new Date(),
    "Enter a valid date of birth"
  ),

  phone: z.string().trim().regex(
    /^[0-9]{10}$/,
    "Phone number must contain 10 digits"
  ),

  email: z.string().email().optional().or(z.literal("")),

  bloodGroup: z.enum([
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ]).optional(),

  address: z.string().max(300).optional(),

  emergencyContact: z.string()
    .regex(/^[0-9]{10}$/)
    .optional()
    .or(z.literal("")),
});
