import React from "react";
import {
    FaVoteYea,
    FaChartBar,
    FaShieldAlt,
    FaUserCheck,
} from "react-icons/fa";
import "../Styles/HomePage.css";

const HomePage = () => {
    const activeVotings = [
        { id: 1, title: "Elección de Representantes", daysLeft: 2 },
        { id: 2, title: "Propuesta de Mejoras", daysLeft: 5 },
    ];

    const features = [
        {
            id: 1,
            icon: <FaShieldAlt className="feature-icon" />,
            title: "Seguridad Garantizada",
            description:
                "Utilizamos tecnología blockchain para asegurar la integridad de cada voto.",
        },
        {
            id: 2,
            icon: <FaChartBar className="feature-icon" />,
            title: "Transparencia Total",
            description:
                "Accede a resultados en tiempo real y verifica la autenticidad de cada votación.",
        },
        {
            id: 3,
            icon: <FaUserCheck className="feature-icon" />,
            title: "Fácil de Usar",
            description:
                "Interfaz intuitiva que permite votar en pocos clics desde cualquier dispositivo.",
        },
    ];

    return (
        <div className="home-container">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <FaVoteYea className="brand-icon" />
                        <span>Sistema de Votación</span>
                    </div>
                    <div className="navbar-links">
                        <a href="#" className="active">
                            Inicio
                        </a>
                        <a href="#">Votaciones Activas</a>
                        <a href="#">Resultados</a>
                        <a href="#">Iniciar Sesión</a>
                    </div>
                </div>
            </nav>

            <main className="main-content">
                <div className="hero-section">
                    <div className="hero-content">
                        <h1>Bienvenido al Sistema de Votación</h1>
                        <p className="lead">
                            Participa en las decisiones importantes de manera
                            segura y transparente.
                        </p>
                        <div className="cta-buttons">
                            <button className="btn-primary">Votar Ahora</button>
                            <button className="btn-secondary">
                                Ver Resultados
                            </button>
                        </div>
                    </div>
                    <div className="active-votings">
                        <h2>Votaciones Activas</h2>
                        <div className="voting-list">
                            {activeVotings.map((voting) => (
                                <div key={voting.id} className="voting-card">
                                    <span className="voting-title">
                                        {voting.title}
                                    </span>
                                    <span className="voting-days">
                                        {voting.daysLeft} días
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="features-section">
                    {features.map((feature) => (
                        <div key={feature.id} className="feature-card">
                            {feature.icon}
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="footer">
                <p>
                    © 2024 Sistema de Votación. Todos los derechos reservados.
                </p>
            </footer>
        </div>
    );
};

export default HomePage;
