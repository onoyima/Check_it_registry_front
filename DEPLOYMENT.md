# Deployment Guide - Check It Device Registry

This guide covers deploying the MySQL version of Check It to production.

## Prerequisites

- Ubuntu 20.04+ or CentOS 8+ server
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)
- MySQL 8.0+ installed
- Node.js 16+ installed
- PM2 process manager
- Nginx reverse proxy

## Server Setup

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Setup MySQL Database

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE check_it_registry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'checkit'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON check_it_registry.* TO 'checkit'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u checkit -p check_it_registry < mysql/schema.sql
```

### 3. Deploy Application

```bash
# Clone repository
git clone <your-repo-url> /var/www/check-it
cd /var/www/check-it

# Install dependencies
npm install
npm run server:install

# Build frontend
npm run build

# Setup environment
cp server/.env.example server/.env
nano server/.env
```

### 4. Configure Environment

Edit `server/.env`:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

DB_HOST=localhost
DB_PORT=3306
DB_USER=checkit
DB_PASSWORD=secure_password_here
DB_NAME=check_it_registry

JWT_SECRET=your-super-secure-jwt-secret-256-bits-long
```

### 5. Setup PM2

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'check-it-api',
    script: './server/app.js',
    cwd: '/var/www/check-it',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/check-it-error.log',
    out_file: '/var/log/pm2/check-it-out.log',
    log_file: '/var/log/pm2/check-it.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/check-it
```

Add configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend (React build)
    location / {
        root /var/www/check-it/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
}

# Rate limiting zone
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/check-it /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 8. Firewall Configuration

```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3306 # MySQL (only if remote access needed)
sudo ufw enable
```

### 9. Monitoring Setup

```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-logrotate

# Setup log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

## Maintenance

### Daily Tasks
- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs check-it-api`
- Monitor disk space: `df -h`

### Weekly Tasks
- Update system packages: `sudo apt update && sudo apt upgrade`
- Check SSL certificate: `sudo certbot certificates`
- Review error logs: `sudo tail -f /var/log/nginx/error.log`

### Monthly Tasks
- Database backup: `mysqldump -u checkit -p check_it_registry > backup_$(date +%Y%m%d).sql`
- Security updates
- Performance monitoring review

## Backup Strategy

### Database Backup Script

```bash
#!/bin/bash
# /home/ubuntu/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
DB_NAME="check_it_registry"
DB_USER="checkit"

mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/check-it --exclude=node_modules

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup.sh >> /var/log/backup.log 2>&1
```

## Troubleshooting

### Common Issues

1. **API not responding**
   ```bash
   pm2 restart check-it-api
   pm2 logs check-it-api
   ```

2. **Database connection errors**
   ```bash
   sudo systemctl status mysql
   mysql -u checkit -p -e "SELECT 1"
   ```

3. **High memory usage**
   ```bash
   pm2 monit
   # Consider reducing PM2 instances
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot renew --dry-run
   sudo nginx -t
   ```

### Performance Optimization

1. **Enable MySQL query cache**
2. **Add database indexes for frequent queries**
3. **Configure PM2 cluster mode**
4. **Enable Nginx gzip compression**
5. **Setup Redis for session storage (optional)**

## Security Checklist

- [ ] Change default MySQL root password
- [ ] Create dedicated database user with minimal privileges
- [ ] Use strong JWT secret (256-bit)
- [ ] Enable firewall with minimal open ports
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Implement rate limiting
- [ ] Use HTTPS everywhere
- [ ] Regular security audits

## Scaling Considerations

### Horizontal Scaling
- Load balancer (Nginx/HAProxy)
- Multiple application servers
- Database read replicas
- Redis for session storage

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching layers
- CDN for static assets

---

For support, check the main README.md or create an issue in the repository.