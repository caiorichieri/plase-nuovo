#!/bin/bash
# PLASE App — Setup no VPS
# Executar como root ou com sudo no servidor 81.31.148.166

echo "=== 1. Criar banco PostgreSQL ==="
sudo -u postgres psql << 'SQL'
CREATE USER plase_user WITH PASSWORD 'ESCOLHA_UMA_PASSWORD_FORTE';
CREATE DATABASE plase_db OWNER plase_user;
GRANT ALL PRIVILEGES ON DATABASE plase_db TO plase_user;
SQL

echo "=== 2. Criar schema ==="
sudo -u postgres psql -d plase_db -f /var/www/plase-app/schema.sql

echo "=== 3. Instalar dependências ==="
cd /var/www/plase-app
npm install --production

echo "=== 4. Build Next.js ==="
npm run build

echo "=== 5. Configurar PM2 ==="
pm2 start npm --name "plase-app" -- start
pm2 save
pm2 startup

echo "=== 6. Configurar nginx ==="
# Adicionar ao HestiaCP como novo virtual host para plase.mebici.it
# Ou criar manualmente:
cat << 'NGINX'
server {
    listen 80;
    server_name plase.mebici.it;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

echo "=== Setup completo! ==="
echo "Agora edita /var/www/plase-app/.env com as credenciais reais."
