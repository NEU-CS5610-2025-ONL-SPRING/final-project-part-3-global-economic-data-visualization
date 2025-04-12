import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import App from './App.tsx'
import HomePage from './pages/HomePage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import IndicatorsListPage from './pages/IndicatorsListPage.tsx'
import CreateIndicatorPage from './pages/CreateIndicatorPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'indicators', element: <IndicatorsListPage /> },
      { path: 'indicators/create', element: <CreateIndicatorPage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
