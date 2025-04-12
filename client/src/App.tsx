import { Outlet, Link } from 'react-router-dom'
import LogoutButton from './components/LogoutButton'

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/register">Register</Link> |{" "}
        <Link to="/login">Login</Link> |{" "}
        <Link to="/indicators">Indicators</Link> |{" "}
        <Link to="/indicators/create">Create Indicator</Link>

          <LogoutButton />
      </nav>
      <hr />
      <Outlet />
    </div>
  )
}


export default App