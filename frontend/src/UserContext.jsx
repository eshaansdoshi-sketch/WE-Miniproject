import { createContext, useContext, useState, useEffect } from 'react'

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

export function UserProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Load from localStorage on init
        const saved = localStorage.getItem('hiring_user')
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch {
                return null
            }
        }
        return null
    })

    // Save to localStorage whenever user changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('hiring_user', JSON.stringify(user))
        } else {
            localStorage.removeItem('hiring_user')
        }
    }, [user])

    const updateUser = (updates) => {
        setUser(prev => prev ? { ...prev, ...updates } : updates)
    }

    const resetUser = () => {
        setUser(null)
        localStorage.removeItem('hiring_user')
    }

    const value = {
        user,
        setUser,
        updateUser,
        resetUser,
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
