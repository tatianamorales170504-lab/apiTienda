import { Router } from 'express';
// Cambia 'controllers' por 'controladores'
import { getProductos, postProducto, putProducto, deleteProducto } from '../controladores/productosCtrl.js';

const router = Router();

router.get('/productos', getProductos);
router.post('/productos', postProducto);
router.put('/productos/:id', putProducto);
router.delete('/productos/:id', deleteProducto);

export default router;