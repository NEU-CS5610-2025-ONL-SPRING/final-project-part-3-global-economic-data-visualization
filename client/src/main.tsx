import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import './App.css'
import App from './App.tsx'
import HomePage from './pages/HomePage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import IndicatorsListPage from './pages/IndicatorsListPage.tsx'
import CreateIndicatorPage from './pages/CreateIndicatorPage.tsx'
import SubscriptionsListPage from './pages/SubscriptionsListPage.tsx'
import SubscriptionDetailPage from './pages/SubscriptionDetailPage.tsx'
import CreateSubscriptionPage from './pages/CreateSubscriptionPage.tsx'
import EditSubscriptionPage from './pages/EditSubscriptionPage.tsx'
import WorldBankPage from './pages/WorldBankPage.tsx'
import CountrySearchPage from "./pages/CountrySearchPage.tsx";
import ProfilePage from './pages/ProfilePage.tsx'

// Define application routes using createBrowserRouter
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'worldbank', element: <WorldBankPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'indicators', element: <IndicatorsListPage /> },
      { path: 'indicators/create', element: <CreateIndicatorPage /> },
      { path: 'subscriptions', element: <SubscriptionsListPage /> },
      { path: 'subscriptions/create', element: <CreateSubscriptionPage /> },
      { path: 'subscriptions/edit/:id', element: <EditSubscriptionPage /> },
      { path: 'subscriptions/detail/:id', element: <SubscriptionDetailPage /> },
      { path: 'country-search', element: <CountrySearchPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
)