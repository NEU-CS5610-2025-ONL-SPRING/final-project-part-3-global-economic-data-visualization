import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/users/me', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Non-JSON response:', text);
                    throw new Error('Server returned a non-JSON response');
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch user data');
                }

                const userData = await response.json();
                setUser(userData);
                setFormData({
                    username: userData.username,
                    email: userData.email,
                    password: '',
                });
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateMessage(null);
        setError(null);

        try {
            const updateData = {
                username: formData.username,
                email: formData.email,
                ...(formData.password ? { password: formData.password } : {}),
            };

            const response = await fetch('http://localhost:3001/api/users/me', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned a non-JSON response');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const result = await response.json();
            setUpdateMessage(result.message || 'User updated successfully');
            setUser(result.user);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleLogout = () => {
        document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        navigate('/login');
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error && !user) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="profile-page">
            <h1>My Profile</h1>
            {updateMessage && <div className="success-message">{updateMessage}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-save">Save Changes</button>
                    <button type="button" className="btn-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </form>

            <div className="account-info">
                <h2>Account Information</h2>
                <p>Member since: {user ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
                <p>Last updated: {user ? new Date(user.updated_at).toLocaleDateString() : 'Unknown'}</p>
            </div>
        </div>
    );
};

export default ProfilePage;