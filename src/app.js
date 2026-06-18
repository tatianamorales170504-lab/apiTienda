import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import clientesRoutes from './routes/clientes.routes.js';
import productosRoutes from './routes/productos.routes.js';
import authRoutes from './routes/auth.routes.js';

// Configuración para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración de CORS más permisiva para evitar bloqueos
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// IMPORTANTE: Hemos eliminado app.use('/uploads', ...) 
// porque ahora tus imágenes viven en Sirv (S3). 
// Tu servidor ya no necesita buscar archivos en el disco local.

// Rutas
app.use('/api', authRoutes);
app.use('/api', clientesRoutes);
app.use('/api', productosRoutes);

// Ruta para verificar si el servidor responde correctamente
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Servidor operativo' });
});

// Manejo de errores 404
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Endpoint no encontrado'
    });
});

export default app;