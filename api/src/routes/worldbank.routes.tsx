import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';

const router = Router();

// Validate query parameters
const isValidQueryParam = (param: string | undefined): boolean => {
    if (!param) return true;
    return param.length <= 100 && /^[A-Za-z0-9\s-]*$/.test(param);
};

// Validate country code
const isValidCountryCode = (code: string | undefined): boolean => {
    if (!code) return true;
    return /^[A-Z]{2}$/.test(code);
};

/**
 * GET /api/worldbank
 * Fetch data from World Bank API based on query parameters
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const country = req.query.country as string | undefined;
        const indicator = req.query.indicator as string | undefined;
        const query = req.query.query as string | undefined;

        // Validate query parameters
        if (
            !isValidQueryParam(country) ||
            !isValidQueryParam(indicator) ||
            !isValidQueryParam(query)
        ) {
            return res.status(400).json({ error: 'Invalid query parameters (max 100 characters, alphanumeric, spaces, hyphens)' });
        }
        if (country && !isValidCountryCode(country)) {
            return res.status(400).json({ error: 'Invalid country code (must be ISO 3166-1 alpha-2, e.g., US)' });
        }

        let qterm = '';
        if (country && indicator) {
            qterm = `${country} ${indicator}`;
        } else if (country) {
            qterm = country;
        } else if (indicator) {
            qterm = indicator;
        } else if (query) {
            qterm = query;
        } else {
            qterm = 'wind turbine';
        }

        // Ensure qterm is not too long for World Bank API
        if (qterm.length > 200) {
            return res.status(400).json({ error: 'Search term too long (max 200 characters)' });
        }

        const baseUrl = 'https://search.worldbank.org/api/v3/wds';
        const params = new URLSearchParams({
            format: 'json',
            qterm: qterm,
            fl: 'docdt,display_title,abstract,url,pdfurl,count',
            rows: '20',
        });

        const finalUrl = `${baseUrl}?${params.toString()}`;
        console.log('Fetching from WorldBank:', finalUrl);

        // timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const wbRes = await fetch(finalUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!wbRes.ok) {
            if (wbRes.status === 429) {
                return res.status(429).json({ error: 'Too many requests to World Bank API' });
            }
            return res.status(500).json({ error: `World Bank API error: ${wbRes.statusText}` });
        }

        const data = await wbRes.json();

        // Basic response validation
        if (!data || typeof data !== 'object') {
            return res.status(500).json({ error: 'Invalid response from World Bank API' });
        }

        return res.json(data);
    } catch (error: unknown) {
        console.error('Error fetching World Bank data:', error);
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return res.status(504).json({ error: 'Request to World Bank API timed out' });
            }
            return res.status(500).json({ error: `Internal server error: ${error.message}` });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;