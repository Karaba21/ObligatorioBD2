import React, { useState } from "react";
import "../Styles/LoginPage.css";
import escudoSVG from '../assets/EscudoUruguay.svg';

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

            const response = await fetch("http://localhost:5001/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ci, password }),
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = "/votar";
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
        <div className="login-main-bg">
            <div className="login-container">
                <img
                    src={escudoSVG}
                    alt="Escudo Uruguay"
                    className="login-logo"
                />
                <div className="login-card">
                    <h2 className="login-title">Iniciar Sesión</h2>
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
                        <a
                            href="/registrar-miembro-mesa"
                            className="login-link"
                        >
                            Regístrate
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginMiembroMesa;
