import Student from "../models/student.models.js";
import Settings from "../models/settings.models.js";
import { formatDateDDMMYYYY } from "../utils/googleSheets.js";
import path from "path";
import fs from "fs";
import { Resend } from "resend";

export const bulkSendAdmitCards = async (req, res) => {
  const { selectedStudents } = req.body;

  if (!selectedStudents || selectedStudents.length === 0) {
    return res.status(400).json({ success: false, message: "No students selected" });
  }

  try {
    // Load settings for exam date
    const settings = await Settings.findOne();
    const examDate = formatDateDDMMYYYY(settings?.examDate || "Not Set");

    // ⚡ Resend instance
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Fetch selected students
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

      const pdfPath = path.join("admitCards", `${student.studentId}.pdf`);

      if (!fs.existsSync(pdfPath)) {
        skippedList.push({ id: student.studentId, reason: "PDF not found" });
        continue;
      }

      try {
        // Convert PDF to base64 for Resend
        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfBase64 = pdfBuffer.toString("base64");

        const currentYear = new Date().getFullYear();

        // ⚡ Send email using Resend
        await resend.emails.send({
          from: `British School - Gurukul <${process.env.ADMIN_EMAIL}>`,
          to: student.email,
          subject: `Admit Card for Super 30 South Bihar Talent Search Examination ${currentYear}`,
          html: `
            <p>Dear <b>${student.studentName}</b>,</p>
            <p>1. Please download and print your Admit Card attached below for the exam.</p>
            <p>2. <b>Exam Date:</b> ${examDate}</p>
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
              content: pdfBase64,
              type: "application/pdf",
              disposition: "attachment",
            },
          ],
        });

        // Update DB
        student.admitCardSent = true;
        await student.save();

        sentList.push(student.studentId);
      } catch (mailError) {
        console.error(`Email failed for ${student.studentName}:`, mailError.message);
        skippedList.push({ id: student.studentId, reason: mailError.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Emails sent to ${sentList.length} students.`,
      sentList,
      skippedList,
    });

  } catch (error) {
    console.error("bulkSendAdmitCards Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error sending admit cards.",
      error: error.message,
    });
  }
};
