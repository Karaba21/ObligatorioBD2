import React, { useState } from "react";
import "../Styles/LoginPage.css";

const LoginMiembroMesa = () => {
    const [ci, setCi] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!ci || !password) {
            setError("Completa ambos campos.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5001/api/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ci, password }),
                }
            );
            const data = await response.json();

            if (data.success) {
                alert("¡Bienvenido Miembro de Mesa!");
                // Aquí puedes guardar el CI/token y redirigir
                window.location.href = "/";
            } else {
                setError(data.message || "CI o contraseña incorrectos.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">
                    Iniciar Sesión
                    <br />
                    Miembro de Mesa
                </h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="ci">Cédula de Identidad</label>
                    <input
                        type="text"
                        id="ci"
                        value={ci}
                        onChange={(e) => setCi(e.target.value)}
                        placeholder="Ingrese su cédula"
                    />
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingrese su contraseña"
                    />
                    {error && <div className="login-error">{error}</div>}
                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? "Ingresando..." : "Iniciar Sesión"}
                    </button>
                </form>
                <div className="login-bottom-card">
                    ¿No tienes una cuenta?{" "}
                    <a href="/registrar-miembro-mesa" className="login-link">
                        Regístrate
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginMiembroMesa;
