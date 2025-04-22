import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar'

function App() {
    return (
        <div>
            <NavBar />
            <hr />
            <Outlet />
        </div>
    )
}

export default App