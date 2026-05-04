import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import {
    LayoutDashboard, FileText, Briefcase, User,
    CheckCircle, Award, ArrowRight
} from 'lucide-react'

// ── Hardcoded tests ──────────────────────────────────────────
const HARDCODED_TESTS = [
    {
        test_id: 'react_v1',
        skill: 'React',
        questions: [
            {
                question_id: 'r1',
                question_text: 'What hook is used to manage side effects in a React functional component?',
                options: ['A. useState', 'B. useEffect', 'C. useReducer', 'D. useMemo'],
                correct_answer: 'B. useEffect'
            },
            {
                question_id: 'r2',
                question_text: 'What does the Virtual DOM do in React?',
                options: [
                    'A. Replaces the real DOM entirely',
                    'B. Creates a lightweight copy of the DOM for efficient diffing',
                    'C. Stores component data in the browser cache',
                    'D. Enables server-side rendering only'
                ],
                correct_answer: 'B. Creates a lightweight copy of the DOM for efficient diffing'
            },
            {
                question_id: 'r3',
                question_text: 'Which method is used to pass data from a parent to a child component?',
                options: ['A. state', 'B. context', 'C. props', 'D. refs'],
                correct_answer: 'C. props'
            },
            {
                question_id: 'r4',
                question_text: 'What is the purpose of React.memo()?',
                options: [
                    'A. To create memoized selectors',
                    'B. To prevent unnecessary re-renders by memoizing the component',
                    'C. To cache API responses',
                    'D. To store state in memory'
                ],
                correct_answer: 'B. To prevent unnecessary re-renders by memoizing the component'
            },
            {
                question_id: 'r5',
                question_text: 'In React, what is the correct way to update state based on the previous state?',
                options: [
                    'A. setState(newValue)',
                    'B. setState(prev => prev + 1)',
                    'C. this.state = newValue',
                    'D. state.update(newValue)'
                ],
                correct_answer: 'B. setState(prev => prev + 1)'
            },
        ]
    },
    {
        test_id: 'nodejs_v1',
        skill: 'Node.js',
        questions: [
            {
                question_id: 'n1',
                question_text: 'Which module is used to create an HTTP server in Node.js?',
                options: ['A. fs', 'B. http', 'C. path', 'D. os'],
                correct_answer: 'B. http'
            },
            {
                question_id: 'n2',
                question_text: 'What is the event loop in Node.js?',
                options: [
                    'A. A loop that iterates over all files',
                    'B. A mechanism that handles asynchronous callbacks',
                    'C. A debugging tool',
                    'D. A package manager'
                ],
                correct_answer: 'B. A mechanism that handles asynchronous callbacks'
            },
            {
                question_id: 'n3',
                question_text: 'Which of the following is NOT a core Node.js module?',
                options: ['A. express', 'B. fs', 'C. path', 'D. crypto'],
                correct_answer: 'A. express'
            },
            {
                question_id: 'n4',
                question_text: 'What does "npm" stand for?',
                options: [
                    'A. Node Package Manager',
                    'B. Node Process Monitor',
                    'C. New Programming Module',
                    'D. Network Protocol Manager'
                ],
                correct_answer: 'A. Node Package Manager'
            },
            {
                question_id: 'n5',
                question_text: 'How do you read a file asynchronously in Node.js?',
                options: [
                    'A. fs.readFileSync()',
                    'B. fs.readFile()',
                    'C. fs.open()',
                    'D. fs.read()'
                ],
                correct_answer: 'B. fs.readFile()'
            },
        ]
    },
    {
        test_id: 'mongodb_v1',
        skill: 'MongoDB',
        questions: [
            {
                question_id: 'm1',
                question_text: 'What type of database is MongoDB?',
                options: ['A. Relational', 'B. Document-oriented NoSQL', 'C. Graph', 'D. Key-value'],
                correct_answer: 'B. Document-oriented NoSQL'
            },
            {
                question_id: 'm2',
                question_text: 'Which command is used to insert a document in MongoDB?',
                options: ['A. db.collection.add()', 'B. db.collection.insertOne()', 'C. db.collection.push()', 'D. db.collection.create()'],
                correct_answer: 'B. db.collection.insertOne()'
            },
            {
                question_id: 'm3',
                question_text: 'What is a MongoDB collection equivalent to in SQL?',
                options: ['A. Database', 'B. Table', 'C. Row', 'D. Index'],
                correct_answer: 'B. Table'
            },
            {
                question_id: 'm4',
                question_text: 'Which operator is used for "greater than" in MongoDB queries?',
                options: ['A. $gt', 'B. $greater', 'C. $more', 'D. $above'],
                correct_answer: 'A. $gt'
            },
            {
                question_id: 'm5',
                question_text: 'What is the default port for MongoDB?',
                options: ['A. 3306', 'B. 5432', 'C. 27017', 'D. 8080'],
                correct_answer: 'C. 27017'
            },
        ]
    },
]

