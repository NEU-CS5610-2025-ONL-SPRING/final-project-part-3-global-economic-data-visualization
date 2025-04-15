import React from 'react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts'
import { WorldBankDocument } from './WorldBankDocList'

interface Props {
    docs: WorldBankDocument[]
}

const WorldBankDocChart: React.FC<Props> = ({ docs }) => {
    const yearMap = new Map<string, number>()
    docs.forEach(doc => {
        if (doc.docdt) {
            const year = doc.docdt.slice(0,4) // '2006'...
            if (yearMap.has(year)) {
                yearMap.set(year, yearMap.get(year)! + 1)
            } else {
                yearMap.set(year, 1)
            }
        }
    })

    const dataArray = Array.from(yearMap.entries()).map(([year, count]) => ({ year, count }))

    dataArray.sort((a,b) => a.year.localeCompare(b.year))

    if (dataArray.length === 0) {
        return <p>No chart data (no docdt fields?).</p>
    }

    return (
        <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
            <ResponsiveContainer>
                <BarChart data={dataArray}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8"/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default WorldBankDocChart
