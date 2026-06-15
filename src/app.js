import express from 'express';
import cors from 'cors';

import clientesRoutes from './routes/clientes.routes.js';
import productosRoutes from './routes/productos.routes.js';
import authRoutes from './routes/auth.routes.js';


const app = express();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

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