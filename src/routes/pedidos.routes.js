import { Router } from 'express';
import { crearPedido } from '../controladores/pedidosCtrl.js';

const router = Router();

// Definimos la ruta POST para crear el pedido completo
router.post('/', crearPedido);

export default router;