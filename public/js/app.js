const API_URL = '/api/certificates';
let currentFilter = 'all';
let certificates = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCertificates();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('addCertBtn').addEventListener('click', () => openModal());
    document.querySelector('.close').addEventListener('click', () => closeModal());
    document.getElementById('cancelBtn').addEventListener('click', () => closeModal());
    document.getElementById('certificateForm').addEventListener('submit', handleFormSubmit);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            displayCertificates();
        });
    });
    
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('certificateModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

async function loadCertificates() {
    try {
        const response = await fetch(API_URL);
        certificates = await response.json();
        displayCertificates();
    } catch (error) {
        console.error('Error loading certificates:', error);
    }
}

function displayCertificates() {
    const container = document.getElementById('certificatesList');
    container.innerHTML = '';
    
    const filteredCerts = filterCertificates(certificates);
    
    if (filteredCerts.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">No certificates found.</p>';
        return;
    }
    
    filteredCerts.forEach(cert => {
        container.appendChild(createCertificateCard(cert));
    });
}

function filterCertificates(certs) {
    switch (currentFilter) {
        case 'expiring':
            return certs.filter(cert => cert.days_remaining > 0 && cert.days_remaining <= 30);
        case 'expired':
            return certs.filter(cert => cert.is_expired);
        default:
            return certs;
    }
}

function createCertificateCard(cert) {
    const card = document.createElement('div');
    card.className = 'certificate-card';
    
    const statusClass = cert.is_expired ? 'status-expired' : 
                       cert.days_remaining <= 30 ? 'status-warning' : 'status-valid';
    const statusText = cert.is_expired ? 'Expired' : 
                      cert.days_remaining <= 30 ? `Expires in ${cert.days_remaining} days` : 
                      `Valid for ${cert.days_remaining} days`;
    
    card.innerHTML = `
        <div class="certificate-header">
            <h3 class="certificate-title">${cert.name}</h3>
            <span class="certificate-type">${cert.type}</span>
        </div>
        <div class="certificate-details">
            <div class="detail-row">
                <span class="detail-label">Domain:</span>
                <span class="detail-value">${cert.domain}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Issuer:</span>
                <span class="detail-value">${cert.issuer || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Expires:</span>
                <span class="detail-value">${formatDate(cert.expiry_date)}</span>
            </div>
        </div>
        <div class="certificate-status">
            <span class="status-badge ${statusClass}">${statusText}</span>
            <div class="certificate-actions">
                <button class="btn btn-primary btn-small" onclick="editCertificate(${cert.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteCertificate(${cert.id})">Delete</button>
            </div>
        </div>
    `;
    
    return card;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function openModal(cert = null) {
    const modal = document.getElementById('certificateModal');
    const form = document.getElementById('certificateForm');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    
    if (cert) {
        title.textContent = 'Edit Certificate';
        document.getElementById('certId').value = cert.id;
        document.getElementById('name').value = cert.name;
        document.getElementById('domain').value = cert.domain;
        document.getElementById('issuer').value = cert.issuer || '';
        document.getElementById('type').value = cert.type;
        document.getElementById('issue_date').value = cert.issue_date;
        document.getElementById('expiry_date').value = cert.expiry_date;
        document.getElementById('notes').value = cert.notes || '';
    } else {
        title.textContent = 'Add Certificate';
        document.getElementById('certId').value = '';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('certificateModal').style.display = 'none';
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const certId = document.getElementById('certId').value;
    const formData = {
        name: document.getElementById('name').value,
        domain: document.getElementById('domain').value,
        issuer: document.getElementById('issuer').value,
        type: document.getElementById('type').value,
        issue_date: document.getElementById('issue_date').value,
        expiry_date: document.getElementById('expiry_date').value,
        notes: document.getElementById('notes').value
    };
    
    try {
        const url = certId ? `${API_URL}/${certId}` : API_URL;
        const method = certId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            closeModal();
            loadCertificates();
        } else {
            alert('Error saving certificate');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving certificate');
    }
}

async function editCertificate(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const cert = await response.json();
        openModal(cert);
    } catch (error) {
        console.error('Error loading certificate:', error);
    }
}

async function deleteCertificate(id) {
    if (!confirm('Are you sure you want to delete this certificate?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadCertificates();
        } else {
            alert('Error deleting certificate');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting certificate');
    }
}