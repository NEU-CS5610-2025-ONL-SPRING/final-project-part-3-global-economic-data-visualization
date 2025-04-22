import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreateSubscriptionPage() {
    const navigate = useNavigate()
    const [indicatorId, setIndicatorId] = useState<number>(0)
    const [countryCode, setCountryCode] = useState('')
    const [note, setNote] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!indicatorId || !countryCode) {
            setError('Please fill in indicatorId and countryCode')
            return
        }

        fetch('http://localhost:3001/api/subscriptions', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                indicator_id: indicatorId,
                country_code: countryCode,
                note
            })
        })
            .then(async (res) => {
                const contentType = res.headers.get('content-type')
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await res.text()
                    console.error('Non-JSON response:', text)
                    throw new Error('Server returned a non-JSON response')
                }

                if (!res.ok) {
                    const errData = await res.json()
                    throw new Error(errData.error || 'Create failed')
                }

                navigate('/subscriptions')
            })
            .catch((err) => {
                setError(err.message)
            })
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Create Subscription</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Indicator ID:</label>
                    <input
                        type="number"
                        value={indicatorId}
                        onChange={(e) => setIndicatorId(Number(e.target.value))}
                    />
                </div>
                <div>
                    <label>Country Code:</label>
                    <input
                        type="text"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => navigate('/country-search')}
                        style={{ marginLeft: '0.5rem' }}
                    >
                        Search Country Code
                    </button>
                </div>
                <div>
                    <label>Note (optional):</label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
                <button type="submit">Create</button>
                <button type="button" onClick={() => navigate('/subscriptions')} style={{ marginLeft: '0.5rem' }}>
                    Back
                </button>
            </form>
        </div>
    )
}