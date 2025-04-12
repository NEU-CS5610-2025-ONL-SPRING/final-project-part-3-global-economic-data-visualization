import {useEffect, useState} from "react";


function IndicatorsListPage() {
    const [indicators, setIndicators] = useState([])
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchIndicators()
    }, [])

    const fetchIndicators = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/indicators', {
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
            setMessage('Error occurred.')
        }
    }

    return (
        <div>
            <h2>Indicators List</h2>
            <p>{message}</p>
            <ul>
                {indicators.map(({ id, code, name }) => (
                    <li key={id}>
                        <strong>{code}</strong> - {name}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default IndicatorsListPage