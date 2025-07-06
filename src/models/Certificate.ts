export interface Certificate {
  id?: number;
  name: string;
  domain: string;
  issuer?: string;
  issue_date: string;
  expiry_date: string;
  type: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CertificateWithDaysRemaining extends Certificate {
  days_remaining: number;
  is_expired: boolean;
}