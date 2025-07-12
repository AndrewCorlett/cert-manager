-- Initial Authentication and Certificate Management Schema
-- This migration creates a secure, multi-user certificate management system
-- with zero-knowledge architecture and enterprise-grade security

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
-- Stores additional user information beyond auth.users
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    encryption_key_salt TEXT NOT NULL, -- Salt for client-side key derivation
    preferences JSONB DEFAULT '{}', -- User preferences (theme, notifications, etc.)
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates Table (Multi-user with encryption)
-- Stores certificate metadata with client-side encryption support
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Certificate metadata (may be encrypted on client-side)
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('STCW', 'GWO', 'OPITO', 'Contracts', 'Other')),
    encrypted_data JSONB, -- Client-side encrypted sensitive data
    
    -- File storage information
    file_path TEXT, -- Path in Supabase Storage
    file_url TEXT, -- Direct URL for file access
    file_type TEXT CHECK (file_type IN ('pdf', 'image')),
    file_size INTEGER,
    
    -- Certificate dates and status
    issue_date DATE,
    expiry_date DATE,
    serial_number TEXT,
    issuing_organization TEXT,
    status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'upcoming')),
    
    -- Search and filtering support
    searchable_content TEXT, -- Unencrypted data for search
    tags TEXT[], -- User-defined tags
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificate Sharing Table
-- Enables secure sharing of certificates between users
CREATE TABLE public.certificate_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_id UUID REFERENCES public.certificates(id) ON DELETE CASCADE NOT NULL,
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    shared_with_email TEXT NOT NULL,
    shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Sharing permissions
    permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'download')),
    
    -- Security and expiry
    access_token TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    expires_at TIMESTAMP WITH TIME ZONE,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE
);

-- Audit Log Table
-- Comprehensive audit trail for security and compliance
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Action details
    action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'share', 'login', 'logout'
    resource_type TEXT NOT NULL, -- 'certificate', 'user_profile', 'share'
    resource_id UUID,
    
    -- Context
    details JSONB, -- Additional action-specific data
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table (Optional - for enhanced session management)
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Session details
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    
    -- Security
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_status ON public.certificates(status);
CREATE INDEX idx_certificates_expiry_date ON public.certificates(expiry_date);
CREATE INDEX idx_certificates_category ON public.certificates(category);
CREATE INDEX idx_certificates_updated_at ON public.certificates(updated_at);
CREATE INDEX idx_certificate_shares_certificate_id ON public.certificate_shares(certificate_id);
CREATE INDEX idx_certificate_shares_access_token ON public.certificate_shares(access_token);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- RLS Policies for certificates (Ultra-secure user isolation)
CREATE POLICY "Users can view own certificates" ON public.certificates
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certificates" ON public.certificates
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own certificates" ON public.certificates
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own certificates" ON public.certificates
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policies for certificate_shares
CREATE POLICY "Users can view shares they own" ON public.certificate_shares
    FOR SELECT TO authenticated
    USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can view shares directed to them" ON public.certificate_shares
    FOR SELECT TO authenticated
    USING (auth.uid() = shared_with_user_id);

CREATE POLICY "Users can create shares for own certificates" ON public.certificate_shares
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = owner_user_id AND
        EXISTS (
            SELECT 1 FROM public.certificates 
            WHERE id = certificate_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own shares" ON public.certificate_shares
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_user_id)
    WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete own shares" ON public.certificate_shares
    FOR DELETE TO authenticated
    USING (auth.uid() = owner_user_id);

-- RLS Policies for audit_logs (Users can view their own logs)
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- System can insert audit logs (no user restriction for logging)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.user_sessions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.user_sessions
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Functions for enhanced security and automation

-- Function to automatically create user profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, avatar_url, encryption_key_salt)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        encode(gen_random_bytes(32), 'hex') -- Generate random salt for encryption
    );
    
    -- Log user creation
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
    VALUES (
        NEW.id,
        'create',
        'user_profile',
        NEW.id,
        jsonb_build_object('email', NEW.email, 'provider', NEW.raw_app_meta_data->>'provider')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at fields
CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_certificates
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to log certificate access
CREATE OR REPLACE FUNCTION public.log_certificate_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last_accessed timestamp
    NEW.last_accessed = NOW();
    
    -- Log the access
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
    VALUES (
        auth.uid(),
        'read',
        'certificate',
        NEW.id,
        jsonb_build_object('certificate_name', NEW.name)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired shares
CREATE OR REPLACE FUNCTION public.cleanup_expired_shares()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.certificate_shares
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate certificate dates
CREATE OR REPLACE FUNCTION public.update_certificate_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-update status based on expiry date
    IF NEW.expiry_date IS NOT NULL THEN
        IF NEW.expiry_date < CURRENT_DATE THEN
            NEW.status = 'expired';
        ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
            NEW.status = 'upcoming';
        ELSE
            NEW.status = 'valid';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic status updates
CREATE TRIGGER update_certificate_status_trigger
    BEFORE INSERT OR UPDATE ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION public.update_certificate_status();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information with encryption support';
COMMENT ON TABLE public.certificates IS 'Certificate storage with client-side encryption and RLS security';
COMMENT ON TABLE public.certificate_shares IS 'Secure certificate sharing with time-limited access';
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for security and compliance';
COMMENT ON TABLE public.user_sessions IS 'Enhanced session management for security monitoring';

COMMENT ON COLUMN public.certificates.encrypted_data IS 'Client-side encrypted sensitive certificate data';
COMMENT ON COLUMN public.user_profiles.encryption_key_salt IS 'Salt for deriving user encryption keys';
COMMENT ON COLUMN public.certificate_shares.access_token IS 'Unique token for secure share access';