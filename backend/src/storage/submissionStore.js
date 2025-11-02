const fs = require("fs")
const path = require("path")
const { randomUUID } = require("crypto")

const filePath = path.join(__dirname, "../data/submissions.json")

const readAll = async () => {
  try {
    const buffer = await fs.promises.readFile(filePath, "utf-8")
    return JSON.parse(buffer)
  } catch (error) {
    return []
  }
}

const writeAll = async (items) => {
  const payload = JSON.stringify(items, null, 2)
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
  await fs.promises.writeFile(filePath, payload, "utf-8")
}

const createSubmission = async (payload) => {
  const items = await readAll()
  const now = new Date().toISOString()
  const submission = {
    id: randomUUID(),
    promptId: payload.promptId,
    promptText: payload.promptText,
    answerText: payload.answerText,
    wordCount: payload.wordCount,
    scores: payload.scores,
    feedback: payload.feedback,
    createdAt: now,
    updatedAt: now
  }
  items.unshift(submission)
  await writeAll(items)
  return submission
}

const listSubmissions = async () => {
  const items = await readAll()
  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50)
}

const findSubmissionById = async (id) => {
  const items = await readAll()
  return items.find((item) => item.id === id) || null
}

module.exports = { createSubmission, listSubmissions, findSubmissionById }

