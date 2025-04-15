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
import SubscriptionsListPage from './pages/SubscriptionsListPage.tsx'
import CreateSubscriptionPage from './pages/CreateSubscriptionPage.tsx'
import EditSubscriptionPage from './pages/EditSubscriptionPage.tsx'

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
      { path: 'subscriptions', element: <SubscriptionsListPage /> },
      { path: 'subscriptions/create', element: <CreateSubscriptionPage /> },
      { path: 'subscriptions/edit/:id', element: <EditSubscriptionPage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
