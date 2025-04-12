import React, { useState } from "react"

function CreateIndicatorPage() {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
      setCode('')
      setName('')
      setDescription('')
    } catch (error) {
      console.error(error)
      setMessage('Error occurred.')
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
          />
        </div>
        <div>
          <label>Name: </label>
          <input 
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Description: </label>
          <input 
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Create</button>
      </form>
      <p>{message}</p>
    </div>
  )
}

export default CreateIndicatorPage
