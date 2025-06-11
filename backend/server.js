const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/database');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Probar la conexión a la base de datos al iniciar el servidor
testConnection();

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido al servidor backend' });
});

// Endpoints para consultar la base de datos
app.get('/api/personas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Persona');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al consultar personas:', error);
    res.status(500).json({ success: false, error: 'Error al consultar personas' });
  }
});

app.get('/api/votantes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Votante');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al consultar votantes:', error);
    res.status(500).json({ success: false, error: 'Error al consultar votantes' });
  }
});

app.get('/api/departamentos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Departamento');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al consultar departamentos:', error);
    res.status(500).json({ success: false, error: 'Error al consultar departamentos' });
  }
});

app.get('/api/elecciones', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Eleccion');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al consultar elecciones:', error);
    res.status(500).json({ success: false, error: 'Error al consultar elecciones' });
  }
});

// Endpoint para consultar votantes con sus datos personales
app.get('/api/votantes-detalle', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.*, p.Nombre, p.Fecha_Nacimiento 
      FROM Votante v 
      JOIN Persona p ON v.CI = p.CI
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al consultar votantes con detalle:', error);
    res.status(500).json({ success: false, error: 'Error al consultar votantes con detalle' });
  }
});

// Manejador de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 