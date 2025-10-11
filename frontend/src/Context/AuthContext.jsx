import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // store user data
    const [loading, setLoading] = useState(true);

    // --- Load user from localStorage ---
    useEffect(() => {
        const storedUser = localStorage.getItem("adminUser");
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
    }, []);

    // --- Login function ---
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("adminUser", JSON.stringify(userData));
        navigate("/dashboard");
    };

    // --- Logout function ---
    const logout = () => {
        setUser(null);
        localStorage.removeItem("adminUser");
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// custom hook
export const useAuth = () => useContext(AuthContext);
