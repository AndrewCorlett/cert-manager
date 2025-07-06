import { Request, Response } from 'express';
import db from '../models/database';
import { Certificate, CertificateWithDaysRemaining } from '../models/Certificate';

const calculateDaysRemaining = (expiryDate: string): number => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getAllCertificates = (req: Request, res: Response) => {
  const query = `SELECT * FROM certificates ORDER BY expiry_date ASC`;
  
  db.all(query, (err, rows: Certificate[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const certificatesWithDays: CertificateWithDaysRemaining[] = rows.map(cert => ({
      ...cert,
      days_remaining: calculateDaysRemaining(cert.expiry_date),
      is_expired: calculateDaysRemaining(cert.expiry_date) < 0
    }));
    
    res.json(certificatesWithDays);
  });
};

export const getCertificateById = (req: Request, res: Response) => {
  const { id } = req.params;
  const query = `SELECT * FROM certificates WHERE id = ?`;
  
  db.get(query, [id], (err, row: Certificate) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    const certificateWithDays: CertificateWithDaysRemaining = {
      ...row,
      days_remaining: calculateDaysRemaining(row.expiry_date),
      is_expired: calculateDaysRemaining(row.expiry_date) < 0
    };
    
    res.json(certificateWithDays);
  });
};

export const createCertificate = (req: Request, res: Response) => {
  const { name, domain, issuer, issue_date, expiry_date, type, notes } = req.body;
  
  const query = `
    INSERT INTO certificates (name, domain, issuer, issue_date, expiry_date, type, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [name, domain, issuer, issue_date, expiry_date, type, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Certificate created successfully' });
  });
};

export const updateCertificate = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, domain, issuer, issue_date, expiry_date, type, status, notes } = req.body;
  
  const query = `
    UPDATE certificates 
    SET name = ?, domain = ?, issuer = ?, issue_date = ?, 
        expiry_date = ?, type = ?, status = ?, notes = ?, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(query, [name, domain, issuer, issue_date, expiry_date, type, status, notes, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.json({ message: 'Certificate updated successfully' });
  });
};

export const deleteCertificate = (req: Request, res: Response) => {
  const { id } = req.params;
  const query = `DELETE FROM certificates WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.json({ message: 'Certificate deleted successfully' });
  });
};

export const getExpiringCertificates = (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const query = `
    SELECT * FROM certificates 
    WHERE julianday(expiry_date) - julianday('now') <= ? 
    AND julianday(expiry_date) - julianday('now') >= 0
    ORDER BY expiry_date ASC
  `;
  
  db.all(query, [days], (err, rows: Certificate[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const certificatesWithDays: CertificateWithDaysRemaining[] = rows.map(cert => ({
      ...cert,
      days_remaining: calculateDaysRemaining(cert.expiry_date),
      is_expired: false
    }));
    
    res.json(certificatesWithDays);
  });
};