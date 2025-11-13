import Settings from "../models/settings.models.js";

// Get current exam date
export const getExamSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ examDate: "" });
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update exam date
export const updateExamSettings = async (req, res) => {
  try {
    const { examDate } = req.body;

    const updated = await Settings.findOneAndUpdate(
      {},
      { examDate },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Exam date updated successfully",
      settings: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
