import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface SubscriptionItem {
    id: number
    user_id: number
    indicator_id: number
    country_code: string
    note?: string | null
    created_at: string
    updated_at: string
}

interface FormData {
    indicator_id: number
    country_code: string
    note: string
}

export function SubscriptionFormPage() {
    const { id } = useParams<{ id?: string }>()
    const navigate = useNavigate()
    const isEditMode = !!id && id !== 'new'

    const [form, setForm] = useState<FormData>({
        indicator_id: 0,
        country_code: '',
        note: ''
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {

        if (isEditMode) {
            setLoading(true)
            fetch(`${import.meta.env.VITE_API_BASE_URL}/subscriptions/${id}`, {
                method: 'GET',
                credentials: 'include'
            })
                .then(async (res) => {
                    if (!res.ok) {
                        const errData = await res.json()
                        throw new Error(errData.error || 'Failed to fetch subscription')
                    }
                    return res.json() as Promise<SubscriptionItem>
                })
                .then((data) => {
                    setForm({
                        indicator_id: data.indicator_id,
                        country_code: data.country_code,
                        note: data.note ?? ''
                    })
                })
                .catch((err) => {
                    console.error('Fetch subscription error:', err)
                    setError(err.message)
                })
                .finally(() => setLoading(false))
        }
    }, [id, isEditMode])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (!form.indicator_id || !form.country_code) {
            setError('Please fill required fields: indicator_id, country_code')
            setLoading(false)
            return
        }

        if (isEditMode) {
            // 调用 PUT /subscriptions/:id
            fetch(`${import.meta.env.VITE_API_BASE_URL}/subscriptions/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    country_code: form.country_code,
                    note: form.note
                })
            })
                .then(async (res) => {
                    if (!res.ok) {
                        const errData = await res.json()
                        throw new Error(errData.error || 'Failed to update')
                    }
                    return res.json()
                })
                .then(() => {
                    alert('Subscription updated successfully')
                    navigate('/subscriptions')
                })
                .catch((err) => {
                    setError(err.message)
                })
                .finally(() => setLoading(false))
        } else {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/subscriptions`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    indicator_id: form.indicator_id,
                    country_code: form.country_code,
                    note: form.note
                })
            })
                .then(async (res) => {
                    if (!res.ok) {
                        const errData = await res.json()
                        throw new Error(errData.error || 'Failed to create subscription')
                    }
                    return res.json()
                })
                .then(() => {
                    alert('Subscription created successfully')
                    navigate('/subscriptions')
                })
                .catch((err) => {
                    setError(err.message)
                })
                .finally(() => setLoading(false))
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2>{isEditMode ? 'Edit Subscription' : 'Create New Subscription'}</h2>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            {loading && <p>Loading...</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Indicator ID (number):</label>
                    <input
                        type="number"
                        name="indicator_id"
                        value={form.indicator_id}
                        disabled={isEditMode}
                        onChange={(e) => setForm((prev) => ({
                            ...prev,
                            indicator_id: Number(e.target.value)
                        }))}
                    />
                </div>

                <div>
                    <label>Country Code:</label>
                    <input
                        type="text"
                        name="country_code"
                        value={form.country_code}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Note (optional):</label>
                    <textarea
                        name="note"
                        rows={3}
                        value={form.note}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {isEditMode ? 'Update' : 'Create'}
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/subscriptions')}
                    style={{ marginLeft: '1rem' }}
                >
                    Back
                </button>
            </form>
        </div>
    )
}
