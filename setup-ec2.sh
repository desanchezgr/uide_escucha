#!/bin/bash
set -e

echo "=== UIDE Escucha - Setup EC2 ==="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker..."
    sudo apt install -y docker.io docker-compose-plugin
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
fi

# Navigate to project directory
cd /home/ubuntu/Uide_Escucha

# Stop any existing containers
sudo docker compose down 2>/dev/null || true

# Build and start nginx
echo "=== Construyendo y iniciando nginx ==="
sudo docker compose up -d web

# Wait for nginx to be ready
echo "Esperando a que nginx esté listo..."
sleep 10

# Verify HTTP is working
echo "=== Verificando HTTP ==="
curl -s http://localhost | head -5

# Get SSL certificate using certbot (standalone mode)
echo "=== Obteniendo certificado SSL ==="
sudo docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    -d hubi.click \
    -d www.hubi.click \
    --email admin@hubi.click \
    --agree-tos \
    --non-interactive

# Restart all services
echo "=== Reiniciando con HTTPS ==="
sudo docker compose down
sudo docker compose up -d

echo "=== Setup completado ==="
echo "Verifica: https://hubi.click"
