import * as cron from 'node-cron';
import { checkExpiringCertificates } from './notificationService';

export const startCronJobs = () => {
  cron.schedule('0 9 * * *', () => {
    console.log('Running daily certificate expiration check...');
    checkExpiringCertificates();
  });
  
  console.log('Cron jobs started - Certificate expiration check scheduled for 9:00 AM daily');
};