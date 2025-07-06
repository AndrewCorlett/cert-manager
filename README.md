# Certificate Manager

A web-based certificate management system to track SSL/TLS certificates and their expiration dates.

## Features

- Track multiple types of certificates (SSL/TLS, Code Signing, Email, etc.)
- Visual dashboard showing certificate status
- Automatic expiration alerts
- Email notifications for certificates expiring within 30 days
- Filter certificates by status (all, expiring soon, expired)
- CRUD operations for certificate management

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   PORT=3000
   DB_PATH=./database.db
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   NOTIFICATION_EMAIL=admin@example.com
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

5. Start the application:
   ```bash
   npm run dev
   ```

## Usage

1. Access the application at `http://localhost:3000`
2. Click "Add New Certificate" to add a certificate
3. Fill in the certificate details including expiry date
4. The system will automatically track expiration and send email alerts

## Email Notifications

The system checks daily at 9:00 AM for certificates expiring within 30 days and sends an email notification to the configured address.

## API Endpoints

- `GET /api/certificates` - Get all certificates
- `GET /api/certificates/:id` - Get specific certificate
- `GET /api/certificates/expiring?days=30` - Get expiring certificates
- `POST /api/certificates` - Create new certificate
- `PUT /api/certificates/:id` - Update certificate
- `DELETE /api/certificates/:id` - Delete certificate