import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './models/database';
import certificateRoutes from './routes/certificateRoutes';
import { startCronJobs } from './services/cronService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/certificates', certificateRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

initializeDatabase().then(() => {
  startCronJobs();
  app.listen(PORT, () => {
    console.log(`Certificate Manager running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});