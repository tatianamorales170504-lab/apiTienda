import express from 'express';
import cors from 'cors';
import path from 'path'; // Importa path
import { fileURLToPath } from 'url'; // Importa para definir __dirname

import clientesRoutes from './routes/clientes.routes.js';
import productosRoutes from './routes/productos.routes.js';
import authRoutes from './routes/auth.routes.js';

// Configuración para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// --- AGREGA ESTA LÍNEA PARA HACER LA CARPETA PÚBLICA ---
app.use('/uploads', express.static('uploads'));

// rutas
app.use('/api', authRoutes);
app.use('/api', clientesRoutes);
app.use('/api', productosRoutes);

app.use((req, res, next) => {
    res.status(400).json({
        message: 'Endpoint not found'
    });
});

export default app;