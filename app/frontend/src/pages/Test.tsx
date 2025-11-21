import { useNavigate } from 'react-router-dom'
import useAuth from '../features/authentication/hooks/useAuth';

const Test = () => {
    const navigate = useNavigate();

    const { logout, isAuthenticated, currentUser } = useAuth();
    return (

        <main role="main" aria-labelledby="test-dashboard-title">
            <h1 id="test-dashboard-title">Temporary Dashboard</h1>
            <p>Temporary Dashboard for testing purposes</p>
            <p>Current User: {isAuthenticated ? JSON.stringify(currentUser) : "No user logged in"}</p>
            <button className={`${isAuthenticated
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                } text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={() => { navigate("/login"); if (isAuthenticated) logout() }}
                aria-label={isAuthenticated ? "Log out and navigate to login" : "Navigate to login"}
            >Navigate to login</button>
        </main>
    )
}

export default Test