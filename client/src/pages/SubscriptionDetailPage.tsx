// @ts-ignore
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import WorldBankDocList, { WorldBankDocument } from '../components/WorldBankDocList'
import WorldBankDocChart from '../components/WorldBankDocChart'

interface Indicator {
    id: number;
    name: string;
    code: string;
}

interface Subscription {
    id: number;
    country_code: string;
    country_name: string;
    indicator_id: number;
    note?: string;
    indicator?: Indicator;
}

interface WorldBankResponse {
    total: number;
    documents: Record<string, WorldBankDocument> | WorldBankDocument[];
    facets?: Record<string, unknown>;
}

export default function SubscriptionDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [sub, setSub] = useState<Subscription | null>(null)
    const [indicator, setIndicator] = useState<Indicator | null>(null)
    const [docs, setDocs] = useState<WorldBankDocument[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!id) return
        fetchSubscription(Number(id))
    }, [id])

    const fetchSubscription = async (subId: number) => {
        try {
            setLoading(true)
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subscriptions/${subId}`, {
                credentials: 'include'
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Failed to get subscription')
            }

            const data = await res.json() as Subscription
            setSub(data)

            if (data.indicator) {
                setIndicator(data.indicator)
                await fetchWorldBank(data.country_name, data.indicator.name)
            } else {
                // 否则需要单独获取indicator信息
                await fetchIndicator(data.indicator_id, data)
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An unknown error occurred')
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchIndicator = async (indicatorId: number, subscription: Subscription) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/indicators/${indicatorId}`, {
                credentials: 'include'
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Failed to get indicator details')
            }

            const indicatorData = await res.json() as Indicator
            setIndicator(indicatorData)

            await fetchWorldBank(subscription.country_name, indicatorData.name)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An unknown error occurred')
            }
        }
    }

    const fetchWorldBank = async (countryName: string, indicatorName: string) => {
        try {
            const wbRes = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/worldbank?country=${encodeURIComponent(countryName)}&indicator=${encodeURIComponent(indicatorName)}`,
                { credentials: 'include' }
            )

            if (!wbRes.ok) {
                const errData = await wbRes.json()
                throw new Error(errData.error || 'Failed to get World Bank data')
            }

            const wbJson = await wbRes.json() as WorldBankResponse

            let docArray: WorldBankDocument[] = []
            if (wbJson.documents) {
                if (Array.isArray(wbJson.documents)) {
                    docArray = wbJson.documents
                } else {
                    docArray = Object.values(wbJson.documents)
                }
            }

            setDocs(docArray)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An unknown error occurred')
            }
        }
    }

    if (loading) return <div>Loading...</div>
    if (error) return <div style={{ color: 'red' }}>{error}</div>
    if (!sub) return <div>Subscription not found</div>

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Subscription Detail - ID {sub.id}</h2>
            <p>Country: {sub.country_name} ({sub.country_code})</p>
            <p>Indicator: {indicator?.name || `ID: ${sub.indicator_id}`}</p>
            {sub.note && <p>Note: {sub.note}</p>}

            <hr />

            <h3>Related World Bank Documents</h3>
            {docs.length > 0 ? (
                <>
                    <WorldBankDocList docs={docs} />
                    <WorldBankDocChart docs={docs} />
                </>
            ) : (
                <p>No documents found for this subscription.</p>
            )}
        </div>
    )
}