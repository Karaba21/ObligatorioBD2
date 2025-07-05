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

// Obtener listas con información de partidos
app.get('/api/listas', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT l.Numero_Lista, l.Id_Partido, p.Nombre as NombrePartido, p.Sede
            FROM Lista l
            JOIN Partido p ON l.Id_Partido = p.Id
            ORDER BY l.Numero_Lista
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al consultar listas:', error);
        res.status(500).json({ success: false, error: 'Error al consultar listas' });
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

// ===== ENDPOINT PARA EXPLORAR TODAS LAS TABLAS =====
app.get('/api/debug/all-tables', async (req, res) => {
    try {
        // Obtener todas las tablas de la base de datos
        const [tables] = await pool.query('SHOW TABLES');
        
        const tableInfo = {};
        
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            
            // Obtener estructura de cada tabla
            const [structure] = await pool.query(`DESCRIBE ${tableName}`);
            
            // Obtener algunos datos de ejemplo
            const [data] = await pool.query(`SELECT * FROM ${tableName} LIMIT 3`);
            
            tableInfo[tableName] = {
                structure,
                data
            };
        }
        
        res.json({
            success: true,
            data: tableInfo
        });
    } catch (error) {
        console.error('Error al explorar tablas:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== APIs DE GESTIÓN DE VOTANTES =====

// 1. Buscar votante por CC
app.get('/api/votantes/:cc', async (req, res) => {
    const { cc } = req.params;
    
    try {
        const [rows] = await pool.query(`
            SELECT v.*, p.Nombre, p.Fecha_Nacimiento, ve.Circuito as CircuitoAsignado
            FROM Votante v 
            JOIN Persona p ON v.CI = p.CI
            LEFT JOIN VotaEn ve ON v.CC = ve.VotanteCC
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
        // Verificamos en la tabla VotaEn si el votante ya se presentó
        const [rows] = await pool.query(`
            SELECT Se_Presento, Hora_que_Voto
            FROM VotaEn
            WHERE VotanteCC = ?
        `, [cc]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No hay registro de circuito para este votante' 
            });
        }

        res.json({ 
            success: true, 
            data: {
                cc: cc,
                yaVoto: Boolean(rows[0].Se_Presento),
                fechaVoto: rows[0].Hora_que_Voto || null
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
        // Verificamos que el registro exista en VotaEn
        const [rows] = await pool.query('SELECT * FROM VotaEn WHERE VotanteCC = ?', [cc]);
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No hay registro de circuito para este votante' 
            });
        }

        // Verificamos que no haya votado ya
        if (rows[0].Se_Presento) {
            return res.status(400).json({ 
                success: false, 
                message: 'El votante ya ha votado anteriormente' 
            });
        }

        // Actualizamos el estado en VotaEn
        await pool.query(`
            UPDATE VotaEn
            SET Se_Presento = 1, Hora_que_Voto = NOW()
            WHERE VotanteCC = ?
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

// ===== ENDPOINT DE RECUENTO DE VOTOS =====

// Recuento total de votos por lista
app.get('/api/recuento-votos', async (req, res) => {
    try {
        // Obtener total de votantes
        const [totalVotantesResult] = await pool.query('SELECT COUNT(*) as total FROM Votante');
        const totalVotantes = totalVotantesResult[0].total;

        // Obtener total de votos emitidos
        const [totalVotosResult] = await pool.query('SELECT COUNT(*) as total FROM Voto');
        const totalVotos = totalVotosResult[0].total;

        // Calcular porcentaje de participación
        const participacion = totalVotantes > 0 ? ((totalVotos / totalVotantes) * 100).toFixed(1) : 0;

        // Obtener recuento por lista con información del partido
        const [votosPorLista] = await pool.query(`
            SELECT 
                l.Numero_Lista,
                p.Id as IdPartido,
                COUNT(v.Id) as votos,
                ROUND((COUNT(v.Id) / ?) * 100, 1) as porcentaje
            FROM Lista l
            LEFT JOIN Voto v ON l.Numero_Lista = v.Numero_de_Lista
            LEFT JOIN Partido p ON l.Id_Partido = p.Id
            GROUP BY l.Numero_Lista, p.Id
            ORDER BY votos DESC
        `, [totalVotos]);

        // Mapear números de lista a nombres de partidos (hardcodeado por ahora)
        const mapeoPartidos = {
            1: 'PARTIDO NACIONAL',
            2: 'CABILDO ABIERTO', 
            3: 'FRENTE AMPLIO',
            4: 'PARTIDO COLORADO',
            5: 'PARTIDO INDEPENDIENTE'
        };

        const votosFormateados = votosPorLista.map(item => ({
            numeroLista: item.Numero_Lista,
            nombrePartido: mapeoPartidos[item.Numero_Lista] || `Lista ${item.Numero_Lista}`,
            votos: item.votos,
            porcentaje: parseFloat(item.porcentaje) || 0
        }));

        res.json({
            success: true,
            data: {
                totalVotantes,
                totalVotos,
                participacion: parseFloat(participacion),
                votosPorLista: votosFormateados,
                ultimaActualizacion: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error al obtener recuento de votos:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener recuento de votos' 
        });
    }
});

// ===== ENDPOINT PARA REGISTRAR VOTO =====

// Registrar un voto en la tabla Voto (VOTO SECRETO)
app.post('/api/registrar-voto', async (req, res) => {
    const { ccVotante, numeroLista, idCircuito, tipoVoto = 1 } = req.body;
    
    try {
        // Verificar que el votante existe
        const [votanteRows] = await pool.query('SELECT * FROM Votante WHERE CC = ?', [ccVotante]);
        if (votanteRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Votante no encontrado' 
            });
        }

        // Verificar que la lista existe
        const [listaRows] = await pool.query('SELECT * FROM Lista WHERE Numero_Lista = ?', [numeroLista]);
        if (listaRows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Lista no válida' 
            });
        }

        // Verificar que el circuito existe
        const [circuitoRows] = await pool.query('SELECT * FROM Circuito WHERE Id = ?', [idCircuito]);
        if (circuitoRows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Circuito no válido' 
            });
        }

        // Verificar que el votante no haya votado ya (usando VotaEn)
        const [votaEnRows] = await pool.query('SELECT * FROM VotaEn WHERE VotanteCC = ? AND Circuito = ?', [ccVotante, idCircuito]);
        if (votaEnRows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'El votante no está registrado en este circuito' 
            });
        }

        if (votaEnRows[0].Se_Presento) {
            return res.status(400).json({ 
                success: false, 
                message: 'El votante ya ha votado anteriormente' 
            });
        }

        // IMPORTANTE: Registrar el voto SIN vincular al votante (VOTO SECRETO)
        const [resultadoVoto] = await pool.query(`
            INSERT INTO Voto (Tipo, Numero_de_Lista, Circuito) 
            VALUES (?, ?, ?)
        `, [tipoVoto, numeroLista, idCircuito]);

        // Actualizar el estado en VotaEn (solo que votó, NO qué votó)
        await pool.query(`
            UPDATE VotaEn 
            SET Se_Presento = 1, Hora_que_Voto = NOW()
            WHERE VotanteCC = ? AND Circuito = ?
        `, [ccVotante, idCircuito]);

        res.json({ 
            success: true, 
            message: 'Voto registrado correctamente',
            data: {
                idVoto: resultadoVoto.insertId,
                // NO incluir ccVotante ni numeroLista en la respuesta
                idCircuito,
                fechaVoto: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error al registrar voto:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al registrar voto' 
        });
    }
});

app.post('/api/login', async (req, res) => {
    const { ci, password } = req.body;

    try {
        // Busca el miembro de mesa por CI
        const [rows] = await pool.query('SELECT * FROM Presidente_de_Mesa WHERE CI = ?', [ci]);
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
        const [rows] = await pool.query('SELECT * FROM Presidente_de_Mesa WHERE CI = ?', [ci]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No existe un miembro de mesa con esa CI.' });
        }

        // Hashea la contraseña
        const hash = await bcrypt.hash(password, 10);

        // Actualiza la contraseña en la base de datos
        await pool.query('UPDATE Presidente_de_Mesa SET Password = ? WHERE CI = ?', [hash, ci]);

        res.json({ success: true, message: 'Contraseña registrada correctamente.' });
    } catch (error) {
        console.error('Error al registrar contraseña de miembro de mesa:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

app.get('/api/presidente/:ci', async (req, res) => {
    const { ci } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Presidente_de_Mesa WHERE CI = ?', [ci]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Presidente no encontrado' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al buscar presidente' });
    }
});

// Verificar si un votante está votando en el circuito correcto
app.get('/api/votantes/:cc/verificar-circuito', async (req, res) => {
    const { cc } = req.params;
    const { circuitoPresidente } = req.query; // Circuito del presidente de mesa
    
    try {
        // Buscar el votante y su circuito asignado
        const [votanteRows] = await pool.query(`
            SELECT v.*, p.Nombre, p.Fecha_Nacimiento, ve.Circuito as CircuitoAsignado
            FROM Votante v 
            JOIN Persona p ON v.CI = p.CI
            LEFT JOIN VotaEn ve ON v.CC = ve.VotanteCC
            WHERE v.CC = ?
        `, [cc]);
        
        if (votanteRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Votante no encontrado' 
            });
        }
        
        const votante = votanteRows[0];
        const circuitoAsignado = votante.CircuitoAsignado;
        const circuitoActual = parseInt(circuitoPresidente);
        
        // Verificar si el votante está en el circuito correcto
        const circuitoCorrecto = circuitoAsignado === circuitoActual;
        
        res.json({ 
            success: true, 
            data: {
                votante: {
                    CC: votante.CC,
                    Nombre: votante.Nombre,
                    Fecha_Nacimiento: votante.Fecha_Nacimiento
                },
                circuitoAsignado: circuitoAsignado,
                circuitoActual: circuitoActual,
                circuitoCorrecto: circuitoCorrecto,
                mensaje: circuitoCorrecto 
                    ? 'El votante está en el circuito correcto' 
                    : 'El votante NO está en el circuito correcto'
            }
        });
    } catch (error) {
        console.error('Error al verificar circuito del votante:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al verificar circuito del votante' 
        });
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