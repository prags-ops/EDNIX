import { Request, Response, NextFunction } from "express";
import { Document } from "mongoose";
import { User } from "../models/User";
import { catchAsync, AppError } from "../utils/appError";

interface IUser extends Document {
  _id: any;
  username: string;
  email: string;
  password: string;
}

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return next(new AppError("User already exists", 400));
  }

  const newUser = new User({ username, email, password });
  await newUser.save();

  return res.status(201).json({ success: true, message: "User registered successfully" });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const user = await User.findOne({ email }) as unknown as IUser;
  if (!user || user.password !== password) {
    return next(new AppError("Invalid credentials", 401));
  }

  return res.status(200).json({ 
    success: true, 
    user: { id: user._id, username: user.username, email: user.email } 
  });
});
