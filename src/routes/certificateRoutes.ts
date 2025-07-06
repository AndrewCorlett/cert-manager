import express from 'express';
import {
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getExpiringCertificates
} from '../controllers/certificateController';

const router = express.Router();

router.get('/', getAllCertificates);
router.get('/expiring', getExpiringCertificates);
router.get('/:id', getCertificateById);
router.post('/', createCertificate);
router.put('/:id', updateCertificate);
router.delete('/:id', deleteCertificate);

export default router;