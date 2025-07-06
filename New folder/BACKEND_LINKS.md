# Backend Integration Points

This document lists all the places where Phase 2 backend logic (Supabase + OpenAI) will need to be integrated.

## Certificate Management

| Component | Hook ID | Location | Description | Future Supabase Call |
|-----------|---------|----------|-------------|---------------------|
| `useCertStore.fetchCertificates` | `FETCH_CERTS` | `src/lib/store.ts:89` | Fetch all certificates from database | `GET /certificates` |
| `useCertStore.addCertificate` | `ADD_CERT` | `src/lib/store.ts:52` | Add new certificate to database | `POST /certificates` |
| `useCertStore.updateCertificate` | `UPDATE_CERT` | `src/lib/store.ts:59` | Update certificate metadata | `PUT /certificates/:id` |
| `useCertStore.deleteCertificate` | `DELETE_CERT` | `src/lib/store.ts:66` | Delete certificate from database | `DELETE /certificates/:id` |

## File Operations

| Component | Hook ID | Location | Description | Future Implementation |
|-----------|---------|----------|-------------|---------------------|
| `FileTree.onAddDocument` | `ADD_DOCUMENT` | `src/components/FileTree.tsx:44` | Upload new document | Supabase Storage + AI Vision |
| Certificate Upload | `UPLOAD_FILE` | Upload page (to be created) | Process PDF upload | Storage upload + metadata extraction |

## Email & Communication

| Component | Hook ID | Location | Description | Future Implementation |
|-----------|---------|----------|-------------|---------------------|
| `SendPanel.handleSend` | `SEND_CERTIFICATES` | `src/app/page.tsx:25` | Send certificates via email | Email service integration |
| `SendPanel.handleSend` | `SEND_CERTIFICATES` | `src/app/cert/[id]/page.tsx:28` | Send certificates from viewer | Email service integration |

## Settings & Preferences

| Component | Hook ID | Location | Description | Future Implementation |
|-----------|---------|----------|-------------|---------------------|
| `SettingsPanel.handleSave` | `SAVE_SETTINGS` | `src/components/SettingsPanel.tsx:144` | Save user preferences | User settings API |

## AI Features (Future)

| Feature | Hook ID | Description | Future Implementation |
|---------|---------|-------------|---------------------|
| Certificate OCR | `OCR_EXTRACT` | Extract text and metadata from PDFs | OpenAI Vision API |
| Smart Categorization | `AUTO_CATEGORIZE` | Automatically categorize certificates | OpenAI classification |
| Expiry Notifications | `NOTIFY_EXPIRY` | Automated expiry reminders | Cron job + email service |

## Authentication (Phase 2)

| Component | Hook ID | Description | Future Implementation |
|-----------|---------|-------------|---------------------|
| User Login | `AUTH_LOGIN` | Google OAuth integration | Supabase Auth |
| User Profile | `AUTH_PROFILE` | User profile management | Supabase user metadata |

## Database Schema (Supabase)

### Tables to Create in Phase 2:

1. **users**
   - id (uuid, primary key)
   - email (text)
   - name (text)
   - notification_days (integer, default 30)
   - email_template (text)
   - created_at (timestamp)

2. **certificates**
   - id (uuid, primary key)
   - user_id (uuid, foreign key)
   - name (text)
   - category (text)
   - file_path (text)
   - file_url (text)
   - issue_date (date)
   - expiry_date (date)
   - serial_number (text)
   - status (text)
   - created_at (timestamp)
   - updated_at (timestamp)

3. **certificate_metadata**
   - id (uuid, primary key)
   - certificate_id (uuid, foreign key)
   - extracted_text (text)
   - confidence_score (float)
   - processing_status (text)

## Edge Functions (Supabase)

1. **certificate-processor**
   - Process uploaded PDFs
   - Extract metadata using AI
   - Update database records

2. **notification-service**
   - Check for expiring certificates
   - Send email notifications
   - Update notification logs

## Storage Buckets (Supabase)

1. **certificates**
   - Store PDF files
   - Public read access for authenticated users
   - File upload policies

## Real-time Subscriptions

1. **Certificate Updates**
   - Listen for certificate status changes
   - Update UI in real-time
   - Handle concurrent user sessions

---

*This document will be updated as new backend integration points are identified during development.*