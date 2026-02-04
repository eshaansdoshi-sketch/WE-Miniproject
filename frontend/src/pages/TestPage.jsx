import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { getCandidateTests, submitTest } from '../api'
import LoadingSpinner from '../components/ui/LoadingSpinner'

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
            <div style={{ textAlign: 'center', marginTop: 50 }}>
                <LoadingSpinner />
                <h2 style={{ marginTop: 20 }}>Loading Tests...</h2>
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
    const answeredCount = currentTest.questions.filter((q, i) => answers[q.question_id || `q_${i}`]).length
    const totalQuestions = currentTest.questions.length

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>
                        {currentTest.test_id.replace(/_/g, ' ').replace('v1', '')}
                    </h1>
                    <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                        Test {currentTestIndex + 1} of {tests.length}
                    </p>
                </div>
                {timeLeft !== null && (
                    <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: timeLeft < 60 ? '#ef4444' : '#0f172a',
                        background: timeLeft < 60 ? '#fee2e2' : '#f1f5f9',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <span>⏱</span> {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>
                    <span>Progress</span>
                    <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${(answeredCount / totalQuestions) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {currentTest.questions.map((q, i) => {
                    // Fallback to index if question_id is missing or duplicate
                    const safeId = q.question_id || `q_${i}`;

                    return (
                        <div key={safeId} className="card" style={{
                            padding: '24px',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            background: '#ffffff'
                        }}>
                            <h4 style={{
                                margin: '0 0 16px',
                                fontSize: '1.1rem',
                                color: '#1e293b',
                                lineHeight: '1.5'
                            }}>
                                <span style={{ color: '#8b5cf6', marginRight: '8px' }}>{i + 1}.</span>
                                {q.question_text}
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {q.options.map((option, j) => {
                                    const isSelected = answers[safeId] === option;
                                    return (
                                        <label
                                            key={j}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                border: `2px solid ${isSelected ? '#8b5cf6' : '#e2e8f0'}`,
                                                background: isSelected ? '#f5f3ff' : '#ffffff',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.borderColor = '#cbd5e1';
                                                e.currentTarget.style.background = isSelected ? '#f5f3ff' : '#f8fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.borderColor = '#e2e8f0';
                                                e.currentTarget.style.background = isSelected ? '#f5f3ff' : '#ffffff';
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name={`${currentTest.test_id}_q_${i}`} // Unique name per question
                                                checked={isSelected}
                                                onChange={() => handleAnswerChange(safeId, option)}
                                                style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    accentColor: '#8b5cf6',
                                                    marginRight: '12px'
                                                }}
                                            />
                                            <span style={{ color: isSelected ? '#4c1d95' : '#475569', fontWeight: isSelected ? '500' : '400' }}>
                                                {option}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer / Actions */}
            <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {answeredCount < totalQuestions ? (
                        <span>⚠ {totalQuestions - answeredCount} questions remaining</span>
                    ) : (
                        <span style={{ color: '#10b981', fontWeight: '500' }}>✓ All questions answered</span>
                    )}
                </div>

                <button
                    onClick={() => submitCurrentTest()}
                    disabled={answeredCount < totalQuestions || submitting}
                    className="btn-primary" // Assuming global class exists, or use style
                    style={{
                        padding: '12px 32px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        background: answeredCount < totalQuestions ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: answeredCount < totalQuestions || submitting ? 'not-allowed' : 'pointer',
                        boxShadow: answeredCount < totalQuestions ? 'none' : '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                        opacity: submitting ? 0.8 : 1
                    }}
                >
                    {submitting ? 'Submitting...' : (
                        currentTestIndex >= tests.length - 1 ? 'Finish Assessment' : 'Next Section →'
                    )}
                </button>
            </div>
        </div>
    )
}

export default TestPage
