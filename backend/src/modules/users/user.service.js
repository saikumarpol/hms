
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";

export const createUser = async (data, currentUser) => {
  // Only Super Admin can create Admin or Super Admin accounts.
  if (
    ["super_admin", "admin"].includes(data.role) &&
    currentUser.role !== "super_admin"
  ) {
    const error = new Error(
      "Only Super Admin can create Admin accounts"
    );
    error.statusCode = 403;
    throw error;
  }

  const existingUser = await User.findOne({
    email: data.email,
  });

  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    ...data,
    password: hashedPassword,
    createdBy: currentUser.userId,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

export const getUsers = async (filters = {}) => {
  const query = {};

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === "true";
  }

  return User.find(query)
    .select("-password")
    .sort({ createdAt: -1 });
};
