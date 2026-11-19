
import {
  createUser,
  getUsers,
} from "./user.service.js";

export const createUserController = async (req, res) => {
  const user = await createUser(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
};

export const getUsersController = async (req, res) => {
  const users = await getUsers(req.query);

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: users,
  });
};
