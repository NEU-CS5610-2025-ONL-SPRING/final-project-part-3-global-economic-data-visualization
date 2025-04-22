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

export function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([])
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subscriptions`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(async (res) => {

                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {

                    const text = await res.text();
                    console.error('non-json:', text);
                    throw new Error('the server returned a non-json');
                }

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to fetch subscriptions');
                }
                return res.json();
            })
            .then((data) => {
                setSubscriptions(data);
            })
            .catch((err) => {
                console.error('Fetch subscriptions error:', err);
                setError(err.message);
            });
    }, []);

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure to delete this subscription?')) return

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subscriptions/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
            .then(async (res) => {
                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await res.text();
                    console.error('non-json:', text);
                    throw new Error('the server returned a non-json');
                }

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to delete');
                }

                setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
            })
            .catch((err) => {
                alert('Error: ' + err.message);
            });
    }

    const handleCreateNew = () => {
        navigate('/subscriptions/new');
    }

    const handleEdit = (id: number) => {
        navigate(`/subscriptions/edit/${id}`);
    }

    const handleViewDetail = (id: number) => {
        navigate(`/subscriptions/detail/${id}`);
    }

    if (error) {
        return (
            <div style={{ padding: '1rem' }}>
                <h1>My Subscriptions</h1>
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                    Error: {error}
                    <div>
                        <button onClick={() => setError(null)}>重试</button>
                        <button onClick={() => navigate('/')}>返回首页</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h1>My Subscriptions</h1>

            <button onClick={handleCreateNew}>Create New Subscription</button>

            {subscriptions.length === 0 ? (
                <p>No subscriptions found.</p>
            ) : (
                <table border={1} cellPadding={8} style={{ marginTop: '1rem' }}>
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
                    {subscriptions.map((sub) => (
                        <tr key={sub.id}>
                            <td>{sub.id}</td>
                            <td>{sub.indicator_id}</td>
                            <td>{sub.country_code}</td>
                            <td>{sub.note ?? ''}</td>
                            <td>
                                <button onClick={() => handleEdit(sub.id)}>Edit</button>
                                <button onClick={() => handleDelete(sub.id)}>Delete</button>
                                <button onClick={() => handleViewDetail(sub.id)}>Detail</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}