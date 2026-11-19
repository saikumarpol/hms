
import express from "express";

import authenticate from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";

import {
  createAppointment,
  listAppointments,
  getAppointment,
  getDoctorSchedule,
  getPatientHistory,
  editAppointment,
  changeAppointmentStatus,
} from "./appointment.controller.js";

import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
} from "./appointment.validation.js";

const router = express.Router();

router.use(authenticate);

// Book appointment
router.post(
  "/",
  authorizeRoles("super_admin", "admin", "receptionist"),
  validate(createAppointmentSchema),
  asyncHandler(createAppointment)
);

// Doctor schedule - keep before /:id
router.get(
  "/doctor/:doctorId",
  authorizeRoles("super_admin", "admin", "receptionist", "doctor"),
  asyncHandler(getDoctorSchedule)
);

// Patient appointment history
router.get(
  "/patient/:patientId",
  authorizeRoles("super_admin", "admin", "receptionist", "doctor"),
  asyncHandler(getPatientHistory)
);

// List and filter appointments
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "receptionist", "doctor"),
  asyncHandler(listAppointments)
);

// Update appointment status - keep before /:id
router.patch(
  "/:id/status",
  authorizeRoles("super_admin", "admin", "receptionist", "doctor"),
  validate(updateAppointmentStatusSchema),
  asyncHandler(changeAppointmentStatus)
);

// Update appointment details
router.patch(
  "/:id",
  authorizeRoles("super_admin", "admin", "receptionist"),
  validate(updateAppointmentSchema),
  asyncHandler(editAppointment)
);

// Get appointment details
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "receptionist", "doctor"),
  asyncHandler(getAppointment)
);

export default router;
