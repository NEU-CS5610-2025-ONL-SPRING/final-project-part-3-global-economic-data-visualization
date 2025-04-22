import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'

const prisma = new PrismaClient()
const router = Router()

/**
 * GET /api/data/wbseries
 * Example usage: /api/data/wbseries?country=US&indicator=NY.GDP.MKTP.CD
 * 1) Check if there's any WBData in local DB (cache)
 * 2) If found and not expired, return it
 * 3) Otherwise fetch from official WB API, parse, store, return
 */

// Decide how long the local cache is valid (in milliseconds)
// For example: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000

router.get('/', async (req: Request, res: Response) => {
    try {
        const country = (req.query.country as string)?.toUpperCase()
        const indicator = req.query.indicator as string | undefined
        if (!country || !indicator) {
            return res.status(400).json({ error: 'Missing country or indicator query params' })
        }

        // 1) Check local DB to see if we already have data for (country, indicator)
        //    and whether it's still "fresh"
        //    We'll store data by each "year" row, so we find all rows
        //    Then check if they are not older than 1 day.

        // We'll do a quick approach: check the newest updated_at among them
        // If that time is within 24 hours, assume it's valid
        const dbRows = await prisma.wBData.findMany({
            where: { country, indicator },
            orderBy: { updated_at: 'desc' },
        })

        // if we already have some data
        if (dbRows.length > 0) {
            const newest = dbRows[0]
            const updatedAt = newest.updated_at
            const ageMs = Date.now() - updatedAt.getTime()
            if (ageMs < CACHE_DURATION_MS) {
                // Not expired, just return it
                return res.json({
                    source: 'cache',
                    rows: dbRows.map(r => ({
                        year: r.year,
                        value: r.value,
                    }))
                })
            }
        }

        // 2) If no fresh data in DB, fetch from official WB API
        // https://api.worldbank.org/v2/country/{countryCode}/indicator/{indicatorCode}?format=json
        const wbUrl = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=100`
        const wbRes = await fetch(wbUrl)
        if (!wbRes.ok) {
            // If official request failed, you can return error or fallback
            return res.status(502).json({ error: 'Failed to fetch from World Bank' })
        }

        const wbJson = await wbRes.json()
        // Typically wbJson is an array of length 2: [metadata, data[]]
        if (!Array.isArray(wbJson) || wbJson.length < 2 || !Array.isArray(wbJson[1])) {
            return res.status(500).json({ error: 'World Bank response format error' })
        }

        const dataArray = wbJson[1]
        // dataArray is an array of objects that look like:
        // { country: { id: "US", value: "United States" }, date: "2020", value: 20.94e12, ... }

        // 3) Remove old rows from DB if any
        await prisma.wBData.deleteMany({ where: { country, indicator } })

        // 4) Insert new rows
        const insertPromises = dataArray.map(async (item: any) => {
            const year = parseInt(item.date, 10)
            if (isNaN(year)) return null
            // item.value might be null
            const numericValue = item.value !== null ? Number(item.value) : null
            return prisma.wBData.create({
                data: {
                    country,
                    indicator,
                    year,
                    value: numericValue || undefined, // if it's null, you can store null
                }
            })
        })

        // Wait for all
        const insertedRows = (await Promise.all(insertPromises)).filter(Boolean)

        // Return newly inserted data
        const ret = insertedRows.map(r => ({
            year: r?.year,
            value: r?.value
        }))
        return res.json({
            source: 'fresh',
            rows: ret
        })

    } catch (error) {
        console.error('Error in /api/data/wbseries:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
