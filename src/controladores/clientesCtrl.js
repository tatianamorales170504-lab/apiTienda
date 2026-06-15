import {conmysql} from '../db.js'

export const getClientes=
    async(req,res)=>{

    try{
       const [result]= await conmysql.query(' select * from clientes')
       res.json(result)
    }catch(error){
      return res.status(500).json({message:"Error al consultar clientes"})
    }
}
//traer solo el cliente del id
export const getClientesxid=async(req,res)=>{
    try{
      const [result]= await conmysql.query('select * from clientes where cli_id=?',[req.params.id]);
      if(result.length<=0)return res.json(
        {
          cant:0,
          message:"Cliente no encontrado"
        }
      )
      res.json(
        {
          cantidad:result.length,
          data:result[0]
        }
      );
    }catch(error){
      return res.status(500).json({message:"error en el servidor"});
    }
}

//insertar
export const postInsertarCliente=async(req,res)=>{
    try{
      const {cli_identificacion,cli_nombre,cli_telefono,cli_correo,cli_direccion,cli_pais,cli_ciudad}=req.body;
      //console.log(req.body)
       const [result]= await conmysql.query(
         'insert into clientes(cli_identificacion,cli_nombre,cli_telefono,cli_correo,cli_direccion,cli_pais,cli_ciudad) values(?,?,?,?,?,?,?)',[cli_identificacion,cli_nombre,cli_telefono,cli_correo,cli_direccion,cli_pais,cli_ciudad]
       )
       res.send({cli_id: result.insertId})
   
    }catch(error){
      return res.status(500).json({message:"error en el servidor"});
    }
}

//modificar
export const putCliente=async(req,res)=>{
    try{
      const {id}=req.params
      const {cli_identificacion,cli_nombre,cli_telefono,cli_correo,cli_direccion,cli_pais,cli_ciudad}=req.body
      //console.log(req.body)
       const [result]= await conmysql.query(
         'update clientes set cli_identificacion=?,cli_nombre=?,cli_telefono=?,cli_correo=?,cli_direccion=?,cli_pais=?,cli_ciudad=? where cli_id=?',
         [cli_identificacion,cli_nombre,cli_telefono,cli_correo,cli_direccion,cli_pais,cli_ciudad,id]
       )
       res.send({"message": "Cliente actualizado"})
   
    }catch(error){
      return res.status(500).json({message:"error en el servidor"});
    }
}

// Modificar 
export const patchCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      cli_identificacion,cli_nombre,cli_telefono,cli_correo,cli_direccion,cli_pais,cli_ciudad} = req.body;

    const [result] = await conmysql.query(
      `UPDATE clientes SET cli_identificacion = IFNULL(?, cli_identificacion),cli_nombre = IFNULL(?, cli_nombre),cli_telefono = IFNULL(?, cli_telefono),cli_correo = IFNULL(?, cli_correo),cli_direccion = IFNULL(?, cli_direccion),
        cli_pais = IFNULL(?, cli_pais),cli_ciudad = IFNULL(?, cli_ciudad)WHERE cli_id = ?`,[cli_identificacion,cli_nombre,cli_telefono,cli_correo,cli_direccion,cli_pais,cli_ciudad,id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado"
      });
    }

    res.json({
      message: "Cliente actualizado parcialmente"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor"
    });
  }
};

// Eliminar
export const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        //Filtrado por ID
        const [result] = await conmysql.query(
            'DELETE FROM clientes WHERE cli_id = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        res.json({ message: "Cliente eliminado exitosamente" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error en el servidor al eliminar" });
    }
}