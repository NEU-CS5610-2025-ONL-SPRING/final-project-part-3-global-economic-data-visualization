import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Define TypeScript interface for indicator
interface Indicator {
    id: string;
    code: string;
    name: string;
}

function IndicatorsListPage() {
    const [indicators, setIndicators] = useState<Indicator[]>([])
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchIndicators()
    }, [])

    const fetchIndicators = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/indicators', {
                credentials: 'include'
            })
            if (!res.ok) {
                const errorData = await res.json()
                setMessage('Failed to fetch indicators: ' + (errorData.error || 'Unknown error'))
                return
            }
            const data = await res.json()
            setIndicators(data)
        } catch (error) {
            console.error(error)
            setMessage('Error occurred. Please try again later.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <h2>Indicators List</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <Link to="/indicators/create">
                    <button>Create New Indicator</button>
                </Link>
                {message && <p className="error-message">{message}</p>}
            </div>

            {isLoading ? (
                <p>Loading indicators...</p>
            ) : indicators.length > 0 ? (
                <ul>
                    {indicators.map(({ id, code, name }) => (
                        <li key={id}>
                            <strong>{code}</strong> - {name}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No indicators found. Create your first one!</p>
            )}
        </div>
    )
}

export default IndicatorsListPage