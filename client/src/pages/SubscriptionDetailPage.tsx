// @ts-ignore
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import WorldBankDocList, { WorldBankDocument } from '../components/WorldBankDocList'
import WorldBankDocChart from '../components/WorldBankDocChart'

import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

interface Indicator {
    id: number
    name: string
    code: string // e.g. "NY.GDP.MKTP.CD"
}

interface Subscription {
    id: number
    country_code: string // e.g. "CN"
    country_name: string
    indicator_id: number
    note?: string
    indicator?: Indicator // might or might not exist
}

interface WorldBankResponse {
    total: number
    documents: Record<string, WorldBankDocument> | WorldBankDocument[]
    facets?: Record<string, unknown>
}

interface TimeSeriesRow {
    year: number
    value: number | null
}

/** A small Recharts-based chart for time series data */
function TimeSeriesChart({ data }: { data: TimeSeriesRow[] }) {
    if (!data || data.length === 0) {
        return <p>No time series data available.</p>
    }

    const sorted = [...data].sort((a, b) => a.year - b.year)

    return (
        <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
            <ResponsiveContainer>
                <LineChart data={sorted}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default function SubscriptionDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [sub, setSub] = useState<Subscription | null>(null)
    const [indicator, setIndicator] = useState<Indicator | null>(null)

    const [docs, setDocs] = useState<WorldBankDocument[]>([])
    const [timeSeries, setTimeSeries] = useState<TimeSeriesRow[]>([])

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!id) return
        fetchSubscription(Number(id))
    }, [id])

    // Check if response is JSON
    const checkJsonResponse = async (response: Response) => {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error('Server returned a non-JSON response. This might be due to authentication issues or server errors.');
        }
        return response;
    }

    const fetchSubscription = async (subId: number) => {
        try {
            setLoading(true)
            // Using hardcoded URL instead of environment variable
            const res = await fetch(`http://localhost:3001/api/subscriptions/${subId}`, {
                credentials: 'include'
            })

            // Check if it's a JSON response
            await checkJsonResponse(res);

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Failed to get subscription')
            }

            const data = await res.json() as Subscription
            setSub(data)

            // if subscription already has indicator, use it; else fetch
            let indicatorInfo: Indicator | null = data.indicator ?? null
            if (!indicatorInfo) {
                indicatorInfo = await fetchIndicator(data.indicator_id)
            } else {
                setIndicator(indicatorInfo)
            }

            // 2) fetch doc-based results
            if (data.country_name && indicatorInfo?.name) {
                await fetchWorldBankDocs(data.country_name, indicatorInfo.name)
            }

            // 3) fetch time series from local cache route
            if (data.country_code && indicatorInfo?.code) {
                await fetchWorldBankTimeSeries(data.country_code, indicatorInfo.code)
            }

        } catch (err: unknown) {
            console.error('Error fetching subscription:', err);
            if (err instanceof Error) setError(err.message)
            else setError('An unknown error occurred')
        } finally {
            setLoading(false)
        }
    }

    const fetchIndicator = async (indicatorId: number): Promise<Indicator | null> => {
        try {
            // Using hardcoded URL instead of environment variable
            const res = await fetch(`http://localhost:3001/api/indicators/${indicatorId}`, {
                credentials: 'include'
            })

            // Check if it's a JSON response
            await checkJsonResponse(res);

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Failed to get indicator details')
            }
            const data = await res.json() as Indicator
            setIndicator(data)
            return data
        } catch (err: unknown) {
            console.error('Error fetching indicator:', err);
            if (err instanceof Error) setError(err.message)
            else setError('An unknown error occurred')
            return null
        }
    }

    const fetchWorldBankDocs = async (countryName: string, indicatorName: string) => {
        try {
            // Using hardcoded URL instead of environment variable
            const wbRes = await fetch(
                `http://localhost:3001/api/worldbank?country=${encodeURIComponent(countryName)}&indicator=${encodeURIComponent(indicatorName)}`,
                { credentials: 'include' }
            )

            // Check if it's a JSON response
            await checkJsonResponse(wbRes);

            if (!wbRes.ok) {
                const errData = await wbRes.json()
                throw new Error(errData.error || 'Failed to get World Bank doc data')
            }
            const wbJson = await wbRes.json() as WorldBankResponse
            let docArray: WorldBankDocument[] = []
            if (wbJson.documents) {
                if (Array.isArray(wbJson.documents)) docArray = wbJson.documents
                else docArray = Object.values(wbJson.documents)
            }
            setDocs(docArray)
        } catch (err: unknown) {
            console.error('Error fetching World Bank docs:', err);
            if (err instanceof Error) setError(err.message)
            else setError('An unknown error occurred')
        }
    }

    const fetchWorldBankTimeSeries = async (countryCode: string, indicatorCode: string) => {
        try {
            // Using hardcoded URL instead of environment variable
            const res = await fetch(`http://localhost:3001/api/data/wbseries?country=${countryCode}&indicator=${indicatorCode}`, {
                credentials: 'include'
            })

            const contentType = res.headers.get('content-type');

            if (!contentType || !contentType.includes('application/json')) {
                console.warn('Received non-JSON response, attempting to use backup endpoint');

                const backupRes = await fetch(`/direct-api/data/wbseries?country=${countryCode}&indicator=${indicatorCode}`, {
                    credentials: 'include'
                });

                if (!backupRes.ok) {
                    throw new Error('Both primary and backup endpoints failed');
                }

                const backupJson = await backupRes.json();
                if (!Array.isArray(backupJson.rows)) {
                    throw new Error('Unexpected time series format from backup endpoint');
                }
                setTimeSeries(backupJson.rows);
                return;
            }

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Failed to get time series')
            }

            const json = await res.json();
            if (!Array.isArray(json.rows)) {
                throw new Error('Unexpected time series format');
            }
            setTimeSeries(json.rows);
        } catch (err: unknown) {
            console.error('Error fetching time series:', err);
            setTimeSeries([]);
            if (err instanceof Error) {
                // Set a specific error for this section rather than the whole component
                console.error(err.message);
            }
        }
    }

    if (loading) return <div>Loading...</div>
    if (error) return (
        <div style={{ padding: '1rem' }}>
            <h2>Subscription Detail</h2>
            <div style={{ color: 'red', marginBottom: '1rem' }}>
                Error: {error}
                <div>
                    <button onClick={() => {
                        setError(null);
                        setLoading(true);
                        fetchSubscription(Number(id));
                    }}>
                        Retry
                    </button>
                </div>
            </div>
        </div>
    )
    if (!sub) return <div>Subscription not found</div>

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Subscription Detail - ID {sub.id}</h2>
            <p>Country: {sub.country_name} ({sub.country_code})</p>
            <p>Indicator: {indicator?.name || `ID: ${sub.indicator_id}`}</p>
            {sub.note && <p>Note: {sub.note}</p>}

            <hr />
            <h3>Related World Bank Documents (Search-based)</h3>
            {docs.length > 0 ? (
                <>
                    <WorldBankDocList docs={docs} />
                    <WorldBankDocChart docs={docs} />
                </>
            ) : (
                <p>No documents found for this subscription.</p>
            )}

            <hr />
            <h3>Time Series Data (using /api/data/wbseries)</h3>
            <TimeSeriesChart data={timeSeries} />
        </div>
    )
}