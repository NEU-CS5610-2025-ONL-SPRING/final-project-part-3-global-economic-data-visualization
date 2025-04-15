import { Router, Request, Response } from 'express'
import fetch from 'node-fetch'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
    try {
        const country = req.query.country as string | undefined
        const indicator = req.query.indicator as string | undefined
        const query = req.query.query as string | undefined

        let qterm = ''
        if (country && indicator) {
            qterm = `${country} ${indicator}`
        } else if (country) {
            qterm = country
        } else if (indicator) {
            qterm = indicator
        } else if (query) {
            qterm = query
        } else {
            qterm = 'wind turbine'
        }

        const baseUrl = 'https://search.worldbank.org/api/v3/wds'
        const params = new URLSearchParams({
            format: 'json',
            qterm: qterm,
            fl: 'docdt,display_title,abstract,url,pdfurl,count',
            rows: '20'
        })

        const finalUrl = `${baseUrl}?${params.toString()}`
        console.log('Fetching from WorldBank:', finalUrl)

        const wbRes = await fetch(finalUrl)
        if (!wbRes.ok) {
            return res.status(500).json({ error: `World Bank API error: ${wbRes.statusText}` })
        }

        const data = await wbRes.json()
        return res.json(data)

    } catch (error: unknown) {
        console.error('Error fetching worldbank data:', error)
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message })
        }
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})

export default router