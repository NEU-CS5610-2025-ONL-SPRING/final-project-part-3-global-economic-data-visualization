import React, { useState } from 'react'

const LogoutButton: React.FC = () => {
    const [message, setMessage] = useState('')

    const handleLogout = async () => {
        try {
            const res = await fetch('api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            })
            if (!res.ok) {
                const errorData = await res.json()
                setMessage('Logout failed: ' + (errorData.error || 'Unknown error'))
                return
            }
            setMessage('Logout successful!')
        } catch (error) {
            console.error(error)
            setMessage('Error occurred during logout.')
        }
    }

    return (
        <div style={{ display: 'inline-block', marginLeft: '1rem' }}>
            <button onClick={handleLogout}>Logout</button>
            {message && <span style={{ marginLeft: '1rem' }}>{message}</span>}
        </div>
    )
}

export default LogoutButton