import Student from "../models/student.models.js";
import Settings from "../models/settings.models.js";
import { createAdmitCardBuffer } from "./admitCardController.js";
import { formatDateDDMMYYYY } from "../utils/googleSheets.js";
import nodemailer from "nodemailer";

export const bulkGenerateAdmitCards = async (req, res) => {
  const { selectedStudents } = req.body;

  if (!selectedStudents?.length) {
    return res.status(400).json({ success: false, message: "No students selected" });
  }

  const settings = await Settings.findOne();
  if (!settings?.examDate) {
    return res.status(400).json({ success: false, message: "Please set the exam date." });
  }
  const examDate = formatDateDDMMYYYY(settings.examDate);

  try {
    const students = await Student.find({ studentId: { $in: selectedStudents } });

    const missingRoll = students.filter((s) => !s.rollNo);
    if (missingRoll.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot generate admit cards. Please generate roll numbers first.",
      });
    }

    const generatedStudents = [];

    for (const student of students) {
      if (student.admitCardGenerated) continue;

      // Generate PDF (buffer, but we don't need to store it)
      await createAdmitCardBuffer(student, examDate);

      student.admitCardGenerated = true;
      await student.save();
      generatedStudents.push(student.studentId);
    }

    return res.status(200).json({
      success: true,
      message:
        generatedStudents.length > 0
          ? `Admit cards generated for ${generatedStudents.length} student(s).`
          : "All selected students already have admit cards.",
      generatedStudents,
    });
  } catch (error) {
    console.error("❌ Error in bulkGenerateAdmitCards:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating admit cards.",
      error: error.message,
    });
  }
};




export const bulkSendAdmitCards = async (req, res) => {
  const { selectedStudents } = req.body;

  if (!selectedStudents?.length) {
    return res.status(400).json({ success: false, message: "No students selected" });
  }

  try {
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

    if (!students.length) {
      return res.status(404).json({ success: false, message: "No matching students found." });
    }

    const sentList = [];
    const skippedList = [];

    for (const student of students) {
      if (!student.email) {
        skippedList.push({ id: student.studentId, reason: "No email" });
        continue;
      }

      try {
        const pdfBuffer = await createAdmitCardBuffer(student, examDate);

        const currentYear = new Date().getFullYear();
        await transporter.sendMail({
          from: `"British School - Gurukul" <${process.env.ADMIN_EMAIL}>`,
          to: student.email,
          subject: `Admit Card for Super 30 South Bihar Talent Search Examination ${currentYear}`,
          html: `
            <p>Dear <b>${student.studentName}</b>,</p>
            <p>1. Please download and print your Admit Card attached below for the exam.</p>
            <p>2. <b>Exam Date:</b> ${examDate}</p>
            <p>3. <b>Venue:</b> British School Gurukul, Near Chopra Agencies, South Bisar Tank, Gaya (Bihar)</p>
            <p>4. <b>Reporting Time:</b> 8:00 AM</p>
            <br/>
            <p>5. In case of any difficulty, please contact @ 7766994020, 7766994006</p>
            <br/>
            <p>With Best Wishes,<br/>British English School<br/>Manpur, Gere, Gaya (Bihar)<br/> PIN - 823003</p>
          `,
          attachments: [
            {
              filename: `${student.studentId}.pdf`,
              content: pdfBuffer, // 👈 buffer, no filesystem
            },
          ],
        });

        student.admitCardSent = true;
        await student.save();
        sentList.push(student.studentId);
      } catch (mailError) {
        console.error(`❌ Failed to send email to ${student.studentName}:`, mailError.message);
        skippedList.push({ id: student.studentId, reason: mailError.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Emails sent successfully to ${sentList.length} students.`,
      sentList,
      skippedList,
    });
  } catch (error) {
    console.error("❌ Error in bulkSendAdmitCards:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while sending admit cards.",
      error: error.message,
    });
  }
};
