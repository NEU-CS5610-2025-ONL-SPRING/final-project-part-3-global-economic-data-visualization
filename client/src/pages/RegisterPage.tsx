import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      })

      if (!res.ok) {
        const errorData = await res.json()
        setMessage('Register failed: ' + (errorData.error || 'Unknown error'))
        return
      }

      const data = await res.json()
      setMessage('Register success! userId: ' + data.userId)

      // Add navigation to login page after successful registration
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      console.error(err)
      setMessage('Error occurred. Check console.')
    }
  }

  return (
      <div>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div>
            <label>Username: </label>
            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                required
            />
          </div>
          <div>
            <label>Email: </label>
            <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
            />
          </div>
          <div>
            <label>Password: </label>
            <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={6}
            />
          </div>
          <button type="submit">Register</button>
        </form>
        <p>{message}</p>
      </div>
  )
}

export default RegisterPage