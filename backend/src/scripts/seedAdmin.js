
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../modules/users/models/user.model.js";
import connectDB from "../config/database.js";

const seedAdmin = async () => {
  try {
    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD
    ) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env"
      );
    }

    if (process.env.ADMIN_PASSWORD.length < 12) {
      throw new Error(
        "Admin password must contain at least 12 characters"
      );
    }

    await connectDB();

    const email = process.env.ADMIN_EMAIL.toLowerCase();

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin account already exists:", email);
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      12
    );

    await User.create({
      name: process.env.ADMIN_NAME || "HMS Super Admin",
      email,
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
    });

    console.log("Super Admin created successfully");
    console.log("Email:", email);
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
