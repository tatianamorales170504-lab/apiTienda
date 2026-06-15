import {Router} from 'express'
import {verificarToken} from '../middlewares/auth.js';
import {getClientes,getClientesxid,postInsertarCliente,putCliente,patchCliente,deleteCliente} from '../controladores/clientesCtrl.js'
const router=Router()
// armar nuestras rutas

router.get('/clientes',verificarToken,getClientes)

router.get('/clientes/:id',getClientesxid)
router.post('/clientes',postInsertarCliente)
router.put('/clientes/:id',putCliente)
router.patch('/clientes/:id',patchCliente)
router.delete('/clientes/:id',deleteCliente)
export default router