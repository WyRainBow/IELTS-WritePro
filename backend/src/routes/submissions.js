const express = require("express")
const Submission = require("../models/Submission")
const { getQuestionById } = require("../data/questions")
const { getWritingEvaluation } = require("../services/qwenService")
const { createSubmission, listSubmissions, findSubmissionById } = require("../storage/submissionStore")

const router = express.Router()

const countWords = (text) => {
  if (!text) {
    return 0
  }
  return text.trim().split(/\s+/).filter(Boolean).length
}

router.post("/", async (req, res) => {
  try {
    const { promptId, answerText } = req.body
    if (!promptId || !answerText) {
      return res.status(400).json({ error: "invalid_payload" })
    }
    const prompt = getQuestionById(promptId)
    if (!prompt) {
      return res.status(404).json({ error: "prompt_not_found" })
    }
    const wordCount = countWords(answerText)
    const evaluation = await getWritingEvaluation({ promptText: prompt.title, answerText })
    const useMongo = req.app.locals.mongoReady
    if (useMongo) {
      const submission = await Submission.create({
        promptId,
        promptText: prompt.title,
        answerText,
        wordCount,
        scores: {
          taskAchievement: evaluation.taskAchievement,
          coherence: evaluation.coherence,
          lexicalResource: evaluation.lexicalResource,
          grammaticalRange: evaluation.grammaticalRange,
          overall: evaluation.overall
        },
        feedback: evaluation.feedback
      })
      return res.status(201).json({ data: submission })
    }
    const submission = await createSubmission({
      promptId,
      promptText: prompt.title,
      answerText,
      wordCount,
      scores: {
        taskAchievement: evaluation.taskAchievement,
        coherence: evaluation.coherence,
        lexicalResource: evaluation.lexicalResource,
        grammaticalRange: evaluation.grammaticalRange,
        overall: evaluation.overall
      },
      feedback: evaluation.feedback
    })
    res.status(201).json({ data: submission })
  } catch (error) {
    res.status(500).json({ error: "server_error" })
  }
})

router.get("/", async (req, res) => {
  try {
    const useMongo = req.app.locals.mongoReady
    if (useMongo) {
      const items = await Submission.find({}).sort({ createdAt: -1 }).limit(50)
      const data = items.map((item) => ({
        id: item._id,
        promptId: item.promptId,
        promptText: item.promptText,
        createdAt: item.createdAt,
        overall: item.scores.overall,
        wordCount: item.wordCount
      }))
      return res.json({ data })
    }
    const items = await listSubmissions()
    const data = items.map((item) => ({
      id: item.id,
      promptId: item.promptId,
      promptText: item.promptText,
      createdAt: item.createdAt,
      overall: item.scores && item.scores.overall,
      wordCount: item.wordCount
    }))
    res.json({ data })
  } catch (error) {
    res.status(500).json({ error: "server_error" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const useMongo = req.app.locals.mongoReady
    if (useMongo) {
      const submission = await Submission.findById(req.params.id)
      if (!submission) {
        return res.status(404).json({ error: "not_found" })
      }
      return res.json({ data: submission })
    }
    const submission = await findSubmissionById(req.params.id)
    if (!submission) {
      return res.status(404).json({ error: "not_found" })
    }
    res.json({ data: submission })
  } catch (error) {
    res.status(404).json({ error: "not_found" })
  }
})

module.exports = router

