import "dotenv/config";
import Student from "../models/student.models.js";
import Counter from "../models/counter.models.js"; 
import { appendToGoogleSheet } from "../utils/googleSheets.js";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;  


export const registerStudent = async (req, res) => {
  try {
    // STEP 1: Create student object from body (but don't save yet)
    const newStudent = new Student(req.body);

    // STEP 2: Assign Cloudinary URLs BEFORE saving
    if (req.files?.passportPhoto && req.files.passportPhoto[0]?.path) {
      newStudent.passportPhotoURL = req.files.passportPhoto[0].path;
    }

    if (req.files?.identityPhoto && req.files.identityPhoto[0]?.path) {
      newStudent.identityPhotoURL = req.files.identityPhoto[0].path;
    }

    // STEP 3: Save student (all required fields now exist)
    await newStudent.save();

    // STEP 4: Append to Google Sheet
    await appendToGoogleSheet(newStudent);

    // STEP 5: Respond success
    res.status(201).json({
      message: "✅ Registration successful",
      studentId: newStudent.studentId,
      student: newStudent,
    });

  } catch (error) {
    console.log("❌ ERROR in registerStudent:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const { search, stream, target, status } = req.query;
    const query = {};

    // 🔍 Search by name or studentId (case-insensitive)
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ];
    }

    // 🎓 Stream filter (PCM / PCB)
    if (stream) query.stream = stream;

    // 🎯 Target filter (JEE / NEET / CBSE Board)
    if (target) query.target = target;

    // 📄 Status filter
    if (status === "Generated") {
      query.admitCardGenerated = true;
      query.admitCardSent = { $ne: true }; // not sent yet
    } else if (status === "Sent") {
      query.admitCardSent = true;
    } else if (status === "Pending") {
      query.admitCardGenerated = { $ne: true };
      query.admitCardSent = { $ne: true };
    }

    // ✅ Fetch filtered students (latest first)
    const students = await Student.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const resetStudentIdCounter = async (req, res) => {
  try {
    await Counter.updateOne(
      { id: "studentId" },
      { $set: { seq: 0 } },
      { upsert: true }
    );

    res.status(200).json({ message: "Student ID counter has been reset to STU0001" });
  } catch (error) {
    console.log("Error resetting counter:", error);
    res.status(500).json({ error: "Failed to reset ID counter" });
  }
};