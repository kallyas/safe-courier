import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import ApiError from "../utils/ApiError.js";

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.CONFLICT, "Email is already taken");
  }
  return User.create(userBody)
};

const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

const getUserById = async (id) => {
  return User.findById(id);
};

const getAdminUser = async (email) => {
  return User.findOne({ email, role: ["admin"]})
}

const getuserByEmail = async (email) => {
  return User.findOne({ email });
};

const updatePassword = async (id, password) => {
  const hashedPassword = await bcrypt.hash(password.password, 10);
  const update = User.findByIdAndUpdate(id, { password: hashedPassword });
  if (!update) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return update;
}

const updateUserById = async (id, userBody) => {
  const user = await getUserById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (userBody.email && (await User.isEmailTaken(userBody.email))) {
    throw new ApiError(httpStatus.CONFLICT, "Email is already taken");
  }

  Object.assign(user, userBody);
  await user.save();
  return user;
};

const deleteUserById = async (id) => {
  const user = await getUserById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await user.remove();
  return user;
};

export const userService = {
    createUser,
    getUserById,
    getuserByEmail,
    updateUserById,
    deleteUserById,
    queryUsers,
    getAdminUser,
    updatePassword
};