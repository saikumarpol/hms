
import {
  loginUser,
  getCurrentUser,
} from "./auth.service.js";

export const login = async (req, res) => {
  const result = await loginUser(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

export const getMe = async (req, res) => {
  const user = await getCurrentUser(req.user.userId);

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    },
  });
};

export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful. Please discard your access token.",
  });
};
