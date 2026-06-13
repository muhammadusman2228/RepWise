import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import crypto from "node:crypto";
import { sendVerificationEmail } from "../config/mailer.js";
import verificationModel from "../models/verification.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;
  const isTaken = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (isTaken) {
    return res.status(409).json({
      message: "User with this email or password is already exist",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const token = crypto.randomBytes(32).toString("hex");
  const user = await userModel.create({
    name,
    username,
    email,
    password: hashedPassword,
  });
  await verificationModel.create({
    userId: user._id,
    token,
  });
  const reqUrl = `${req.protocol}://${req.get("host")}`;
  try {
    await sendVerificationEmail(email, name, token, reqUrl);
  } catch (emailErr) {
    console.error("Verification email sending failed:", emailErr);
  }
  res.status(201).json({
    message: "User is registered Successfully",
    name,
    email,
  });
};

export async function verifyMe(req, res) {
  const token = req.query.token;
  const user = await verificationModel.findOne({ token });
  if (!user) {
    return res.status(403).json({
      message: "The link is invalid or expired",
    });
  }
  const realUser = await userModel.findById(user.userId);
  realUser.isVerified = true;
  await realUser.save();
  await verificationModel.deleteOne({ token });
  res.status(200).json({
    message: `${realUser.name} is verified Successfully`,
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Please enter correct email or password",
    });
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(401).json({
      message: "Email is not registered. Please registered first",
    });
  }
  if (user.isVerified == false) {
    return res.status(403).json({
      message: "The email is not verified. Please verified it first",
    });
  }
  const correctPassword = await bcrypt.compare(password, user.password);
  if (!correctPassword) {
    return res.status(403).json({
      message: "The password is invaid",
    });
  }

  const refreshtoken = jwt.sign({ id: user._id }, config.JWT_SECRETS, {
    expiresIn: 7 * 24 * 60 * 60,
  });
  res.cookie("refreshToken", refreshtoken, {
    httponly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
  });
  const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRETS, {
    expiresIn: "15m",
  });
  res.status(200).json({
    message: `${user.name} is logged in Successfully`,
    accessToken,
  });
}

export async function refresh(req, res) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({
      message: "The token is not present so login first",
    });
  }
  const correctToken = jwt.verify(token, config.JWT_SECRETS);
  if (!correctToken) {
    return res.status(400).json({
      message: "Token is invalid or expires",
    });
  }
  const accessToken = jwt.sign({ id: correctToken.id }, config.JWT_SECRETS, {
    expiresIn: "15m",
  });
  res.status(200).json({
    message: "The accessToken is generated",
    accessToken,
  });
}

export async function me(req, res) {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}
