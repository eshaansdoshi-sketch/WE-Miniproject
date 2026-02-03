import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { getCandidateTests, submitTest } from '../api'

function TestPage() {
    const { candidateData, updateCandidateData, STATUS } = useAuth()
    const navigate = useNavigate()

    const [tests, setTests] = useState([])
    const [currentTestIndex, setCurrentTestIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [timeLeft, setTimeLeft] = useState(null) // in seconds

    // Load tests on mount - simple and direct
    useEffect(() => {
        if (!candidateData?.candidateId || !candidateData?.selectedRoleId) {
            setLoading(false)
            if (candidateData?.candidateId && !candidateData?.selectedRoleId) {
                setError('No job role selected. Please select a role first.')
            }
            return
        }

        console.log('[TestPage] Starting to fetch tests for:', candidateData.candidateId, 'role:', candidateData.selectedRoleId)

        getCandidateTests(candidateData.candidateId, candidateData.selectedRoleId)
            .then(data => {
                console.log('[TestPage] Received response:', data)

                if (data.success && data.tests?.length > 0) {
                    console.log('[TestPage] Setting tests:', data.tests.length, 'tests')
                    setTests(data.tests)
                    updateCandidateData({ status: STATUS.TESTING })

                    // Set timer if provided (convert minutes to seconds)
                    if (data.time_limit) {
                        setTimeLeft(data.time_limit * 60)
                    }
                } else {
                    console.log('[TestPage] No tests found')
                    setError(data.message || data.error || 'No tests available for this role.')
                }
            })
            .catch(err => {
                console.error('[TestPage] Fetch error:', err)
                setError('Failed to load tests: ' + err.message)
            })
            .finally(() => {
                console.log('[TestPage] Setting loading to false')
                setLoading(false)
            })
    }, [candidateData?.candidateId, candidateData?.selectedRoleId])

    // Timer effect
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleTimeUp()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    const handleTimeUp = async () => {
        // Auto-submit current test regardless of completion
        alert("Time's up! Submitting your current test and ending the session.")
        await submitCurrentTest(true) // Pass flag to indicate forced submission
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    const handleAnswerChange = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }))
    }

    const submitCurrentTest = async (forced = false) => {
        const currentTest = tests[currentTestIndex]
        const testAnswers = currentTest.questions.map(q => ({
            question_id: q.question_id,
            selected_option: answers[q.question_id] || ''
        }))

        setSubmitting(true)

        try {
            const data = await submitTest(candidateData.candidateId, currentTest.test_id, testAnswers)
            console.log('[TestPage] Submit result:', data)
            setResult(data)

            // If it's the last test OR forced (time up), finish
            if (data.success && (currentTestIndex >= tests.length - 1 || forced)) {
                updateCandidateData({
                    status: STATUS.COMPLETE,
                    finalScore: data.interview_readiness_score,
                })
            }
        } catch (err) {
            setError('Submit failed: ' + err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const nextTest = () => {
        setCurrentTestIndex(prev => prev + 1)
        setAnswers({})
        setResult(null)
    }

    // If completed, show completion message (no navigation allowed)
    if (candidateData?.status === STATUS.COMPLETE) {
        return (
            <div>
                <h1>🎉 Application Submitted</h1>
                <div style={{ padding: 20, background: '#e8f5e9', borderRadius: 8 }}>
                    <p className="success">✓ Your assessments are complete!</p>
                    {candidateData.finalScore && <p><strong>Interview Readiness Score:</strong> {candidateData.finalScore}%</p>}
                    <p style={{ marginTop: 15 }}>Our team will review your application and contact you soon.</p>
                </div>
            </div>
        )
    }

    // No user
    if (!candidateData?.candidateId) {
        return (
            <div>
                <h1>Skill Tests</h1>
                <p>Please complete the previous steps first.</p>
            </div>
        )
    }

    // Loading
    if (loading) {
        return (
            <div>
                <h1>Loading Tests...</h1>
                <p>Fetching your questions...</p>
            </div>
        )
    }

    // Error or no tests
    if (error || tests.length === 0) {
        return (
            <div>
                <h1>Skill Tests</h1>
                <p className="error">{error || 'No tests available.'}</p>
                {/* NO back navigation - one-time flow */}
            </div>
        )
    }

    // All complete
    if (result?.success && currentTestIndex >= tests.length - 1) {
        return (
            <div>
                <h1>🎉 All Tests Completed!</h1>
                <div style={{ padding: 20, background: '#e8f5e9', borderRadius: 8 }}>
                    <p><strong>Score:</strong> {result.score}%</p>
                    <p><strong>Interview Readiness:</strong> {result.interview_readiness_score}%</p>
                    <p style={{ marginTop: 15 }}>Your assessments are complete. Our team will contact you soon.</p>
                </div>
            </div>
        )
    }

    // Between tests
    if (result?.success) {
        return (
            <div>
                <h1>✓ Test Complete!</h1>
                <div style={{ padding: 20, background: '#e3f2fd', borderRadius: 8 }}>
                    <p><strong>Score:</strong> {result.score}%</p>
                    <p>{tests.length - currentTestIndex - 1} more test(s).</p>
                    <button onClick={nextTest} style={{ background: '#4caf50', marginTop: 15 }}>
                        Next Test →
                    </button>
                </div>
            </div>
        )
    }

    // Show questions
    const currentTest = tests[currentTestIndex]
    const answeredCount = currentTest.questions.filter(q => answers[q.question_id]).length
    const totalQuestions = currentTest.questions.length

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Test: {currentTest.test_id.replace(/_/g, ' ').replace('v1', '')}</h1>
                {timeLeft !== null && (
                    <div style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: timeLeft < 60 ? 'red' : '#333',
                        background: '#f5f5f5',
                        padding: '5px 15px',
                        borderRadius: 20
                    }}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            <div style={{ padding: 10, background: '#f0f0f0', borderRadius: 4, marginBottom: 20 }}>
                Test {currentTestIndex + 1}/{tests.length} | {answeredCount}/{totalQuestions} answered
            </div>

            {currentTest.questions.map((q, i) => (
                <div key={q.question_id} className="question">
                    <h4>Q{i + 1}: {q.question_text}</h4>
                    {q.options.map((option, j) => (
                        <label key={j} className="option">
                            <input
                                type="radio"
                                name={q.question_id}
                                checked={answers[q.question_id] === option}
                                onChange={() => handleAnswerChange(q.question_id, option)}
                            />
                            {' '}{option}
                        </label>
                    ))}
                </div>
            ))}

            <button
                onClick={submitCurrentTest}
                disabled={answeredCount < totalQuestions || submitting}
                style={{ padding: '12px 30px', marginTop: 20 }}
            >
                {submitting ? 'Submitting...' : 'Submit'}
            </button>

            {answeredCount < totalQuestions && (
                <p style={{ color: '#666', marginTop: 10 }}>{totalQuestions - answeredCount} questions remaining</p>
            )}
        </div>
    )
}

export default TestPage
