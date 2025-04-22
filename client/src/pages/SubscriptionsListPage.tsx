// @ts-ignore
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SubscriptionItem {
    id: number
    user_id: number
    indicator_id: number
    country_code: string
    note?: string | null
    created_at: string
    updated_at: string
}

export default function SubscriptionsListPage() {
    const [subs, setSubs] = useState<SubscriptionItem[]>([])
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        // Using hardcoded URL like in the IndicatorsListPage
        fetch('http://localhost:3001/api/subscriptions', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(async (res) => {
                const contentType = res.headers.get('content-type')
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await res.text()
                    console.error('non-json:', text)
                    throw new Error('Server returned non-JSON data')
                }

                if (!res.ok) {
                    const errData = await res.json()
                    throw new Error(errData.error || 'Failed to fetch')
                }
                return res.json()
            })
            .then((data) => {
                setSubs(data)
            })
            .catch((err) => {
                console.error('Fetch subscriptions error:', err)
                setError(err.message)
            })
    }, [])

    const handleDetail = (id: number) => {
        navigate(`/subscriptions/detail/${id}`)
    }

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure to delete?')) return

        // Using hardcoded URL like in the IndicatorsListPage
        fetch(`http://localhost:3001/api/subscriptions/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(async (res) => {
                const contentType = res.headers.get('content-type')
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await res.text()
                    console.error('non-json:', text)
                    throw new Error('Server returned non-JSON data')
                }

                if (!res.ok) {
                    const errData = await res.json()
                    throw new Error(errData.error || 'Delete failed')
                }
                setSubs((prev) => prev.filter((sub) => sub.id !== id))
            })
            .catch((err) => {
                alert(err.message)
            })
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Subscriptions List</h2>
            <button onClick={() => navigate('/subscriptions/create')}>
                Create Subscription
            </button>
            {subs.length === 0 ? (
                <p>No subscriptions yet.</p>
            ) : (
                <table border={1} cellPadding={6} style={{ marginTop: '1rem' }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Indicator ID</th>
                        <th>Country Code</th>
                        <th>Note</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {subs.map((s) => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.indicator_id}</td>
                            <td>{s.country_code}</td>
                            <td>{s.note || ''}</td>
                            <td>
                                <button onClick={() => navigate(`/subscriptions/edit/${s.id}`)}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(s.id)}>Delete</button>
                                <button onClick={() => handleDetail(s.id)}>Detail</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}