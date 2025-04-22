import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

function CreateIndicatorPage() {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('http://localhost:3001/api/indicators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, name, description })
      })

      if (!res.ok) {
        const errorData = await res.json()
        setMessage('Failed to create indicator: ' + (errorData.error || 'Unknown error'))
        return
      }

      const data = await res.json()
      setMessage(`Created! ID = ${data.indicator.id}, Code = ${data.indicator.code}`)

      // Clear form
      setCode('')
      setName('')
      setDescription('')

      // Navigate back to list after 1.5 seconds
      setTimeout(() => {
        navigate('/indicators')
      }, 1500)
    } catch (error) {
      console.error(error)
      setMessage('Error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <div>
        <h2>Create New Indicator</h2>
        <form onSubmit={handleCreate}>
          <div>
            <label>Code: </label>
            <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                maxLength={50}
            />
          </div>
          <div>
            <label>Name: </label>
            <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                maxLength={100}
            />
          </div>
          <div>
            <label>Description: </label>
            <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={500}
            />
          </div>
          <div>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
            <button
                type="button"
                onClick={() => navigate('/indicators')}
                style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          </div>
        </form>
        {message && <p>{message}</p>}
      </div>
  )
}

export default CreateIndicatorPage