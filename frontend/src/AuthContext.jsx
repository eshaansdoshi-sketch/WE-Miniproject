import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const STATUS = {
  NONE: 'none', UPLOADED: 'uploaded', SCREENED: 'screened',
  REJECTED: 'rejected', TESTING: 'testing', COMPLETE: 'complete',
}

const mapStatus = (s) => ({
  applied: STATUS.UPLOADED, qualified: STATUS.SCREENED, rejected: STATUS.REJECTED,
  interview: STATUS.TESTING, hired: STATUS.COMPLETE, uploaded: STATUS.UPLOADED,
  screened: STATUS.SCREENED, testing: STATUS.TESTING, complete: STATUS.COMPLETE,
}[s?.toLowerCase()] || STATUS.NONE)

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [userRole, setUserRole]       = useState(null)
  const [candidateData, setCandidateData] = useState(null)
  const [loading, setLoading]         = useState(true)

  const getToken = () => localStorage.getItem('hirrd_token')

  const loadCandidateData = useCallback(async (userId) => {
    if (!userId) return null
    try {
      const token = getToken()
      const res = await fetch(`${API}/api/candidates/by-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const candidate = await res.json()
      if (candidate && candidate._id) {
        const data = {
          authUserId: userId, candidateId: candidate._id,
          status: mapStatus(candidate.status), rawStatus: candidate.status,
          selectedRoleId: candidate.roleId || null,
          selectedRoleName: candidate.role_name || null,
          adminNotes: candidate.adminNotes || null,
          finalScore: candidate.resumeScore || null,
        }
        setCandidateData(data); return data
      }
      const empty = { authUserId: userId, candidateId: null, status: STATUS.NONE, selectedRoleId: null, selectedRoleName: null }
      setCandidateData(empty); return empty
    } catch {
      const fallback = { authUserId: userId, candidateId: null, status: STATUS.NONE }
      setCandidateData(fallback); return fallback
    }
  }, [])

  // Restore session from token on mount
  useEffect(() => {
    const restore = async () => {
      const token = getToken()
      if (!token) { setLoading(false); return }
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('expired')
        const { user: u } = await res.json()
        setUser({ ...u, id: u.id })
        setUserRole(u.role)
        if (u.role === 'applicant') await loadCandidateData(u.id)
      } catch {
        localStorage.removeItem('hirrd_token')
      } finally { setLoading(false) }
    }
    restore()
  }, [loadCandidateData])

  const signUp = async (email, password, name = '', role = 'applicant') => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || email, email, password, role }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    localStorage.setItem('hirrd_token', data.token)
    setUser({ ...data.user, id: data.user.id })
    setUserRole(data.user.role)
    return data
  }

  const signIn = async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    localStorage.setItem('hirrd_token', data.token)
    setUser({ ...data.user, id: data.user.id })
    setUserRole(data.user.role)
    if (data.user.role === 'applicant') await loadCandidateData(data.user.id)
    return data
  }

  const signOut = () => {
    localStorage.removeItem('hirrd_token')
    setUser(null); setUserRole(null); setCandidateData(null)
  }

  const updateCandidateData = (updates) => {
    setCandidateData(prev => prev ? { ...prev, ...updates } : updates)
  }

  const resetForNewRole = () => {
    setCandidateData(prev => {
      if (!prev || prev.status !== STATUS.REJECTED) return prev
      return { ...prev, selectedRoleId: null, selectedRoleName: null, candidateId: null, status: STATUS.NONE }
    })
  }

  return (
    <AuthContext.Provider value={{
      user, userRole, loading,
      signUp, signIn, signOut,
      isAdmin: userRole === 'admin' || userRole === 'hr_admin',
      isApplicant: userRole === 'applicant',
      candidateData, updateCandidateData, resetForNewRole, loadCandidateData,
      clearCandidateData: () => setCandidateData(null),
      STATUS,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
