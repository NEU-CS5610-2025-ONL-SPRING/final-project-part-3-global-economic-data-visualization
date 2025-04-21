import { render, screen } from '@testing-library/react'
import HomePage from '../pages/HomePage'

describe('HomePage', () => {
    test('renders HomePage title', () => {
        render(<HomePage />)
        const el = screen.getByText(/Welcome/i)
        expect(el).toBeInTheDocument()
    })

    test('renders HomePage content sections', () => {
        render(<HomePage />)

        // Updated to match your actual content
        const title = screen.getByText(/Welcome to the Global Economic Dashboard/i)
        expect(title).toBeInTheDocument()

        // Check for paragraph text
        const paragraph = screen.getByText(/This is our home page/i)
        expect(paragraph).toBeInTheDocument()

        // Check for heading element
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
})