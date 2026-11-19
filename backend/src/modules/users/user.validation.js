
import { z } from "zod";
import { USER_ROLES } from "./models/user.model.js";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().transform((v) => v.toLowerCase()),
  phone: z.string().trim().optional(),
  password: z.string().min(8).max(72),
  role: z.enum(USER_ROLES),
});
