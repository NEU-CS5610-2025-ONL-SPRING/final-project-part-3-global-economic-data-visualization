import React, { useState } from 'react'
import WorldBankDocList, { WorldBankDocument } from '../components/WorldBankDocList'
import WorldBankDocChart from '../components/WorldBankDocChart'

interface WorldBankResponse {
    total: number;
    documents: WorldBankDocument[] | Record<string, WorldBankDocument>;
    facets?: Record<string, unknown>;
}

const WorldBankPage: React.FC = () => {
    const [query, setQuery] = useState('wind turbine')
    const [rawData, setRawData] = useState<WorldBankResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const docs: WorldBankDocument[] = rawData ?
        (Array.isArray(rawData.documents)
                ? rawData.documents
                : Object.values(rawData.documents as Record<string, WorldBankDocument>)
        ) : [];

    const handleFetch = async () => {
        setError(null)
        setRawData(null)

        try {
            const res = await fetch(`http://localhost:3001/api/worldbank?query=${encodeURIComponent(query)}`, {
                credentials: 'include'
            })
            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Failed to fetch')
            }
            const json = await res.json() as WorldBankResponse
            setRawData(json)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Unknown type of error')
            }
        }
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2>World Bank API Test</h2>
            <div>
                <label>Query: </label>
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                <button onClick={handleFetch}>Fetch</button>
            </div>

            {error && <p style={{color:'red'}}>Error: {error}</p>}

            {rawData ? (
                <div style={{ marginTop: '1rem' }}>
                    <p>Total: {rawData.total ?? 'N/A'}</p>

                    <WorldBankDocList docs={docs} />

                    <WorldBankDocChart docs={docs} />

                </div>
            ) : (
                <p>No data yet</p>
            )}
        </div>
    )
}

export default WorldBankPage