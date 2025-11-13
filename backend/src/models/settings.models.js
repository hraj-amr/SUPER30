import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  examDate: { 
    type: String, 
    required: false 
},
});

export default mongoose.model("Settings", settingsSchema);
