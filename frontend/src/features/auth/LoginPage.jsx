import React, { useState, useEffect } from 'react';
import { LogoIcon } from '../../components/ui/icons';
import { useAuth } from '../../Context/AuthContext';

const LoginPage = ({ onLogin }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // TODO: call API for real auth
        if (email === "admin@gmail.com" && password === "123456") {
            login({ name: "Admin User", email });
        } else {
            alert("Invalid credentials!");
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
                                placeholder="Email address (admin@example.com)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                placeholder="Password (password)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;