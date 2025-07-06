import nodemailer from 'nodemailer';
import db from '../models/database';
import { Certificate } from '../models/Certificate';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

interface ExpiringCertificate extends Certificate {
  days_remaining: number;
}

export const checkExpiringCertificates = async () => {
  const query = `
    SELECT *, 
           CAST(julianday(expiry_date) - julianday('now') AS INTEGER) as days_remaining
    FROM certificates 
    WHERE julianday(expiry_date) - julianday('now') BETWEEN 0 AND 30
    ORDER BY expiry_date ASC
  `;
  
  db.all(query, async (err, rows: ExpiringCertificate[]) => {
    if (err) {
      console.error('Error checking expiring certificates:', err);
      return;
    }
    
    if (rows.length === 0) {
      console.log('No certificates expiring in the next 30 days');
      return;
    }
    
    const emailContent = generateEmailContent(rows);
    
    try {
      await sendNotificationEmail(emailContent);
      console.log(`Notification sent for ${rows.length} expiring certificates`);
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  });
};

const generateEmailContent = (certificates: ExpiringCertificate[]): string => {
  let content = `
    <h2>Certificate Expiration Notice</h2>
    <p>The following certificates are expiring soon:</p>
    <table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">Certificate Name</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Domain</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Type</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Expiry Date</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Days Remaining</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  certificates.forEach(cert => {
    const rowStyle = cert.days_remaining <= 7 ? 'background-color: #ffcccc;' : '';
    content += `
      <tr style="${rowStyle}">
        <td style="border: 1px solid #ddd; padding: 8px;">${cert.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${cert.domain}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${cert.type}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${new Date(cert.expiry_date).toLocaleDateString()}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${cert.days_remaining} days</td>
      </tr>
    `;
  });
  
  content += `
      </tbody>
    </table>
    <p style="margin-top: 20px;">Please take action to renew these certificates before they expire.</p>
  `;
  
  return content;
};

const sendNotificationEmail = async (content: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.NOTIFICATION_EMAIL,
    subject: 'Certificate Expiration Alert',
    html: content
  };
  
  return transporter.sendMail(mailOptions);
};