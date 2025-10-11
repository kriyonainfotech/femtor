import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const auth = useAuth();
    console.log("Auth in ProtectedRoute:", auth);
    const { user, loading } = auth;

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    // not logged in
    if (!user) return <Navigate to="/login" replace />;

    // logged in
    return children;
};

export default ProtectedRoute;