function TestPage() {
    const { candidateData, updateCandidateData, STATUS } = useAuth()
    const navigate = useNavigate()

    const [currentTestIndex, setCurrentTestIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [result, setResult] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [allDone, setAllDone] = useState(false)
    const [finalScore, setFinalScore] = useState(null)

    const menuItems = [
        { label: 'My Status', path: '/applicant/dashboard', icon: LayoutDashboard },
        { label: 'Upload Resume', path: '/applicant/upload', icon: FileText },
        { label: 'Browse Jobs', path: '/applicant/jobs', icon: Briefcase },
        { label: 'My Profile', path: '/applicant/profile', icon: User },
    ]

    const handleAnswerChange = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }))
    }

    const scoreTest = (test) => {
        let correct = 0
        test.questions.forEach(q => {
            if (answers[q.question_id] === q.correct_answer) correct++
        })
        return Math.round((correct / test.questions.length) * 100)
    }

    const submitCurrentTest = () => {
        const currentTest = HARDCODED_TESTS[currentTestIndex]
        setSubmitting(true)

        setTimeout(() => {
            const score = scoreTest(currentTest)
            const isLast = currentTestIndex >= HARDCODED_TESTS.length - 1

            setResult({ success: true, score })

            if (isLast) {
                // Calculate average across all tests
                const totalScore = Math.round((score + 78 + 82) / 3) // simulated avg
                setFinalScore(totalScore)
                setAllDone(true)
                updateCandidateData({ status: STATUS.COMPLETE, finalScore: totalScore })
            }
            setSubmitting(false)
        }, 800)
    }

    const nextTest = () => {
        setCurrentTestIndex(prev => prev + 1)
        setAnswers({})
        setResult(null)
    }

    // Completed state
    if (candidateData?.status === STATUS.COMPLETE || allDone) {
        return (
            <DashboardLayout title="Assessment Complete" menuItems={menuItems} sidebarTitle="Candidate Portal">
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '2rem 0' }}>
                    <div className="card" style={{ padding: '3rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)', width: 80, height: 80,
                            borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                            <Award size={40} />
                        </div>
                        <h2 style={{ color: '#1e293b', marginTop: 0 }}>🎉 All Assessments Complete!</h2>
                        {(finalScore || candidateData?.finalScore) && (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '12px 24px', borderRadius: '999px',
                                background: '#f0fdf4', border: '1px solid #bbf7d0',
                                color: '#166534', fontWeight: '600', fontSize: '1.1rem', margin: '1rem 0'
                            }}>
                                <Award size={20} />
                                Interview Readiness: {finalScore || candidateData?.finalScore}%
                            </div>
                        )}
                        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6 }}>
                            Your assessments are complete. Our team will review your results and contact you soon.
                        </p>
                        <button onClick={() => navigate('/applicant/dashboard')} className="btn btn-primary mt-4"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            View Dashboard <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    // No candidate data
    if (!candidateData?.candidateId) {
        return (
            <DashboardLayout title="Skill Tests" menuItems={menuItems} sidebarTitle="Candidate Portal">
                <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                    <Briefcase size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                    <h2>Complete Previous Steps</h2>
                    <p style={{ color: '#64748b' }}>Please upload your resume and pass screening before taking tests.</p>
                    <button onClick={() => navigate('/applicant')} className="btn btn-primary mt-4">
                        Start Application
                    </button>
                </div>
            </DashboardLayout>
        )
    }

    // Between tests — show score
    if (result?.success && currentTestIndex < HARDCODED_TESTS.length - 1) {
        return (
            <DashboardLayout title="Test Complete" menuItems={menuItems} sidebarTitle="Candidate Portal">
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '2rem 0' }}>
                    <div className="card" style={{ padding: '3rem' }}>
                        <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                        <h2 style={{ color: '#166534' }}>✓ Test Complete!</h2>
                        <div style={{
                            display: 'inline-block', padding: '12px 24px', borderRadius: '999px',
                            background: '#dcfce7', color: '#166534', fontWeight: '700', fontSize: '1.5rem', margin: '1rem 0'
                        }}>
                            {result.score}%
                        </div>
                        <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
                            {HARDCODED_TESTS.length - currentTestIndex - 1} more test(s) remaining.
                        </p>
                        <button onClick={nextTest} className="btn btn-primary"
                            style={{ padding: '12px 28px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            Next Test <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    // Show questions
    const currentTest = HARDCODED_TESTS[currentTestIndex]
    const answeredCount = currentTest.questions.filter(q => answers[q.question_id]).length
    const totalQuestions = currentTest.questions.length

    return (
        <DashboardLayout
            title={`Skill Test: ${currentTest.skill}`}
            subtitle={`Test ${currentTestIndex + 1} of ${HARDCODED_TESTS.length}`}
            menuItems={menuItems}
            sidebarTitle="Candidate Portal"
        >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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

                {/* Questions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {currentTest.questions.map((q, i) => (
                        <div key={q.question_id} className="card" style={{
                            padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', background: '#ffffff'
                        }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#1e293b', lineHeight: '1.5' }}>
                                <span style={{ color: '#8b5cf6', marginRight: '8px' }}>{i + 1}.</span>
                                {q.question_text}
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {q.options.map((option, j) => {
                                    const isSelected = answers[q.question_id] === option
                                    return (
                                        <label key={j} style={{
                                            display: 'flex', alignItems: 'center', padding: '12px 16px',
                                            borderRadius: '8px', border: `2px solid ${isSelected ? '#8b5cf6' : '#e2e8f0'}`,
                                            background: isSelected ? '#f5f3ff' : '#ffffff', cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            <input type="radio" name={`q_${q.question_id}`} checked={isSelected}
                                                onChange={() => handleAnswerChange(q.question_id, option)}
                                                style={{ width: '18px', height: '18px', accentColor: '#8b5cf6', marginRight: '12px' }} />
                                            <span style={{ color: isSelected ? '#4c1d95' : '#475569', fontWeight: isSelected ? '500' : '400' }}>
                                                {option}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '40px', padding: '20px', borderTop: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        {answeredCount < totalQuestions ? (
                            <span>⚠ {totalQuestions - answeredCount} questions remaining</span>
                        ) : (
                            <span style={{ color: '#10b981', fontWeight: '500' }}>✓ All questions answered</span>
                        )}
                    </div>
                    <button
                        onClick={submitCurrentTest}
                        disabled={answeredCount < totalQuestions || submitting}
                        style={{
                            padding: '12px 32px', fontSize: '1rem', fontWeight: '600',
                            background: answeredCount < totalQuestions ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white', border: 'none', borderRadius: '8px',
                            cursor: answeredCount < totalQuestions || submitting ? 'not-allowed' : 'pointer',
                            boxShadow: answeredCount < totalQuestions ? 'none' : '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                            opacity: submitting ? 0.8 : 1
                        }}
                    >
                        {submitting ? 'Submitting...' : (
                            currentTestIndex >= HARDCODED_TESTS.length - 1 ? 'Finish Assessment' : 'Submit & Next →'
                        )}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default TestPage
