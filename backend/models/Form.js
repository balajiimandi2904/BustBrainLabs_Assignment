const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["categorize", "cloze", "comprehension"],
  },
  questionText: { type: String, required: true },
  image: { type: String },
  categories: [{ type: String }],
  items: [
    {
      text: { type: String },
      category: { type: String },
    },
  ],
  clozeText: { type: String },
  blanks: [
    {
      answer: { type: String },
      position: { type: Number },
    },
  ],
  comprehensionText: { type: String },
  mcqs: [
    {
      question: { type: String },
      options: [{ type: String }],
      correctOption: { type: Number },
    },
  ],
});

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  headerImage: { type: String },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Form", formSchema);
