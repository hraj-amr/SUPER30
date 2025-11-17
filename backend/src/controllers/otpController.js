// src/controllers/otpController.js

import otpStore from "../utils/otpStore.js";
import { sendSMS } from "../utils/smsService.js";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || mobile.length !== 10) {
    return res.status(400).json({ success: false, message: "Invalid mobile number" });
  }

  const existing = otpStore.get(mobile);

  if (existing && existing.attempts >= MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: "Too many OTP requests. Try again later.",
    });
  }

  const otp = generateOTP();

  try {
    await sendSMS(mobile, otp);

    otpStore.set(mobile, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
      attempts: existing ? existing.attempts + 1 : 1,
    });

    return res.json({ success: true, message: "OTP sent successfully!" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ success: false, message: "Mobile and OTP required" });
  }

  const record = otpStore.get(mobile);

  if (!record) {
    return res.status(400).json({ success: false, message: "OTP expired or not requested" });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.remove(mobile);
    return res.status(400).json({ success: false, message: "OTP expired. Generate new one." });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP. Try again." });
  }

  otpStore.remove(mobile);

  return res.json({ success: true, message: "OTP verified successfully!" });
};
