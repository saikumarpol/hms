
import express from "express";

import authenticate from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";

import {
  createUserController,
  getUsersController,
} from "./user.controller.js";

import { createUserSchema } from "./user.validation.js";

const router = express.Router();

router.use(authenticate);

// Only Super Admin can manage staff accounts.
router.use(authorizeRoles("super_admin"));

router.post(
  "/",
  validate(createUserSchema),
  asyncHandler(createUserController)
);

router.get(
  "/",
  asyncHandler(getUsersController)
);

export default router;
