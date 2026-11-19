
import express from "express";

import authenticate from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";

import {
  createConsultation,
  listConsultations,
  getConsultation,
  getConsultationByAppointment,
  editConsultation,
  finishConsultation,
} from "./consultation.controller.js";

import {
  createConsultationSchema,
  updateConsultationSchema,
} from "./consultation.validation.js";

const router = express.Router();

router.use(authenticate);

// Start a consultation — assigned doctor only
router.post(
  "/",
  authorizeRoles("doctor"),
  validate(createConsultationSchema),
  asyncHandler(createConsultation)
);

// Get consultation using appointment ID
router.get(
  "/appointment/:appointmentId",
  authorizeRoles("super_admin", "admin", "doctor"),
  asyncHandler(getConsultationByAppointment)
);

// List consultations
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "doctor"),
  asyncHandler(listConsultations)
);

// Update clinical information — assigned doctor only
router.patch(
  "/:id",
  authorizeRoles("doctor"),
  validate(updateConsultationSchema),
  asyncHandler(editConsultation)
);

// Complete consultation — assigned doctor only
router.patch(
  "/:id/complete",
  authorizeRoles("doctor"),
  asyncHandler(finishConsultation)
);

// Get consultation details
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "doctor"),
  asyncHandler(getConsultation)
);

export default router;
