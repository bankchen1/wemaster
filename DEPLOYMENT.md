# Wepal Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 16+ and npm
- PostgreSQL 14+
- Redis 7+

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/wepal.git
cd wepal
```

2. Copy and configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Generate JWT secret:
```bash
openssl rand -base64 32
# Add the output to JWT_SECRET in .env
```

## Jitsi Meet Setup

1. Configure DNS:
   - Point your domain (e.g., meet.example.com) to your server
   - Ensure SSL certificates are properly set up

2. Configure Jitsi Meet:
   - Edit docker-compose.yml with your domain
   - Update JITSI_* variables in .env

3. Initialize Jitsi Meet:
```bash
docker-compose up -d jitsi-meet
```

## Matrix Synapse Setup

1. Generate configuration:
```bash
docker-compose run --rm -e SYNAPSE_SERVER_NAME=matrix.example.com \
  -e SYNAPSE_REPORT_STATS=no matrix-synapse generate
```

2. Configure Matrix:
   - Edit homeserver.yaml in matrix_data volume
   - Update MATRIX_* variables in .env

3. Initialize Matrix:
```bash
docker-compose up -d matrix-synapse
```

## Database Setup

1. Initialize PostgreSQL:
```bash
docker-compose up -d postgres
```

2. Run migrations:
```bash
npx prisma migrate deploy
```

## Application Deployment

1. Build applications:
```bash
# Build web app
cd apps/web
npm install
npm run build

# Build API
cd ../api
npm install
npm run build
```

2. Start all services:
```bash
docker-compose up -d
```

## Monitoring Setup

1. Configure Elastic APM:
   - Update ELASTIC_APM_* variables in .env
   - Ensure Elasticsearch has enough memory

2. Access monitoring:
   - Kibana: http://your-server:5601
   - APM: http://your-server:8200

## Security Considerations

1. Firewall Configuration:
   - Allow only necessary ports
   - Use reverse proxy for SSL termination

2. SSL/TLS:
   - Use Let's Encrypt or your SSL provider
   - Configure SSL in nginx/reverse proxy

3. Authentication:
   - Configure JWT secret
   - Set up Matrix user registration policy

## Backup Strategy

1. Database Backup:
```bash
# Automated backup script
docker-compose exec postgres pg_dump -U wepal > backup.sql
```

2. Volume Backup:
```bash
# Backup all docker volumes
docker run --rm -v /var/lib/docker:/var/lib/docker \
  -v /backup:/backup ubuntu tar czf /backup/volumes.tar.gz \
  /var/lib/docker/volumes
```

## Troubleshooting

1. Check logs:
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs api
```

2. Common Issues:
   - Matrix federation issues: Check SRV records
   - Jitsi connection issues: Check WebSocket configuration
   - Database connection: Check DATABASE_URL

## Scaling

1. Horizontal Scaling:
   - Use container orchestration (Kubernetes)
   - Configure load balancer

2. Vertical Scaling:
   - Increase container resources
   - Optimize database queries

## Maintenance

1. Updates:
```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

2. Monitoring:
   - Set up alerts in Kibana
   - Monitor system resources

## Support

For issues and support:
- GitHub Issues: [Repository Issues](https://github.com/your-org/wepal/issues)
- Documentation: [Project Wiki](https://github.com/your-org/wepal/wiki)
