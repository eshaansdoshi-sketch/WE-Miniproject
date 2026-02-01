import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, STATUS } from '../UserContext'
import { getCandidateTests, submitTest } from '../api'

function TestPage() {
    const { user, updateUser } = useUser()
    const navigate = useNavigate()

    const [tests, setTests] = useState([])
    const [currentTestIndex, setCurrentTestIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    // Load tests on mount - simple and direct
    useEffect(() => {
        if (!user?.candidateId || !user?.selectedRoleId) {
            setLoading(false)
            if (user?.candidateId && !user?.selectedRoleId) {
                setError('No job role selected. Please select a role first.')
            }
            return
        }

        console.log('[TestPage] Starting to fetch tests for:', user.candidateId, 'role:', user.selectedRoleId)

        getCandidateTests(user.candidateId, user.selectedRoleId)
            .then(data => {
                console.log('[TestPage] Received response:', data)

                if (data.success && data.tests?.length > 0) {
                    console.log('[TestPage] Setting tests:', data.tests.length, 'tests')
                    setTests(data.tests)
                    updateUser({ status: STATUS.TESTING })
                } else {
                    console.log('[TestPage] No tests found')
                    setError(data.message || 'No tests available for this role.')
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
    }, [user?.candidateId, user?.selectedRoleId])

    const handleAnswerChange = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }))
    }

    const submitCurrentTest = async () => {
        const currentTest = tests[currentTestIndex]
        const testAnswers = currentTest.questions.map(q => ({
            question_id: q.question_id,
            selected_option: answers[q.question_id] || ''
        }))

        setSubmitting(true)

        try {
            const data = await submitTest(user.candidateId, currentTest.test_id, testAnswers)
            console.log('[TestPage] Submit result:', data)
            setResult(data)

            if (data.success && currentTestIndex >= tests.length - 1) {
                updateUser({
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

    // No user
    if (!user?.candidateId) {
        return (
            <div>
                <h1>Skill Tests</h1>
                <p>Please upload your resume first.</p>
                <button onClick={() => navigate('/')}>← Start</button>
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
                <button onClick={() => navigate('/screen')}>← Back to Screening</button>
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
                    <p><strong>Status:</strong> {result.status}</p>
                </div>
                <button onClick={() => navigate('/hr')} style={{ marginTop: 20 }}>Dashboard →</button>
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
            <h1>Test: {currentTest.test_id.replace(/_/g, ' ').replace('v1', '')}</h1>

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
