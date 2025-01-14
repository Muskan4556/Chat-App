import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, phoneNo, avatarUrl } = req.body;
    if (phoneNo && phoneNo === null) {
      return res.status(400).json({ message: "Phone number cannot be null" });
    }

    let user = await User.findOne({
      $or: [{ email: email }, { phoneNo: phoneNo }],
    });
    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    user = new User({ name, email, password, phoneNo, avatarUrl });

    await user.save();

    const token = jwt.sign(
      { userId: user?._id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Logged in successfully",
      userId: user._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  res.cookie("auth_token", "", { expires: new Date(0) });
  res.status(200).json("Logout successfully");
};

export const getValidatedUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    return res.status(200).send({ userId: req.userId });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
