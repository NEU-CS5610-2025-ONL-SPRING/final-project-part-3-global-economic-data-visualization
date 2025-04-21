import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}))

// Mock fetch
global.fetch = jest.fn()

const renderLoginPage = () => {
    return render(
        <BrowserRouter>
            <LoginPage />
        </BrowserRouter>
    )
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('LoginPage', () => {
    test('renders login form', async () => {
        renderLoginPage()
        const emailInput = screen.getByRole('textbox') // For email input
        const passwordInput = screen.getByRole('textbox', { hidden: true }) || screen.getByDisplayValue('')
        const submitButton = screen.getByRole('button', { name: /Login/i })

        expect(emailInput).toBeInTheDocument()
        expect(passwordInput).toBeInTheDocument()
        expect(submitButton).toBeInTheDocument()
    })

    test('handles form input changes', async () => {
        renderLoginPage()

        const user = userEvent.setup()
        // Use type selectors as a fallback
        const emailInput = screen.getByRole('textbox')
        // Use a more reliable way to get the password input
        const passwordInput = screen.getByLabelText('Password:')

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')

        expect(emailInput).toHaveValue('test@example.com')
        expect(passwordInput).toHaveValue('password123')
    })

    test('submits form and handles successful login', async () => {
        renderLoginPage()

        // Mock successful response
        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue({ userId: '123' })
        }

        // @ts-ignore
        global.fetch.mockResolvedValue(mockResponse)

        const user = userEvent.setup()
        const emailInput = screen.getByRole('textbox')
        const passwordInput = screen.getByTestId('password-input')
        const submitButton = screen.getByRole('button', { name: /Login/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        // Verify fetch was called with correct params
        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:3001/api/auth/login',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            })
        )

        // Check that success message is displayed
        await waitFor(() => {
            expect(screen.getByText(/Login success/i)).toBeInTheDocument()
        })

        // Check that navigation occurred
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/indicators')
        })
    })
})