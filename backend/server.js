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
    let { idEleccion, votoObservado, tipoVoto, numeroLista, circuito } = req.body;

    try {
        // 1. Obtener la CI del votante
        const [votanteRows] = await pool.query('SELECT CI FROM Votante WHERE CC = ?', [cc]);
        if (votanteRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Votante no encontrado' });
        }
        const ciVotante = votanteRows[0].CI;

        // 2. Consultar si es miembro de mesa
        const [miembroRows] = await pool.query('SELECT * FROM MiembroMesa WHERE CI = ?', [ciVotante]);
        const esMiembroMesa = miembroRows.length > 0;

        // 3. Verificar circuito y voto observado si es miembro de mesa
        if (esMiembroMesa) {
            // Buscar el circuito asignado al votante en VotaEn
            const [votaEnRows] = await pool.query('SELECT Circuito FROM VotaEn WHERE VotanteCC = ?', [cc]);
            if (votaEnRows.length === 0) {
                return res.status(404).json({ success: false, message: 'No hay registro de circuito para este votante' });
            }
            const circuitoAsignado = votaEnRows[0].Circuito;

            // El circuito donde está votando debe ser el mismo que el asignado
            if (parseInt(circuito) !== parseInt(circuitoAsignado)) {
                return res.status(403).json({
                    success: false,
                    message: 'Un miembro de mesa solo puede votar en el circuito donde está asignado como mesa.'
                });
            }

            // Forzar voto observado
            votoObservado = 1;
        }

        // 4. Verificar que no haya votado ya
        const [rows] = await pool.query('SELECT * FROM VotaEn WHERE VotanteCC = ?', [cc]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay registro de circuito para este votante'
            });
        }
        if (rows[0].Se_Presento) {
            return res.status(400).json({
                success: false,
                message: 'El votante ya ha votado anteriormente'
            });
        }

        // 5. Actualizar el estado en VotaEn
        await pool.query(`
            UPDATE VotaEn
            SET Se_Presento = 1, Hora_que_Voto = NOW(), Voto_Observado = ?
            WHERE VotanteCC = ?
        `, [votoObservado ? 1 : 0, cc]);

        // 6. Insertar el voto en la tabla Voto
        await pool.query(`
            INSERT INTO Voto (Tipo, Numero_de_Lista, Circuito)
            VALUES (?, ?, ?)
        `, [tipoVoto, numeroLista, circuito]);

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

        // Obtener votos en blanco
        const [votosBlancoResult] = await pool.query(`
            SELECT COUNT(*) as votos
            FROM Voto 
            WHERE Tipo = 2
        `);
        const votosBlanco = votosBlancoResult[0].votos;
        const porcentajeBlanco = totalVotos > 0 ? ((votosBlanco / totalVotos) * 100).toFixed(1) : 0;

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

        // Agregar votos en blanco al final
        if (votosBlanco > 0) {
            votosFormateados.push({
                numeroLista: null,
                nombrePartido: 'VOTO EN BLANCO',
                votos: votosBlanco,
                porcentaje: parseFloat(porcentajeBlanco)
            });
        }

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

// ===== ENDPOINT DE RECUENTO DE VOTOS POR CIRCUITO =====
app.get('/api/recuento-votos-circuito', async (req, res) => {
    try {
        // Obtener todos los circuitos
        const [circuitos] = await pool.query('SELECT Id FROM Circuito ORDER BY Id');
        // Mapear números de lista a nombres de partidos (igual que en el recuento global)
        const mapeoPartidos = {
            1: 'PARTIDO NACIONAL',
            2: 'CABILDO ABIERTO',
            3: 'FRENTE AMPLIO',
            4: 'PARTIDO COLORADO',
            5: 'PARTIDO INDEPENDIENTE'
        };
        const resultado = [];
        for (const circuito of circuitos) {
            const circuitoId = circuito.Id;
            // Total de votos en el circuito
            const [totalVotosResult] = await pool.query('SELECT COUNT(*) as total FROM Voto WHERE Circuito = ?', [circuitoId]);
            const totalVotos = totalVotosResult[0].total;
            // Votos observados en el circuito
            const [observadosResult] = await pool.query('SELECT COUNT(*) as total FROM Voto WHERE Circuito = ? AND Voto_Observado = 1', [circuitoId]);
            const votosObservados = observadosResult[0].total;
            // Votos por lista en el circuito
            const [votosPorLista] = await pool.query(`
                SELECT l.Numero_Lista, COUNT(v.Id) as votos
                FROM Lista l
                LEFT JOIN Voto v ON l.Numero_Lista = v.Numero_de_Lista AND v.Circuito = ?
                GROUP BY l.Numero_Lista
                ORDER BY votos DESC
            `, [circuitoId]);
            // Votos en blanco en el circuito
            const [votosBlancoResult] = await pool.query('SELECT COUNT(*) as votos FROM Voto WHERE Tipo = 2 AND Circuito = ?', [circuitoId]);
            const votosBlanco = votosBlancoResult[0].votos;
            // Formatear resultados
            const votosFormateados = votosPorLista.map(item => ({
                numeroLista: item.Numero_Lista,
                nombrePartido: mapeoPartidos[item.Numero_Lista] || `Lista ${item.Numero_Lista}`,
                votos: item.votos
            }));
            if (votosBlanco > 0) {
                votosFormateados.push({
                    numeroLista: null,
                    nombrePartido: 'VOTO EN BLANCO',
                    votos: votosBlanco
                });
            }
            resultado.push({
                circuito: circuitoId,
                votosTotales: totalVotos,
                votosObservados: votosObservados,
                votosPorLista: votosFormateados
            });
        }
        res.json({ success: true, data: resultado, ultimaActualizacion: new Date().toISOString() });
    } catch (error) {
        console.error('Error al obtener recuento de votos por circuito:', error);
        res.status(500).json({ success: false, error: 'Error al obtener recuento de votos por circuito' });
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

        // Validar lista solo si NO es voto en blanco
        if (tipoVoto !== 2 && numeroLista) {
            const [listaRows] = await pool.query('SELECT * FROM Lista WHERE Numero_Lista = ?', [numeroLista]);
            if (listaRows.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Lista no válida' 
                });
            }
        }

        // IMPORTANTE: Registrar el voto SIN vincular al votante (VOTO SECRETO)
        // Para voto en blanco, numeroLista será NULL
        const [resultadoVoto] = await pool.query(`
            INSERT INTO Voto (Tipo, Numero_de_Lista, Circuito) 
            VALUES (?, ?, ?)
        `, [tipoVoto, numeroLista || null, idCircuito]);

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

// ===== ENDPOINT PARA CONTAR VOTOS OBSERVADOS =====
app.get('/api/votos-observados', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as total FROM Voto WHERE Voto_Observado = 1');
        res.json({ success: true, totalVotosObservados: rows[0].total });
    } catch (error) {
        console.error('Error al contar votos observados:', error);
        res.status(500).json({ success: false, error: 'Error al contar votos observados' });
    }
});

