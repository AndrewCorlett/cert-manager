'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { useCertStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';
import { Sun, Moon } from 'lucide-react';

interface SettingsPanelProps {
  mode: 'home' | 'doc';
}

export default function SettingsPanel({ mode }: SettingsPanelProps) {
  const [email, setEmail] = useState('user@example.com');
  const [notificationDays, setNotificationDays] = useState(30);
  const [emailTemplate, setEmailTemplate] = useState(
    'Please find attached my professional certificates.\n\nBest regards,\n[Your Name]'
  );
  
  const currentViewingCert = useCertStore((state) => state.currentViewingCert);
  const updateCertificate = useCertStore((state) => state.updateCertificate);
  const deleteCertificate = useCertStore((state) => state.deleteCertificate);
  
  // Theme store
  const { theme, toggleTheme } = useThemeStore();

  if (mode === 'home') {
    return (
      <div className="space-y-6">
        <h3 
          className="text-lg font-semibold border-b pb-2"
          style={{ 
            color: 'var(--white-pure)', // Explicit white for consistency
            borderColor: 'var(--grey-500)'
          }}
        >
          My Account
        </h3>
        
        <div className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--white-pure)' }}
            >
              Google Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded"
              style={{ 
                backgroundColor: '#E5E7EB', // Light grey in both modes
                color: '#1F2937', // Dark text for readability
                border: '1px solid #9CA3AF'
              }}
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--white-pure)' }}
            >
              Notification Days
            </label>
            <input
              type="number"
              value={notificationDays}
              onChange={(e) => setNotificationDays(parseInt(e.target.value))}
              className="w-full p-3 rounded"
              style={{ 
                backgroundColor: '#E5E7EB', // Light grey in both modes
                color: '#1F2937', // Dark text for readability
                border: '1px solid #9CA3AF'
              }}
              placeholder="Days before expiry"
            />
            <p className="text-sm mt-1" style={{ color: 'var(--grey-500)' }}>
              Get notified this many days before certificates expire
            </p>
          </div>
        </div>

        <h4 
          className="text-md font-semibold border-b pb-2 mt-6"
          style={{ 
            color: 'var(--white-pure)',
            borderColor: 'var(--grey-500)'
          }}
        >
          Notifications
        </h4>
        
        <div className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--white-pure)' }}
            >
              Email Template
            </label>
            <textarea
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              rows={6}
              className="w-full p-3 rounded resize-none"
              style={{ 
                backgroundColor: '#E5E7EB', // Light grey in both modes
                color: '#1F2937', // Dark text for readability
                border: '1px solid #9CA3AF'
              }}
              placeholder="Enter your default email template"
            />
            <p className="text-sm mt-1" style={{ color: 'var(--grey-500)' }}>
              This template will be used when sending certificates via email
            </p>
          </div>
        </div>

        <h4 
          className="text-md font-semibold border-b pb-2 mt-6"
          style={{ 
            color: 'var(--white-pure)',
            borderColor: 'var(--grey-500)'
          }}
        >
          Appearance
        </h4>
        
        <div className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--white-pure)' }}
            >
              Theme
            </label>
            <div 
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--grey-700)',
                border: `1px solid var(--grey-500)`
              }}
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon size={20} color="var(--gold-accent)" />
                ) : (
                  <Sun size={20} color="var(--gold-accent)" />
                )}
                <div>
                  <div 
                    className="font-medium"
                    style={{ color: 'var(--white-pure)' }}
                  >
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </div>
                  <div 
                    className="text-sm opacity-75"
                    style={{ color: 'var(--white-pure)' }}
                  >
                    Switch between themes
                  </div>
                </div>
              </div>
              <ToggleSwitch
                checked={theme === 'dark'}
                onChange={(checked) => {
                  if (checked && theme === 'light') {
                    toggleTheme();
                  } else if (!checked && theme === 'dark') {
                    toggleTheme();
                  }
                }}
                size="md"
              />
            </div>
          </div>
          
          <Button
            onClick={() => {
              // TODO BACKEND:SAVE_SETTINGS
              console.log('Saving settings:', { email, notificationDays, emailTemplate, theme });
              alert('Settings saved!');
            }}
            className="w-full py-3"
            style={{
              backgroundColor: 'var(--gold-accent)',
              color: 'var(--white-pure)'
            }}
          >
            Save Settings
          </Button>
        </div>
      </div>
    );
  }

  // Document settings mode
  if (!currentViewingCert) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--grey-500)' }}>
          No certificate selected
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 
        className="text-lg font-semibold border-b pb-2"
        style={{ 
          color: '#FFFFFF',
          borderColor: 'var(--grey-500)'
        }}
      >
        {currentViewingCert.name}
      </h3>
      
      <div className="space-y-3">
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--white-pure)' }}
          >
            File Location
          </label>
          <select 
            className="w-full p-2 rounded"
            style={{ 
              backgroundColor: 'var(--grey-500)',
              color: 'var(--white-pure)',
              border: 'none'
            }}
            defaultValue={currentViewingCert.filePath}
            onChange={(e) => updateCertificate(currentViewingCert.id, { filePath: e.target.value })}
          >
            <option value="/certificates/default">Default Location</option>
            <option value="/certificates/stcw">STCW Folder</option>
            <option value="/certificates/gwo">GWO Folder</option>
            <option value="/certificates/opito">OPITO Folder</option>
            <option value="/certificates/contracts">Contracts Folder</option>
          </select>
        </div>
        
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--white-pure)' }}
          >
            Issue Date
          </label>
          <input
            type="date"
            className="w-full p-2 rounded"
            style={{ 
              backgroundColor: 'var(--grey-500)',
              color: 'var(--white-pure)',
              border: 'none'
            }}
            defaultValue={currentViewingCert.issueDate}
            onChange={(e) => updateCertificate(currentViewingCert.id, { issueDate: e.target.value })}
          />
        </div>
        
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--white-pure)' }}
          >
            Expiry Date
          </label>
          <input
            type="date"
            className="w-full p-2 rounded"
            style={{ 
              backgroundColor: 'var(--grey-500)',
              color: 'var(--white-pure)',
              border: 'none'
            }}
            defaultValue={currentViewingCert.expiryDate}
            onChange={(e) => updateCertificate(currentViewingCert.id, { expiryDate: e.target.value })}
          />
        </div>
        
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--white-pure)' }}
          >
            Cert no.
          </label>
          <input
            type="text"
            className="w-full p-2 rounded"
            style={{ 
              backgroundColor: 'var(--grey-500)',
              color: 'var(--white-pure)',
              border: 'none'
            }}
            defaultValue={currentViewingCert.serialNumber}
            onChange={(e) => updateCertificate(currentViewingCert.id, { serialNumber: e.target.value })}
            placeholder="Enter certificate number"
          />
        </div>
        
        <Button
          onClick={() => {
            // TODO BACKEND:DELETE_CERT
            if (confirm('Are you sure you want to delete this certificate?')) {
              deleteCertificate(currentViewingCert.id);
              window.location.href = '/';
            }
          }}
          className="w-full p-3 rounded mt-6 font-medium"
          style={{ 
            backgroundColor: 'var(--error-red)',
            color: 'var(--white-pure)'
          }}
        >
          Delete Certificate
        </Button>
      </div>
    </div>
  );
}