import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import dayjs from "dayjs"

const useQuestions = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    axios.get("/api/questions").then((res) => {
      setQuestions(res.data.data || [])
    }).catch(() => {
      setQuestions([])
    }).finally(() => setLoading(false))
  }, [])
  return { questions, loading }
}

const ScorePanel = ({ submission, loading }) => {
  if (loading) {
    return <div className="card"><div className="section-title">AI评分</div><div className="loading">评分进行中</div></div>
  }
  if (!submission) {
    return <div className="card"><div className="section-title">AI评分</div><div className="empty">提交作文后将展示评分与反馈</div></div>
  }
  return (
    <div className="card">
      <div className="split">
        <div>
          <div className="section-title">AI评分</div>
          <div className="badge">总分 {submission.scores?.overall ?? "-"}</div>
        </div>
        <div className="score-card">
          <div className="score-item"><span className="score-label">任务完成</span><span className="score-value">{submission.scores?.taskAchievement ?? "-"}</span></div>
          <div className="score-item"><span className="score-label">连贯性</span><span className="score-value">{submission.scores?.coherence ?? "-"}</span></div>
          <div className="score-item"><span className="score-label">词汇</span><span className="score-value">{submission.scores?.lexicalResource ?? "-"}</span></div>
          <div className="score-item"><span className="score-label">语法</span><span className="score-value">{submission.scores?.grammaticalRange ?? "-"}</span></div>
        </div>
        {submission.feedback ? <div className="history-detail"><div className="history-detail-title">反馈建议</div><div className="history-detail-text">{submission.feedback}</div></div> : null}
      </div>
    </div>
  )
}

const HistoryPanel = ({ items, onSelect, selected, loading }) => {
  return (
    <div className="card">
      <div className="section-title">历史记录</div>
      {loading ? <div className="loading">加载历史数据</div> : null}
      {!loading && items.length === 0 ? <div className="empty">暂无记录</div> : null}
      <div className="history-list">
        {items.map((item) => {
          const isActive = selected && (selected.id === item.id || selected._id === item.id)
          return (
            <div key={item.id} className="history-card" style={isActive ? { borderColor: "rgba(99,102,241,0.55)", boxShadow: "0 16px 36px rgba(99,102,241,0.1)" } : undefined} onClick={() => onSelect(item)}>
              <div className="history-title">{item.promptText}</div>
              <div className="history-meta">{dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")} | 字数 {item.wordCount} | 总分 {item.overall ?? "-"}</div>
            </div>
          )
        })}
      </div>
      {selected ? (
        <div className="history-detail">
          <div className="history-detail-title">作答</div>
          <div className="history-detail-text">{selected.answerText}</div>
          <div className="history-detail-title" style={{ marginTop: 16 }}>评分反馈</div>
          <div className="history-detail-text">任务完成 {selected.scores?.taskAchievement ?? "-"}，连贯性 {selected.scores?.coherence ?? "-"}，词汇 {selected.scores?.lexicalResource ?? "-"}，语法 {selected.scores?.grammaticalRange ?? "-"}
{selected.feedback ? `\n${selected.feedback}` : ""}</div>
        </div>
      ) : null}
    </div>
  )
}

const App = () => {
  const { questions, loading: loadingQuestions } = useQuestions()
  const [selectedQuestionId, setSelectedQuestionId] = useState(null)
  const [answer, setAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [latest, setLatest] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    if (!loadingQuestions && questions.length > 0) {
      setSelectedQuestionId(questions[0].id)
    }
  }, [loadingQuestions, questions])

  const selectedQuestion = useMemo(() => {
    return questions.find((item) => item.id === selectedQuestionId) || null
  }, [selectedQuestionId, questions])

  const wordCount = useMemo(() => {
    if (!answer) {
      return 0
    }
    return answer.trim().split(/\s+/).filter(Boolean).length
  }, [answer])

  const loadHistory = () => {
    setHistoryLoading(true)
    axios.get("/api/submissions").then((res) => {
      setHistory(res.data.data || [])
    }).catch(() => {
      setHistory([])
    }).finally(() => setHistoryLoading(false))
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleSubmit = () => {
    if (!selectedQuestion || !answer.trim()) {
      return
    }
    setSubmitting(true)
    axios.post("/api/submissions", { promptId: selectedQuestion.id, answerText: answer }).then((res) => {
      const submission = res.data?.data
      if (submission) {
        setLatest(submission)
        setDetail(submission)
        setAnswer("")
        loadHistory()
      }
    }).catch(() => {
      setLatest(null)
    }).finally(() => setSubmitting(false))
  }

  const handleHistorySelect = (item) => {
    setDetail({ ...item })
    axios.get(`/api/submissions/${item.id}`).then((res) => {
      setDetail(res.data.data)
    }).catch(() => {})
  }

  return (
    <div className="app-shell">
      <div className="app-title">雅思写作练习</div>
      <div className="app-subtitle">练习表达 提升评分 追踪进步</div>
      <div className="grid">
        <div className="card">
          <div className="section-title">写作练习</div>
          {loadingQuestions ? <div className="loading">加载题目</div> : null}
          {!loadingQuestions && selectedQuestion ? (
            <>
              <div className="question-text">{selectedQuestion.title}</div>
              <textarea className="textarea" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="开始写作，建议字数不少于250词" />
              <div className="meta-bar">
                <div className="meta">字数 {wordCount} words</div>
                <div className="meta">题库 {questions.length} 题</div>
              </div>
              <div className="actions">
                <button className="button-primary" disabled={submitting || !answer.trim()} onClick={handleSubmit}>{submitting ? "提交中" : "提交"}</button>
                <button className="button-secondary" onClick={loadHistory}>查看历史</button>
              </div>
            </>
          ) : null}
        </div>
        <ScorePanel submission={latest} loading={submitting} />
      </div>
      <div style={{ marginTop: 32 }}>
        <HistoryPanel items={history} onSelect={handleHistorySelect} selected={detail} loading={historyLoading} />
      </div>
    </div>
  )
}

export default App

