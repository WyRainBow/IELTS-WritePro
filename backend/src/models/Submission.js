const mongoose = require("mongoose")

const scoreSchema = new mongoose.Schema({
  taskAchievement: { type: Number, default: null },
  coherence: { type: Number, default: null },
  lexicalResource: { type: Number, default: null },
  grammaticalRange: { type: Number, default: null },
  overall: { type: Number, default: null }
})

const submissionSchema = new mongoose.Schema(
  {
    promptId: { type: String, required: true },
    promptText: { type: String, required: true },
    answerText: { type: String, required: true },
    wordCount: { type: Number, required: true },
    scores: { type: scoreSchema, default: () => ({}) },
    feedback: { type: String, default: "" }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

const Submission = mongoose.model("Submission", submissionSchema)

module.exports = Submission

