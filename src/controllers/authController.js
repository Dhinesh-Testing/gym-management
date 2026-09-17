import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { User } = db;

export const register = async (req, res) => {
  try {
    const { name, email, password, role, gymname, mobilenumber, address } =
      req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing required fields" });
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      gymname,
      mobilenumber,
      address,
    });
    res
      .status(201)
      .json({ status: 201, data: { message: "Created successfully" } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing required fields" });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "super_secret_jwt_key_12345",
      { expiresIn: "1d" },
    );

    res.json({
      status: 200,
      data: { token, user: { id: user.id, message: "Logged in succesfully" } },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ status: 200, data: user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, gymname, mobilenumber, address, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let updateData = { name, email, gymname, mobilenumber, address };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await user.update(updateData);

    // Fetch updated user without password to return
    await User.findByPk(userId, { attributes: { exclude: ["password"] } });
    res.json({
      status: 200,
      data: { message: "Profile updated successfully" },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
