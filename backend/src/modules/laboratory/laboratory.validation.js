
import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const parameterSchema = z.object({
  name: z.string().trim().min(1).max(100),
  unit: z.string().trim().max(30).optional().default(""),
  referenceRange: z.string().trim().max(100).optional().default(""),
  resultType: z.enum(["number", "text"]).default("number"),
});

export const createLabTestSchema = z.object({
  code: z.string().trim().min(2).max(30),
  name: z.string().trim().min(2).max(150),
  category: z.string().trim().min(2).max(100),
  specimen: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  price: z.number().min(0),
  turnaroundHours: z.number().int().min(1).max(720).optional(),
  parameters: z.array(parameterSchema).min(1),
});

export const updateLabTestSchema = createLabTestSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const createLabOrderSchema = z.object({
  consultationId: objectIdSchema,
  testIds: z.array(objectIdSchema).min(1).max(30),
  priority: z.enum(["routine", "urgent", "stat"]).optional(),
  notes: z.string().trim().max(1000).optional(),
}).refine(
  (data) => new Set(data.testIds).size === data.testIds.length,
  { message: "Duplicate tests are not allowed", path: ["testIds"] }
);

export const updateLabResultsSchema = z.object({
  tests: z.array(
    z.object({
      testId: objectIdSchema,
      parameters: z.array(
        z.object({
          name: z.string().trim().min(1),
          value: z.string().trim().max(200),
          flag: z.enum(["normal", "low", "high", "critical", ""]).optional(),
          remarks: z.string().trim().max(500).optional(),
        })
      ).min(1),
    })
  ).min(1),
});
