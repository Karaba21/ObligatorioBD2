import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const sesionIniciada = localStorage.getItem("sesionIniciada") === "true";
    if (!sesionIniciada) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;