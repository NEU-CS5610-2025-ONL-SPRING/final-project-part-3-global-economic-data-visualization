import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import IndicatorsListPage from '../pages/IndicatorsListPage'

// Mock fetch
global.fetch = jest.fn()

const renderIndicatorsListPage = () => {
    return render(
        <BrowserRouter>
            <IndicatorsListPage />
        </BrowserRouter>
    )
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('IndicatorsListPage', () => {
    test('renders Indicators list title', async () => {
        renderIndicatorsListPage()

        // Adjust this selector based on your actual page heading
        const header = screen.getByText(/Indicators List/i)
        expect(header).toBeInTheDocument()
    })

    test('displays loading state initially', async () => {
        renderIndicatorsListPage()

        const loadingText = screen.getByText(/Loading indicators/i)
        expect(loadingText).toBeInTheDocument()
    })

    test('fetches and displays indicators', async () => {
        // Mock successful response with test data
        const mockIndicators = [
            { id: '1', code: 'GDP', name: 'Gross Domestic Product' },
            { id: '2', code: 'INF', name: 'Inflation Rate' }
        ]

        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue(mockIndicators)
        }

        // @ts-ignore - mocking fetch
        global.fetch.mockResolvedValue(mockResponse)

        renderIndicatorsListPage()

        // Verify fetch was called
        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:3001/api/indicators',
            expect.objectContaining({
                credentials: 'include'
            })
        )

        // Check that indicators are displayed
        await waitFor(() => {
            expect(screen.getByText(/GDP/i)).toBeInTheDocument()
            expect(screen.getByText(/Gross Domestic Product/i)).toBeInTheDocument()
        })
    })
})