import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { getCandidateByUserId } from './api'

const AuthContext = createContext(null)

// Status constants (duplicated from UserContext to avoid circular deps)
const STATUS = {
    NONE: 'none',
    UPLOADED: 'uploaded',
    SCREENED: 'screened',
    REJECTED: 'rejected',
    TESTING: 'testing',
    COMPLETE: 'complete',
}

// Map backend status strings to frontend STATUS constants
const mapBackendStatus = (backendStatus) => {
    const statusMap = {
        'applied': STATUS.UPLOADED,
        'qualified': STATUS.SCREENED,
        'rejected': STATUS.REJECTED,
        'approved': STATUS.SCREENED,
        'interview': STATUS.TESTING,
        'hired': STATUS.COMPLETE,
        'completed': STATUS.COMPLETE, // Added for compatibility
        'uploaded': STATUS.UPLOADED,
        'screened': STATUS.SCREENED,
        'testing': STATUS.TESTING,
        'complete': STATUS.COMPLETE,
    }
    return statusMap[backendStatus?.toLowerCase()] || STATUS.NONE
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [userRole, setUserRole] = useState(null)
    const [candidateData, setCandidateData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Load candidate data from backend for the authenticated user
    const loadCandidateData = useCallback(async (userId) => {
        if (!userId) return null

        console.log('[AuthContext] Loading candidate data for user:', userId)
        try {
            const candidate = await getCandidateByUserId(userId)

            if (candidate && candidate.id) {
                console.log('[AuthContext] Found candidate:', candidate.id, 'status:', candidate.status)
                const data = {
                    authUserId: userId,
                    candidateId: candidate.id,
                    status: mapBackendStatus(candidate.status),
                    rawStatus: candidate.status, // Keep original for display
                    selectedRoleId: candidate.role_id || null,
                    selectedRoleName: candidate.role_name || null, // Now from backend
                    adminNotes: candidate.admin_notes || null, // Admin feedback
                    qualified: candidate.qualified || null,
                    feedback: candidate.feedback || null,
                    finalScore: candidate.resume_score || null,
                    appliedAt: candidate.applied_at || null,
                }
                setCandidateData(data)
                return data
            } else {
                console.log('[AuthContext] No candidate found, treating as new applicant')
                const data = {
                    authUserId: userId,
                    candidateId: null,
                    status: STATUS.NONE,
                    selectedRoleId: null,
                    selectedRoleName: null,
                }
                setCandidateData(data)
                return data
            }
        } catch (err) {
            console.error('[AuthContext] Error loading candidate:', err)
            const data = {
                authUserId: userId,
                candidateId: null,
                status: STATUS.NONE,
            }
            setCandidateData(data)
            return data
        }
    }, [])

    // Clear all candidate state
    const clearCandidateData = useCallback(() => {
        console.log('[AuthContext] Clearing candidate data')
        setCandidateData(null)
        // Clear any legacy localStorage
        localStorage.removeItem('hiring_user')
    }, [])

    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user)
                fetchUserRole(session.user.id)
                loadCandidateData(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('[AuthContext] Auth state changed, event:', _event)

            if (session?.user) {
                setUser(session.user)
                fetchUserRole(session.user.id)
                // Load candidate data for this specific user
                loadCandidateData(session.user.id)
            } else {
                setUser(null)
                setUserRole(null)
                // Clear candidate data on logout
                clearCandidateData()
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [loadCandidateData, clearCandidateData])

    const fetchUserRole = async (userId) => {
        try {
            // Check user_roles table for role
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .maybeSingle()

            if (data) {
                setUserRole(data.role)
            } else {
                // Default to applicant if no role found
                setUserRole('applicant')
            }
        } catch (err) {
            console.error('Error fetching role:', err)
            setUserRole('applicant')
        } finally {
            setLoading(false)
        }
    }

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    const signOut = async () => {
        // Clear candidate data BEFORE signing out
        clearCandidateData()

        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
        setUserRole(null)
    }

    // Update candidate data (for use by components after resume upload, etc.)
    const updateCandidateData = (updates) => {
        setCandidateData(prev => {
            if (!prev) return updates
            return { ...prev, ...updates }
        })
    }

    // Reset for new role application (rejected candidates only)
    const resetForNewRole = () => {
        setCandidateData(prev => {
            if (!prev) return null
            if (prev.status !== STATUS.REJECTED) {
                console.warn('resetForNewRole called but status is not rejected')
                return prev
            }
            return {
                ...prev,
                selectedRoleId: null,
                selectedRoleName: null,
                candidateId: null,
                status: STATUS.NONE,
                qualified: null,
                feedback: null,
                finalScore: null,
            }
        })
    }

    const value = {
        user,
        userRole,
        loading,
        signUp,
        signIn,
        signOut,
        isAdmin: userRole === 'admin',
        isApplicant: userRole === 'applicant',
        // Candidate session management
        candidateData,
        updateCandidateData,
        resetForNewRole,
        loadCandidateData,
        clearCandidateData,
        STATUS,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
