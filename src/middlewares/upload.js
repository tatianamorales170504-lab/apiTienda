import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

// 1. Configuración del cliente S3 para Sirv
// Se añade forcePathStyle: true para evitar el error de certificado TLS
const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: 'https://s3.sirv.com',
  forcePathStyle: true, 
  credentials: {
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET
  }
});

// 2. Configura multer para que envíe los archivos a tu bucket de Sirv
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'tiendaimagenes',
    // acl: 'public-read' puede no ser necesario dependiendo de la config de tu bucket en Sirv, 
    // si te da error al subir, simplemente comenta o borra esta línea.
    key: (req, file, cb) => {
      // Guardamos en la carpeta 'productos'
      cb(null, `productos/${Date.now()}-${file.originalname}`);
    }
  })
});

export default upload;