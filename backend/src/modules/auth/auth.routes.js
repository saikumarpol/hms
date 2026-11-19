
import express from "express";
import {
  login,
  getMe,
  logout,
} from "./auth.controller.js";

import authenticate from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { loginSchema } from "./auth.validation.js";

const router = express.Router();

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(login)
);

router.get(
  "/me",
  authenticate,
  asyncHandler(getMe)
);

router.post(
  "/logout",
  authenticate,
  logout
);

export default router;