// ===== ENDPOINT DE RECUENTO DE VOTOS POR DEPARTAMENTO Y LISTA =====
app.get('/api/recuento-votos-departamento', async (req, res) => {
    try {
        // Consulta para obtener el recuento de votos por departamento y lista (sin l.Nombre)
        const [rows] = await pool.query(`
            SELECT d.Nombre AS departamento, l.Numero_Lista, COUNT(v.Id) AS votos
            FROM Voto v
            JOIN Circuito c ON v.Circuito = c.Id
            JOIN Establecimiento e ON c.Id_Establecimiento = e.Id
            JOIN Zona z ON e.Zona = z.Codigo_Postal
            JOIN Departamento d ON z.Departamento = d.Nombre
            JOIN Lista l ON v.Numero_de_Lista = l.Numero_Lista
            GROUP BY d.Nombre, l.Numero_Lista
            ORDER BY d.Nombre, l.Numero_Lista
        `);
        // Consulta para obtener votos en blanco por departamento
        const [blancos] = await pool.query(`
            SELECT d.Nombre AS departamento, COUNT(v.Id) AS votos_blanco
            FROM Voto v
            JOIN Circuito c ON v.Circuito = c.Id
            JOIN Establecimiento e ON c.Id_Establecimiento = e.Id
            JOIN Zona z ON e.Zona = z.Codigo_Postal
            JOIN Departamento d ON z.Departamento = d.Nombre
            WHERE v.Tipo = 2
            GROUP BY d.Nombre
        `);
        // Agrupar por departamento
        const resultado = {};
        for (const row of rows) {
            if (!resultado[row.departamento]) {
                resultado[row.departamento] = { votosPorLista: [], votosEnBlanco: 0 };
            }
            resultado[row.departamento].votosPorLista.push({
                numeroLista: row.Numero_Lista,
                nombreLista: `Lista ${row.Numero_Lista}`,
                votos: row.votos
            });
        }
        for (const blanco of blancos) {
            if (!resultado[blanco.departamento]) {
                resultado[blanco.departamento] = { votosPorLista: [], votosEnBlanco: 0 };
            }
            resultado[blanco.departamento].votosEnBlanco = blanco.votos_blanco;
        }
        // Convertir a array de objetos
        const resultadoArray = Object.entries(resultado).map(([departamento, datos]) => ({
            departamento,
            votosPorLista: datos.votosPorLista,
            votosEnBlanco: datos.votosEnBlanco
        }));
        res.json({ success: true, data: resultadoArray });
    } catch (error) {
        console.error('Error al obtener recuento de votos por departamento:', error);
        res.status(500).json({ success: false, error: 'Error al obtener recuento de votos por departamento' });
    }
});

// Obtener la fecha/hora de fin de la elección para el presidente de mesa (por CI)
app.get('/api/eleccion/estado/:ci', async (req, res) => {
    const { ci } = req.params;
    try {
        // Buscar el presidente de mesa y su circuito
        const [presRows] = await pool.query('SELECT * FROM Presidente_de_Mesa WHERE CI = ?', [ci]);
        if (presRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Presidente de mesa no encontrado' });
        }
        const circuitoId = presRows[0].Circuito;
        if (!circuitoId) {
            return res.status(400).json({ success: false, message: 'El presidente de mesa no tiene circuito asignado' });
        }
        // Buscar el circuito y la elección asociada
        const [circRows] = await pool.query('SELECT * FROM Circuito WHERE Id = ?', [circuitoId]);
        if (circRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Circuito no encontrado' });
        }
        const eleccionId = circRows[0].Id_Eleccion;
        if (!eleccionId) {
            return res.status(400).json({ success: false, message: 'El circuito no tiene elección asociada' });
        }
        // Buscar la elección y su fecha/hora de fin
        const [eleccionRows] = await pool.query('SELECT * FROM Eleccion WHERE Id = ?', [eleccionId]);
        if (eleccionRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Elección no encontrada' });
        }
        const eleccion = eleccionRows[0];
        res.json({
            success: true,
            data: {
                tipo: eleccion.Tipo,
                fechaHoraInicio: eleccion.Fecha_Hora_Inicio,
                fechaHoraFin: eleccion.Fecha_Hora_Fin
            }
        });
    } catch (error) {
        console.error('Error al obtener estado de la elección:', error);
        res.status(500).json({ success: false, message: 'Error al obtener estado de la elección' });
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