# Deployment Guide - Certificate Manager

## Current Server Status

### Development Servers Running
- **Network Access Server**: http://localhost:3002 and http://[your-ip]:3002
- **Local Only Server**: http://localhost:3001 (running on separate terminal)

### Quick Start Commands
```bash
# Navigate to project directory
cd "/home/andrew/projects/active/Cert-manager/New folder"

# Start network-accessible server
npm run dev -- -p 3002

# Start localhost-only server
npm run dev:local
```

## Server Configuration

### Network Access Server
- **Port**: 3002
- **Host**: 0.0.0.0 (all interfaces)
- **Access**: 
  - Local: http://localhost:3002
  - Network: http://[your-ip]:3002
- **Use Case**: Testing on mobile devices, sharing with team

### Local Only Server  
- **Port**: 3001
- **Host**: 127.0.0.1 (localhost only)
- **Access**: http://localhost:3001
- **Use Case**: Private development, faster performance

## Finding Your Network IP

### Windows (WSL/Command Prompt)
```bash
# In WSL
ip addr show | grep inet
# Or
hostname -I

# In Windows Command Prompt
ipconfig
```

### macOS/Linux
```bash
ifconfig | grep inet
# Or
ip addr show
```

## Deployment Options

### 1. Development Deployment (Current)
```bash
# Start development server with network access
npm run dev -- -p 3002

# Access URLs:
# - Local: http://localhost:3002
# - Network: http://[your-ip]:3002
```

### 2. Production Build & Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start -- -p 3002 -H 0.0.0.0

# Access URLs:
# - Local: http://localhost:3002
# - Network: http://[your-ip]:3002
```

### 3. Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
# Build Docker image
docker build -t cert-manager .

# Run container with network access
docker run -p 3000:3000 cert-manager
```

### 4. Cloud Platform Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy to Railway
railway login
railway init
railway up
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Run command: `npm start`
3. Deploy

## Environment Variables

### Required for Production
Create `.env.production`:
```env
# OpenAI API Key for certificate processing
NEXT_PUBLIC_OPENAI_API_KEY=your_production_api_key_here

# Production environment
NODE_ENV=production

# Optional: Custom port
PORT=3000
```

### Development Environment
Create `.env.local`:
```env
# OpenAI API Key for certificate processing
NEXT_PUBLIC_OPENAI_API_KEY=your_development_api_key_here

# Development environment
NODE_ENV=development
```

## Security Considerations

### Development Server
- Network access enabled for testing
- Use firewall rules to restrict access if needed
- Consider VPN for secure team access

### Production Server
- Use HTTPS in production
- Implement proper authentication
- Set up monitoring and logging
- Regular security updates

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Optimize images
# (Already configured in next.config.js)
```

### Server Optimization
```bash
# Use PM2 for production process management
npm install -g pm2

# Create ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cert-manager',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}

# Start with PM2
pm2 start ecosystem.config.js
```

## Monitoring & Maintenance

### Health Checks
```bash
# Check server status
curl http://localhost:3002/api/health

# Monitor logs
npm run dev -- -p 3002 | tee server.log
```

### Updates
```bash
# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

## Troubleshooting

### Common Issues
1. **Port in use**: Use different port with `-p` flag
2. **Network access blocked**: Check firewall settings
3. **Build failures**: Clear `.next` folder and reinstall

### Debug Commands
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for conflicting processes
ps aux | grep next
kill -9 [process_id]
```

## Access Information

### Current Running Servers
- **Development (Network)**: http://localhost:3002, http://[your-ip]:3002
- **Development (Local)**: http://localhost:3001

### Next Steps
1. Test on mobile devices using network IP
2. Set up production environment variables
3. Choose deployment platform (Vercel recommended)
4. Configure domain and SSL certificates
5. Set up monitoring and analytics