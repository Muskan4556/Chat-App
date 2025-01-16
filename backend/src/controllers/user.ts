import { Request, Response } from "express";
import User from "../models/user";

export const getAllUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const searchQuery = (req.query.search as string) || "";

    let query: any = {};

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [{ name: searchRegex }, { email: searchRegex }];
    }

    const users = await User.find({
      _id: { $ne: req.userId },
      ...query,
    }).select("_id name email phoneNo avatarUrl").sort({ updatedAt: 1 });;

    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No users found",
      });
    }

    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({ message: "User ID not found" });
    }
    const user = await User.findById(id).select(
      "_id name email phoneNo avatarUrl"
    )
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({ message: "User ID not found" });
    }

    const { name, password, avatarUrl } = req.body;

    const user = await User.findById({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) {
      user.name = name;
    }
    if (password) {
      user.password = password;
    }
    if (avatarUrl) {
      user.avatarUrl = avatarUrl;
    }

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
