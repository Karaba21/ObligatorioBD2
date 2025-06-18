import React, { useState } from "react";
import "../Styles/LoginPage.css";
import escudoSVG from "../assets/EscudoUruguay.svg";
import { Link } from "react-router-dom";

const MiembroMesaRegister = () => {
    const [ci, setCi] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!ci || !password || !repeatPassword) {
            setError("Completa todos los campos.");
            return;
        }
        if (password !== repeatPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ci, password }),
            });
            const data = await response.json();

            if (data.success) {
                setSuccess(
                    "Contraseña registrada correctamente. ¡Ya puedes iniciar sesión!"
                );
                setCi("");
                setPassword("");
                setRepeatPassword("");
            } else {
                setError(data.message || "Error al registrar la contraseña.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
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
                    <h2 className="login-title">
                        Registro de Contraseña
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
                        />
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label htmlFor="repeatPassword">
                            Repetir Contraseña
                        </label>
                        <input
                            type="password"
                            id="repeatPassword"
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                        />
                        {error && <div className="login-error">{error}</div>}
                        {success && (
                            <div className="login-success">{success}</div>
                        )}
                        <button type="submit" className="login-btn">
                            Registrarse
                        </button>
                    </form>
                    <div className="login-bottom-card">
                        ¿Ya tienes una cuenta?{" "}
                        <Link to="/" className="login-link">
                            Inicia sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiembroMesaRegister;
