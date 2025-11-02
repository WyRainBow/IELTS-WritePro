const express = require("express")
const { questions, getQuestionById } = require("../data/questions")

const router = express.Router()

router.get("/", (req, res) => {
  res.json({ data: questions })
})

router.get("/:id", (req, res) => {
  const item = getQuestionById(req.params.id)
  if (!item) {
    return res.status(404).json({ error: "not_found" })
  }
  res.json({ data: item })
})

module.exports = router

