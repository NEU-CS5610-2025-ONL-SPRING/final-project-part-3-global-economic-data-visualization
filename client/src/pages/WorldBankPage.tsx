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
    const [isLoading, setIsLoading] = useState(false)

    const docs: WorldBankDocument[] = rawData ?
        (Array.isArray(rawData.documents)
                ? rawData.documents
                : Object.values(rawData.documents as Record<string, WorldBankDocument>)
        ) : [];

    const handleFetch = async () => {
        if (!query.trim()) {
            setError("Please enter a search query")
            return
        }

        setError(null)
        setIsLoading(true)

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
        } finally {
            setIsLoading(false)
        }
    }

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleFetch()
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2>World Bank API Search</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Query: </label>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Enter search terms"
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Search'}
                    </button>
                </div>
            </form>

            {error && <p style={{color:'red'}}>Error: {error}</p>}

            {isLoading ? (
                <p>Loading results...</p>
            ) : rawData ? (
                <div style={{ marginTop: '1rem' }}>
                    <p>Total results: {rawData.total ?? 'N/A'}</p>

                    {docs.length > 0 ? (
                        <>
                            <WorldBankDocList docs={docs} />
                            <WorldBankDocChart docs={docs} />
                        </>
                    ) : (
                        <p>No documents found matching your query.</p>
                    )}
                </div>
            ) : (
                <p>Enter a search query and click Search to view results.</p>
            )}
        </div>
    )
}

export default WorldBankPage