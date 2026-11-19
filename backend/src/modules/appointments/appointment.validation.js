
import { z } from "zod";

const dateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Appointment date must be YYYY-MM-DD"
).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
}, "Enter a valid appointment date");

const timeSchema = z.string().regex(
  /^([01]\d|2[0-3]):[0-5]\d$/,
  "Time must be in HH:mm format"
);

export const createAppointmentSchema = z.object({
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid patient ID"),

  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor ID"),

  appointmentDate: dateSchema,

  startTime: timeSchema,

  durationMinutes: z.coerce.number()
    .int()
    .min(5)
    .max(240)
    .default(15),

  reason: z.string().trim().min(2).max(500),

  notes: z.string().max(1000).optional(),
});

export const updateAppointmentSchema = z.object({
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),

  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),

  appointmentDate: dateSchema.optional(),

  startTime: timeSchema.optional(),

  durationMinutes: z.coerce.number()
    .int()
    .min(5)
    .max(240)
    .optional(),

  reason: z.string().trim().min(2).max(500).optional(),

  notes: z.string().max(1000).nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  "Provide at least one field to update"
);

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    "scheduled",
    "confirmed",
    "checked_in",
    "in_consultation",
    "completed",
    "cancelled",
    "no_show",
  ]),
});
