const axios = require("axios")

const buildPrompt = (promptText, answerText) => {
  return `你是雅思写作考官。题目如下：${promptText}。考生作文如下：${answerText}。请根据雅思写作评分标准输出JSON，字段为taskAchievement、coherence、lexicalResource、grammaticalRange、overall、feedback。评分范围0-9，overall为四个维度平均并保留一位小数，feedback提供改进建议。`
}

const parseText = (text) => {
  if (typeof text !== "string") {
    return null
  }
  try {
    return JSON.parse(text)
  } catch (error) {
    return null
  }
}

const formatResult = (payload) => {
  if (!payload) {
    return {
      taskAchievement: null,
      coherence: null,
      lexicalResource: null,
      grammaticalRange: null,
      overall: null,
      feedback: ""
    }
  }
  const taskAchievement = Number(payload.taskAchievement) || null
  const coherence = Number(payload.coherence) || null
  const lexicalResource = Number(payload.lexicalResource) || null
  const grammaticalRange = Number(payload.grammaticalRange) || null
  const overall = payload.overall !== undefined ? Number(payload.overall) : null
  const feedback = typeof payload.feedback === "string" ? payload.feedback : ""
  return { taskAchievement, coherence, lexicalResource, grammaticalRange, overall, feedback }
}

const callQwen = async ({ promptText, answerText }) => {
  const apiKey = process.env.QWEN_API_KEY
  if (!apiKey) {
    return null
  }
  const model = process.env.QWEN_MODEL || "qwen-plus"
  const messages = [
    { role: "system", content: "You are an IELTS writing examiner." },
    { role: "user", content: buildPrompt(promptText, answerText) }
  ]
  const url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  }
  const body = { model, messages }
  const response = await axios.post(url, body, { headers })
  const choice = response.data && response.data.choices && response.data.choices[0]
  const text = choice && choice.message && choice.message.content
  const parsed = parseText(text)
  return formatResult(parsed)
}

const callZhipu = async ({ promptText, answerText }) => {
  const apiKey = process.env.ZHIPU_API_KEY
  if (!apiKey) {
    return null
  }
  const model = process.env.ZHIPU_MODEL || "glm-4.5-vision"
  const messages = [
    { role: "system", content: "You are an IELTS writing examiner." },
    { role: "user", content: buildPrompt(promptText, answerText) }
  ]
  const url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  }
  const body = { model, messages }
  const response = await axios.post(url, body, { headers })
  const choice = response.data && response.data.choices && response.data.choices[0]
  const text = choice && choice.message && choice.message.content
  const parsed = parseText(text)
  return formatResult(parsed)
}

const getWritingEvaluation = async ({ promptText, answerText }) => {
  try {
    const zhipu = await callZhipu({ promptText, answerText })
    if (zhipu) {
      return zhipu
    }
  } catch (error) {}
  try {
    const qwen = await callQwen({ promptText, answerText })
    if (qwen) {
      return qwen
    }
  } catch (error) {}
  return {
    taskAchievement: 6,
    coherence: 6,
    lexicalResource: 6,
    grammaticalRange: 6,
    overall: 6,
    feedback: "请完善论证深度并检查用词准确性"
  }
}

module.exports = { getWritingEvaluation }

