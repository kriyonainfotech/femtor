import React, { useState } from 'react';
import axios from 'axios'; // 1. Import axios to make API calls
import { LogoIcon } from '../../components/ui/icons';
import { useAuth } from '../../Context/AuthContext';

// 2. Define the API URL from your environment variables, just like in your other components
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // 3. Add a loading state for user feedback

    // 4. Make the handler async to await the API call
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // Disable the button
        setError('');     // Clear previous errors

        try {
            // 5. Call your backend's login endpoint
            const response = await axios.post(`${API_URL}/api/users/login-admin`, {
                email,
                password,
            });

            // 6. On success, call the login function from your AuthContext with the user data
            // The AuthContext will handle saving to localStorage and navigating to the dashboard
            login(response.data);

        } catch (err) {
            // 7. If the API call fails, handle the error
            if (err.response && err.response.data && err.response.data.message) {
                // If the server sends a specific error message (like "Invalid email or password")
                setError(err.response.data.message);
            } else {
                // For network errors or other issues
                setError('Login failed. Please check your connection and try again.');
            }
            console.error("Login error:", err);
        } finally {
            setLoading(false); // Re-enable the button
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <LogoIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                    <p className="mt-2 text-gray-400">Welcome back, please login to your account.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 placeholder-gray-500 text-gray-200 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-300"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading} // Disable input while loading
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 placeholder-gray-500 text-gray-200 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-300"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading} // Disable input while loading
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all duration-300 ease-in-out disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            disabled={loading} // 8. Disable button while loading
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
