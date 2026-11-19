
import express from "express";

import authenticate from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";

import {
  addDoctor,
  listDoctors,
  getDoctor,
  editDoctor,
} from "./doctor.controller.js";

import {
  createDoctorSchema,
  updateDoctorSchema,
} from "./doctor.validation.js";

const router = express.Router();

router.use(authenticate);

// Create doctor profile
router.post(
  "/",
  authorizeRoles("super_admin", "admin"),
  validate(createDoctorSchema),
  asyncHandler(addDoctor)
);

// List doctors
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "receptionist", "doctor"),
  asyncHandler(listDoctors)
);

// Get doctor by MongoDB ID
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "receptionist", "doctor"),
  asyncHandler(getDoctor)
);

// Update doctor profile
router.patch(
  "/:id",
  authorizeRoles("super_admin"),
  validate(updateDoctorSchema),
  asyncHandler(editDoctor)
);

export default router;
