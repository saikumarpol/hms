
import { z } from "zod";

const vitalsSchema = z.object({
  bloodPressure: z.string().trim().max(20).nullable().optional(),
  pulse: z.number().min(0).max(300).nullable().optional(),
  temperature: z.number().min(25).max(45).nullable().optional(),
  respiratoryRate: z.number().min(0).max(100).nullable().optional(),
  spo2: z.number().min(0).max(100).nullable().optional(),
  height: z.number().min(0).max(300).nullable().optional(),
  weight: z.number().min(0).max(500).nullable().optional(),
});

export const createConsultationSchema = z.object({
  appointmentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid appointment ID"),

  chiefComplaint: z.string().trim().min(2).max(1000),

  symptoms: z.array(z.string().trim().min(1).max(200)).optional(),

  vitals: vitalsSchema.optional(),

  diagnosis: z.string().trim().max(2000).optional(),

  additionalDiagnosis: z
    .array(z.string().trim().min(1).max(500))
    .optional(),

  treatmentPlan: z.string().trim().max(3000).optional(),

  clinicalNotes: z.string().trim().max(5000).optional(),

  followUpDate: z.string().date().nullable().optional(),
});

export const updateConsultationSchema = z
  .object({
    chiefComplaint: z.string().trim().min(2).max(1000).optional(),

    symptoms: z.array(z.string().trim().min(1).max(200)).optional(),

    vitals: vitalsSchema.optional(),

    diagnosis: z.string().trim().max(2000).optional(),

    additionalDiagnosis: z
      .array(z.string().trim().min(1).max(500))
      .optional(),

    treatmentPlan: z.string().trim().max(3000).optional(),

    clinicalNotes: z.string().trim().max(5000).optional(),

    followUpDate: z.string().date().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
