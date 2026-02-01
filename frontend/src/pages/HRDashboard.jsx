import { useState } from 'react'
import { getHRCandidateSummary } from '../api'

function HRDashboard() {
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const loadCandidates = async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await getHRCandidateSummary()
            if (data.success) {
                setCandidates(data.candidates || [])
            } else {
                setError(data.error || 'Failed to load candidates')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusClass = (status) => {
        if (!status) return ''
        return 'status-' + status.toLowerCase()
    }

    return (
        <div>
            <h1>HR Dashboard</h1>

            <button onClick={loadCandidates} disabled={loading}>
                {loading ? 'Loading...' : 'Load Candidates'}
            </button>

            {error && <p className="error">Error: {error}</p>}

            {candidates.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Candidate ID</th>
                            <th>Resume Score</th>
                            <th>Qualified</th>
                            <th>Avg Test Score</th>
                            <th>Interview Readiness</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map(c => (
                            <tr key={c.candidate_id}>
                                <td style={{ fontSize: 12 }}>{c.candidate_id}</td>
                                <td>{c.resume_score}</td>
                                <td>{c.qualified ? '✓ Yes' : '✗ No'}</td>
                                <td>{c.avg_test_score ?? '-'}</td>
                                <td>{c.interview_readiness_score}</td>
                                <td className={getStatusClass(c.status)}>
                                    <strong>{c.status || 'Unknown'}</strong>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {candidates.length === 0 && !loading && !error && (
                <p style={{ color: '#666', marginTop: 20 }}>
                    Click "Load Candidates" to view all candidates.
                </p>
            )}
        </div>
    )
}

export default HRDashboard
