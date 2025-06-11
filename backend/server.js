const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido al servidor backend' });
});

// Ruta del mensaje
app.get('/api/message', (req, res) => {
  res.json({ message: '¡Hola desde el backend!' });
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