
import express from "express";

import authenticate from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";

import {
  createPatient,
  listPatients,
  getPatient,
} from "./patient.controller.js";

import { createPatientSchema } from "./patient.validation.js";

const router = express.Router();

router.use(authenticate);

// Patient registration
router.post(
  "/",
  authorizeRoles("super_admin", "admin", "receptionist"),
  validate(createPatientSchema),
  asyncHandler(createPatient)
);

// Search and list patients
router.get(
  "/",
  authorizeRoles(
    "super_admin",
    "admin",
    "receptionist",
    "doctor"
  ),
  asyncHandler(listPatients)
);

// Get patient details
router.get(
  "/:id",
  authorizeRoles(
    "super_admin",
    "admin",
    "receptionist",
    "doctor"
  ),
  asyncHandler(getPatient)
);

export default router;
