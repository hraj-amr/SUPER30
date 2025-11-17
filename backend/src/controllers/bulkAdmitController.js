import Student from "../models/student.models.js";
import Settings from "../models/settings.models.js";
import { generateAdmitCard } from "./admitCardController.js";
import { formatDateDDMMYYYY } from "../utils/googleSheets.js";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

export const bulkGenerateAdmitCards = async (req, res) => {
  const { selectedStudents } = req.body;

  if (!selectedStudents?.length) {
    return res.status(400).json({ success: false, message: "No students selected" });
  }

  const settings = await Settings.findOne();
  if (!settings?.examDate) {
    return res.status(400).json({ success: false, message: "Please set the exam date first" });
  }

  const students = await Student.find({ studentId: { $in: selectedStudents } });
  const missingRoll = students.filter(s => !s.rollNo);

  if (missingRoll.length) {
    return res.status(400).json({
      success: false,
      message: `Cannot generate admit cards because ${missingRoll.length} students have no roll numbers`,
    });
  }

  const generated = [];

  for (const student of students) {

    const filePath = `/tmp/${student.studentId}.pdf`;

    // ⚠ DELETE OLD FILE IF EXISTS
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await new Promise(resolve =>
      generateAdmitCard(
        { params: { studentId: student.studentId } },
        { download: () => resolve() }
      )
    );

    generated.push(student.studentId);
  }

  res.status(200).json({
    success: true,
    message: `Generated ${generated.length} admit card(s)`,
    generatedStudents: generated,
  });
};




export const bulkSendAdmitCards = async (req, res) => {
  const { selectedStudents } = req.body;

  if (!selectedStudents?.length) {
    return res.status(400).json({ success: false, message: "No students selected" });
  }

  const settings = await Settings.findOne();
  const examDate = formatDateDDMMYYYY(settings?.examDate || "Not Set");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
  });

  const students = await Student.find({ studentId: { $in: selectedStudents } });

  const sentList = [];
  const skippedList = [];

  for (const student of students) {
    const pdfPath = `/tmp/${student.studentId}.pdf`;

    if (!fs.existsSync(pdfPath)) {
      skippedList.push({ id: student.studentId, reason: "PDF missing" });
      continue;
    }

    const buffer = fs.readFileSync(pdfPath);

    await transporter.sendMail({
      from: `"British School Gurukul" <${process.env.ADMIN_EMAIL}>`,
      to: student.email,
      subject: `Your Admit Card`,
      html: `<p>Hello ${student.studentName}, your admit card is attached</p>`,
      attachments: [
        {
          filename: `${student.studentId}.pdf`,
          content: buffer,     // ⭐ IMPORTANT
        },
      ],
    });

    sentList.push(student.studentId);
    student.admitCardSent = true;
    await student.save();
  }

  res.status(200).json({
    success: true,
    message: `Emails sent: ${sentList.length}`,
    sentList,
    skippedList,
  });
};
