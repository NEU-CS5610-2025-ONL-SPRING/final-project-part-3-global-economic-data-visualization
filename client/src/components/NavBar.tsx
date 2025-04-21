// @ts-ignore
import React from 'react'
import { Link } from 'react-router-dom'
import LogoutButton from './LogoutButton'

function NavBar() {
    return (
        <nav>
            <Link to="/">Home</Link> |{' '}
            <Link to="/register">Register</Link> |{' '}
            <Link to="/login">Login</Link> |{' '}
            <Link to="/indicators">Indicators</Link> |{' '}
            <Link to="/indicators/create">Create Indicator</Link> |{' '}
            <Link to="/subscriptions">Subscriptions</Link> |{' '}
            <Link to="/subscriptions/create">Create Subscription</Link> |{' '}
            <Link to="/WorldBank">WorldBank API</Link>

            {' '}<LogoutButton />
        </nav>
    )
}

export default NavBar