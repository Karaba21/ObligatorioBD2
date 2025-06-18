const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5001;

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

// ===== ENDPOINT DE PRUEBA PARA DEBUGGING =====
app.get('/api/debug/tablas', async (req, res) => {
    try {
        // Ver estructura de tabla Votante
        const [votanteStructure] = await pool.query('DESCRIBE Votante');
        
        // Ver estructura de tabla Persona
        const [personaStructure] = await pool.query('DESCRIBE Persona');
        
        // Ver algunos datos de ejemplo
        const [votantes] = await pool.query('SELECT * FROM Votante LIMIT 5');
        const [personas] = await pool.query('SELECT * FROM Persona LIMIT 5');
        
        res.json({
            success: true,
            data: {
                votanteStructure,
                personaStructure,
                votantes,
                personas
            }
        });
    } catch (error) {
        console.error('Error en debug:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== APIs DE GESTIÓN DE VOTANTES =====

// 1. Buscar votante por CC
app.get('/api/votantes/:cc', async (req, res) => {
    const { cc } = req.params;
    
    try {
        const [rows] = await pool.query(`
            SELECT v.*, p.Nombre, p.Fecha_Nacimiento
            FROM Votante v 
            JOIN Persona p ON v.CI = p.CI
            WHERE v.CC = ?
        `, [cc]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Votante no encontrado' 
            });
        }
        
        res.json({ 
            success: true, 
            data: rows[0] 
        });
    } catch (error) {
        console.error('Error al buscar votante:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al buscar votante' 
        });
    }
});

// 2. Verificar si un votante ya votó
app.get('/api/votantes/:cc/estado-voto', async (req, res) => {
    const { cc } = req.params;
    
    try {
        // Primero verificamos que el votante existe
        const [votanteRows] = await pool.query('SELECT * FROM Votante WHERE CC = ?', [cc]);
        
        if (votanteRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Votante no encontrado' 
            });
        }
        
        // Verificamos si ya votó (asumiendo que hay un campo YaVoto en la tabla Votante)
        // Si no existe este campo, podemos verificar en la tabla de Votos
        const votante = votanteRows[0];
        
        // Si existe el campo YaVoto, lo usamos directamente
        if (votante.YaVoto !== undefined) {
            return res.json({ 
                success: true, 
                data: {
                    cc: votante.CC,
                    yaVoto: Boolean(votante.YaVoto),
                    fechaVoto: votante.FechaVoto || null
                }
            });
        }
        
        // Si no existe el campo YaVoto, verificamos en la tabla de Votos
        const [votoRows] = await pool.query(`
            SELECT COUNT(*) as totalVotos 
            FROM Voto 
            WHERE CC_Votante = ?
        `, [cc]);
        
        const yaVoto = votoRows[0].totalVotos > 0;
        
        res.json({ 
            success: true, 
            data: {
                cc: votante.CC,
                yaVoto: yaVoto,
                totalVotos: votoRows[0].totalVotos
            }
        });
    } catch (error) {
        console.error('Error al verificar estado de voto:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al verificar estado de voto' 
        });
    }
});

// 3. Marcar votante como que ya votó
app.put('/api/votantes/:cc/marcar-votado', async (req, res) => {
    const { cc } = req.params;
    const { idEleccion } = req.body; // Opcional: para especificar en qué elección votó
    
    try {
        // Verificamos que el votante existe
        const [votanteRows] = await pool.query('SELECT * FROM Votante WHERE CC = ?', [cc]);
        
        if (votanteRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Votante no encontrado' 
            });
        }
        
        // Verificamos que no haya votado ya
        const votante = votanteRows[0];
        
        if (votante.YaVoto) {
            return res.status(400).json({ 
                success: false, 
                message: 'El votante ya ha votado anteriormente' 
            });
        }
        
        // Actualizamos el estado del votante
        await pool.query(`
            UPDATE Votante 
            SET YaVoto = 1, FechaVoto = NOW() 
            WHERE CC = ?
        `, [cc]);
        
        res.json({ 
            success: true, 
            message: 'Votante marcado como que ya votó',
            data: {
                cc: cc,
                yaVoto: true,
                fechaVoto: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error al marcar votante como votado:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al marcar votante como votado' 
        });
    }
});

app.post('/api/login', async (req, res) => {
    const { ci, password } = req.body;

    try {
        // Busca el miembro de mesa por CI
        const [rows] = await pool.query('SELECT * FROM MiembroMesa WHERE CI = ?', [ci]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'CI o contraseña incorrectos.' });
        }

        const miembro = rows[0];

        // Verifica que tenga contraseña registrada
        if (!miembro.Password) {
            return res.status(401).json({ success: false, message: 'Este usuario no tiene contraseña registrada.' });
        }

        // Compara la contraseña ingresada con el hash guardado
        const passwordOk = await bcrypt.compare(password, miembro.Password);
        if (!passwordOk) {
            return res.status(401).json({ success: false, message: 'CI o contraseña incorrectos.' });
        }

        // Si todo está bien, puedes devolver un token o solo un OK
        res.json({ success: true, message: 'Inicio de sesión exitoso', ci: miembro.CI });
    } catch (error) {
        console.error('Error en login de miembro de mesa:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

app.post('/api/register', async (req, res) => {
    const { ci, password } = req.body;

    try {
        // Verifica que exista el miembro de mesa
        const [rows] = await pool.query('SELECT * FROM MiembroMesa WHERE CI = ?', [ci]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No existe un miembro de mesa con esa CI.' });
        }

        // Hashea la contraseña
        const hash = await bcrypt.hash(password, 10);

        // Actualiza la contraseña en la base de datos
        await pool.query('UPDATE MiembroMesa SET Password = ? WHERE CI = ?', [hash, ci]);

        res.json({ success: true, message: 'Contraseña registrada correctamente.' });
    } catch (error) {
        console.error('Error al registrar contraseña de miembro de mesa:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
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