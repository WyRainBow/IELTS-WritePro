const questions = [
  {
    id: "task1",
    title: "Some people think governments should focus on reducing environmental pollution and housing problems to help people prevent illness and disease. To what extent do you agree or disagree?",
    type: "task2"
  },
  {
    id: "task2",
    title: "Nowadays many people choose to be self-employed, rather than working for a company or organisation. Why might this be the case? What could be the disadvantages of being self-employed?",
    type: "task2"
  }
]

const getQuestionById = (id) => questions.find((item) => item.id === id)

module.exports = { questions, getQuestionById }

