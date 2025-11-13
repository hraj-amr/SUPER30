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
    return res.status(400).json({
      success: false,
      message: "No students selected",
    });
  }

  // ----------------- CHECK EXAM DATE -----------------
  const settings = await Settings.findOne();
  const examDate = settings?.examDate;

  if (!examDate || examDate === "Not Set") {
    return res.status(400).json({
      success: false,
      message: "Please set the exam date.",
    });
  }

  try {
    // Fetch all selected students
    const students = await Student.find({ studentId: { $in: selectedStudents } });

    // ---------- CHECK ROLL NUMBER FOR EACH STUDENT ----------
    const missingRoll = students.filter((s) => !s.rollNo);

    if (missingRoll.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot generate admit cards.<br/> Please generate roll numbers first.`,
      });
    }

    const generatedStudents = [];

    // ---------- GENERATE ADMIT CARDS ----------
    for (const student of students) {
      if (student.admitCardGenerated) continue;

      const mockReq = { params: { studentId: student.studentId } };
      const mockRes = {
        download: () => {},
        status: () => ({ json: () => {} }),
      };

      await generateAdmitCard(mockReq, mockRes);

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

  if (!selectedStudents || selectedStudents.length === 0) {
    return res.status(400).json({ success: false, message: "No students selected" });
  }

  try {
    // Load settings to include exam date in email
    const settings = await Settings.findOne();
    const examDate = formatDateDDMMYYYY(settings?.examDate || "Not Set");

    // ✅ Configure reusable email transporter (once)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD,
      },
    });

    // ✅ Fetch selected students from DB
    const students = await Student.find({ studentId: { $in: selectedStudents } });

    if (!students.length) {
      return res.status(404).json({ success: false, message: "No matching students found." });
    }

    const sentList = [];
    const skippedList = [];

    // ✅ Loop through each student and send their admit card
    for (const student of students) {
      if (!student.email) {
        console.warn(`No email found for ${student.studentName}`);
        skippedList.push({ id: student.studentId, reason: "No email" });
        continue;
      }

      const pdfPath = path.join("admitCards", `${student.studentId}.pdf`);

      if (!fs.existsSync(pdfPath)) {
        console.warn(`Admit card missing for ${student.studentName}`);
        skippedList.push({ id: student.studentId, reason: "PDF not found" });
        continue;
      }

      try {
        const currentYear = new Date().getFullYear();
        await transporter.sendMail({
          from: `"British School - Gurukul" <${process.env.ADMIN_EMAIL}>`,
          to: student.email,
          subject: `Admit Card for Super 30 South Bihar Talent Search Examination ${currentYear}`,
          html: `
            <p>Dear <b>${student.studentName}</b>,</p>
            <p>1. Please download and print your Admit Card attached below for the exam.</p>
            <p>2. <b>Exam Date:</b>${examDate}</p>
            <p>3. <b>Venue:</b> British School Gurukul, Near Chopra Agencies, South Bisar Tank, Gaya (Bihar)</p>
            <p>4. <b>Reporting Time:</b> 8:00 AM</p>
            <br/>
            <p>5. In case of any difficulty, Please contact @ 7766994020, 7766994006</p>
            <br/>
            <p>With Best Wishes,<br/>British English School<br/>Manpur, Gere, Gaya (Bihar)<br/> PIN - 823003</p>
          `,
          attachments: [
            {
              filename: `${student.studentId}.pdf`,
              path: pdfPath,
            },
          ],
        });

        // ✅ Update DB status
        student.admitCardSent = true;
        await student.save();

        sentList.push(student.studentId);
        console.log(`✅ Email sent to ${student.studentName} (${student.email})`);
      } catch (mailError) {
        console.error(`❌ Failed to send email to ${student.studentName}:`, mailError.message);
        skippedList.push({ id: student.studentId, reason: mailError.message });
      }
    }

    // ✅ Final response
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