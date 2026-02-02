import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCandidateByUserId } from './api'

const UserContext = createContext(null)

// Status flow: upload -> screening -> tests -> complete
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
        'uploaded': STATUS.UPLOADED,
        'screened': STATUS.SCREENED,
        'testing': STATUS.TESTING,
        'complete': STATUS.COMPLETE,
    }
    return statusMap[backendStatus?.toLowerCase()] || STATUS.NONE
}

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)

    // Load candidate data from backend for a specific auth user
    const loadCandidateFromBackend = useCallback(async (authUserId) => {
        if (!authUserId) {
            console.log('[UserContext] No authUserId provided, skipping load')
            return null
        }

        console.log('[UserContext] Loading candidate for authUserId:', authUserId)
        setLoading(true)

        try {
            const candidate = await getCandidateByUserId(authUserId)

            if (candidate && candidate.id) {
                console.log('[UserContext] Found candidate:', candidate.id, 'status:', candidate.status)

                const userData = {
                    authUserId,
                    candidateId: candidate.id,
                    status: mapBackendStatus(candidate.status),
                    selectedRoleId: candidate.role_id || null,
                    selectedRoleName: null, // Will be fetched if needed
                    qualified: candidate.qualified || null,
                    feedback: candidate.feedback || null,
                    finalScore: candidate.resume_score || null,
                }

                setUser(userData)
                return userData
            } else {
                console.log('[UserContext] No candidate found, treating as new applicant')
                // New applicant - minimal state with auth user ID
                const newUserData = {
                    authUserId,
                    candidateId: null,
                    status: STATUS.NONE,
                    selectedRoleId: null,
                    selectedRoleName: null,
                    qualified: null,
                    feedback: null,
                    finalScore: null,
                }
                setUser(newUserData)
                return newUserData
            }
        } catch (err) {
            console.error('[UserContext] Error loading candidate:', err)
            // On error, still set minimal state so app can proceed
            const errorUserData = {
                authUserId,
                candidateId: null,
                status: STATUS.NONE,
                selectedRoleId: null,
                selectedRoleName: null,
            }
            setUser(errorUserData)
            return errorUserData
        } finally {
            setLoading(false)
        }
    }, [])

    // Clear all candidate state (call on logout)
    const clearCandidateState = useCallback(() => {
        console.log('[UserContext] Clearing all candidate state')
        setUser(null)
        // Also clear any localStorage that might exist from old versions
        localStorage.removeItem('hiring_user')
    }, [])

    const updateUser = (updates) => {
        setUser(prev => {
            if (!prev) {
                // If no user exists, create one with updates
                return updates
            }
            return { ...prev, ...updates }
        })
    }

    // Reset for applying to a different role (only for rejected candidates)
    // This clears role/candidate info but preserves the auth user
    const resetForNewRole = () => {
        setUser(prev => {
            if (!prev) return null
            // Only allow if status is rejected
            if (prev.status !== STATUS.REJECTED) {
                console.warn('resetForNewRole called but status is not rejected')
                return prev
            }
            // Clear role selection and candidate data, reset status
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
        setUser,
        updateUser,
        resetForNewRole, // Only for rejected candidates applying for different role
        loadCandidateFromBackend, // Call after auth login
        clearCandidateState, // Call on logout
        loading,
        STATUS,
    }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within UserProvider')
    }
    return context
}

export { STATUS }
