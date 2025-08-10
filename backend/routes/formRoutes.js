const express = require("express");
const router = express.Router();
const Form = require("../models/Form");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", async (req, res) => {
  try {
    const form = new Form(req.body);
    await form.save();
    res.status(201).json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const forms = await Form.find();
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/:id/header-image", upload.single("image"), async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { headerImage: req.file.path },
      { new: true }
    );
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post(
  "/:id/questions/:questionId/image",
  upload.single("image"),
  async (req, res) => {
    try {
      const form = await Form.findById(req.params.id);
      if (!form) return res.status(404).json({ error: "Form not found" });

      const question = form.questions.id(req.params.questionId);
      if (!question)
        return res.status(404).json({ error: "Question not found" });

      question.image = req.file.path;
      await form.save();

      res.json(form);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

module.exports = router;
