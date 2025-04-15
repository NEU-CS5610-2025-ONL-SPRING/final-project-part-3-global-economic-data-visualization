import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function EditSubscriptionPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [countryCode, setCountryCode] = useState('')
    const [note, setNote] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // 拉取订阅详情
        fetch(`${import.meta.env.VITE_API_BASE_URL}/subscriptions/${id}`, {
            credentials: 'include'
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json()
                    throw new Error(errData.error || 'Failed to get subscription')
                }
                return res.json()
            })
            .then((sub) => {
                setCountryCode(sub.country_code)
                setNote(sub.note || '')
            })
            .catch((err) => setError(err.message))
    }, [id])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        fetch(`${import.meta.env.VITE_API_BASE_URL}/subscriptions/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                country_code: countryCode,
                note
            })
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json()
                    throw new Error(errData.error || 'Failed to update')
                }
            })
            .then(() => {
                navigate('/subscriptions')
            })
            .catch((err) => setError(err.message))
    }

    if (!id) {
        return <div>Invalid ID</div>
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Edit Subscription (ID: {id})</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Country Code:</label>
                    <input
                        type="text"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                    />
                </div>
                <div>
                    <label>Note (optional):</label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
                <button type="submit">Update</button>
                <button type="button" onClick={() => navigate('/subscriptions')}>
                    Back
                </button>
            </form>
        </div>
    )
}