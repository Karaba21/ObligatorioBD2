// import React, { useState } from "react";
// import "../Styles/LoginPage.css";

// const LoginPage = () => {
//     const [cc, setCc] = useState("");
//     const [error, setError] = useState("");

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!cc) {
//             setError("Por favor, ingrese su credencial cívica.");
//             return;
//         }
//         setError("");

//         try {
//             const response = await fetch("http://localhost:5000/api/login-votante", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ cc }),
//             });
//             const data = await response.json();

//             if (data.success) {
//                 // Guardar la CC o token si lo necesitas
//                 // Redirigir a la home page
//                 window.location.href = "/"; // O usa navigate si usas react-router
//             } else {
//                 setError(data.message || "Credencial no registrada");
//             }
//         } catch (err) {
//             setError("Error de conexión con el servidor");
//         }
//     };

//     return (
//         <div className="login-container">
//             <div className="login-card">
//                 <h2 className="login-title">Ingreso de Votante</h2>
//                 <form onSubmit={handleSubmit}>
//                     <label htmlFor="cc">Credencial Cívica</label>
//                     <input
//                         type="text"
//                         id="cc"
//                         value={cc}
//                         onChange={(e) => setCc(e.target.value)}
//                         placeholder="Ingrese su credencial cívica"
//                         autoComplete="username"
//                     />
//                     {error && <div className="login-error">{error}</div>}
//                     <button type="submit" className="login-btn">
//                         Ingresar
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default LoginPage;