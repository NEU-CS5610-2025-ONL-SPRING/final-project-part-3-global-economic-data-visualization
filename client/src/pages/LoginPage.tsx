import { useNavigate } from 'react-router-dom'
import React, {useState} from "react";

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        try {
            const res = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            })

            if (!res.ok) {
                const errorData = await res.json()
                setMessage('Login failed: ' + (errorData.error || 'Unknown error'))
                return
            }

            const data = await res.json()
            setMessage('Login success! userId: ' + data.userId)

            navigate('/indicators')
        } catch (error) {
            console.error(error)
            setMessage('Error occurred. Check console.')
        }
    }

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email: </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <p>{message}</p>
        </div>
    )
}

export default LoginPage
