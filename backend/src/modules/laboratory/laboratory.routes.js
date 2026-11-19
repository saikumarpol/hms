
import express from "express";

import authenticate from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";

import {
  createLabTest,
  listLabTests,
  editLabTest,
  createLabOrder,
  listLabOrders,
  getLabOrder,
  collectSample,
  enterResults,
  completeLabOrder,
  cancelLabOrder,
} from "./laboratory.controller.js";

import {
  createLabTestSchema,
  updateLabTestSchema,
  createLabOrderSchema,
  updateLabResultsSchema,
} from "./laboratory.validation.js";

const router = express.Router();

router.use(authenticate);

// Lab test catalogue
router.get(
  "/tests",
  authorizeRoles("super_admin", "admin", "doctor", "lab_technician"),
  asyncHandler(listLabTests)
);

router.post(
  "/tests",
  authorizeRoles("super_admin", "admin"),
  validate(createLabTestSchema),
  asyncHandler(createLabTest)
);

router.patch(
  "/tests/:id",
  authorizeRoles("super_admin", "admin"),
  validate(updateLabTestSchema),
  asyncHandler(editLabTest)
);

// Lab orders
router.post(
  "/orders",
  authorizeRoles("doctor", "super_admin"),
  validate(createLabOrderSchema),
  asyncHandler(createLabOrder)
);

router.get(
  "/orders",
  authorizeRoles("super_admin", "admin", "doctor", "lab_technician"),
  asyncHandler(listLabOrders)
);

router.get(
  "/orders/:id",
  authorizeRoles("super_admin", "admin", "doctor", "lab_technician"),
  asyncHandler(getLabOrder)
);

// Lab technician workflow
router.patch(
  "/orders/:id/collect",
  authorizeRoles("super_admin", "lab_technician"),
  asyncHandler(collectSample)
);

router.patch(
  "/orders/:id/results",
  authorizeRoles("super_admin", "lab_technician"),
  validate(updateLabResultsSchema),
  asyncHandler(enterResults)
);

router.patch(
  "/orders/:id/complete",
  authorizeRoles("super_admin", "lab_technician"),
  asyncHandler(completeLabOrder)
);

// Cancellation
router.patch(
  "/orders/:id/cancel",
  authorizeRoles("super_admin", "admin", "doctor"),
  asyncHandler(cancelLabOrder)
);

export default router;
