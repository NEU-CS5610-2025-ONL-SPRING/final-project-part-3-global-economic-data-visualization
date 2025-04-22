import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
import { requireAuth } from '../middlewares/requireAuth.js'

const router = Router()
const prisma = new PrismaClient()

//only import selected indicator
const SELECTED_INDICATOR_CODES = [
    'NY.GDP.MKTP.CD',      // GDP (current US$)
    'NY.GDP.MKTP.KD.ZG',   // GDP growth (annual %)
    'FP.CPI.TOTL.ZG',      // Inflation, consumer prices (annual %)
    'SP.POP.TOTL',         // Population, total
    'SL.UEM.TOTL.ZS',      // Unemployment, total (% of total labor force)
    'NY.GNP.PCAP.CD',      // GNI per capita (current US$)
    'NE.EXP.GNFS.ZS',      // Exports of goods and services (% of GDP)
    'NE.IMP.GNFS.ZS',      // Imports of goods and services (% of GDP)
]

router.post('/importSelectedIndicators', requireAuth, async (req: Request, res: Response) => {
    try {
        let importedCount = 0

        // We loop through each code, fetch its metadata from:
        // https://api.worldbank.org/v2/indicator/<code>?format=json
        for (const code of SELECTED_INDICATOR_CODES) {
            const url = `https://api.worldbank.org/v2/indicator/${code}?format=json`
            console.log('Fetching indicator metadata from:', url)

            const wbRes = await fetch(url)
            if (!wbRes.ok) {
                console.error(`Failed to fetch metadata for ${code}, status=${wbRes.status}`)
                continue // skip if error
            }

            const json = await wbRes.json()

            if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1]) || json[1].length === 0) {
                console.warn('Invalid response for code:', code)
                continue
            }

            const indicatorObj = json[1][0]
            const wbCode = indicatorObj.id || code
            const wbName = indicatorObj.name || '(no name)'
            const wbDesc = indicatorObj.sourceNote || null

            try {
                // Upsert into local "Indicator" table
                // "code" = wbCode must be unique
                await prisma.indicator.upsert({
                    where: { code: wbCode },
                    update: {
                        name: wbName,
                        description: wbDesc
                    },
                    create: {
                        code: wbCode,
                        name: wbName,
                        description: wbDesc
                    }
                })
                importedCount++
            } catch (upsertError) {
                console.error('Upsert error for indicator', wbCode, upsertError)
            }
        }

        res.json({
            message: `Done importing selected indicators. Count: ${importedCount}`
        })
    } catch (error: any) {
        console.error('Error in importSelectedIndicators route:', error)
        res.status(500).json({ error: error.message || 'Internal server error' })
    }
})

export default router