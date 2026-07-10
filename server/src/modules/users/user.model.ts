import bcrypt from "bcryptjs";
import {
  Schema,
  model,
  type HydratedDocument,
  type Model,
} from "mongoose";
import type { UserRole } from "../../shared/types";

export type UserStatus = "pending" | "active" | "suspended" | "deactivated";

export interface IUser {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  isAdmin: boolean;
  profileImage?: string;
  lastLogin?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
  isAdminUser(): boolean;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
export type UserModel = Model<IUser, object, IUserMethods>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username cannot exceed 50 characters"],
      lowercase: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: (value: string) => EMAIL_REGEX.test(value),
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "courier"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "deactivated"],
      default: "pending",
    },
    isAdmin: { type: Boolean, default: false },
    profileImage: { type: String },
    lastLogin: { type: Date },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("parcels", {
  ref: "Parcel",
  localField: "_id",
  foreignField: "sender",
});

// Weighted text index for admin user search.
userSchema.index(
  { username: "text", firstName: "text", lastName: "text", email: "text" },
  { weights: { username: 10, firstName: 5, lastName: 5, email: 3 } },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (
  this: UserDocument,
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isAdminUser = function (this: UserDocument): boolean {
  return this.isAdmin || this.role === "admin";
};

export const User = model<IUser, UserModel>("User", userSchema);
export default User;
