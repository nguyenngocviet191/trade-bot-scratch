#!/bin/bash

# Trade Bot Scratch - Project Restructure Script
# This script helps migrate from current structure to the proposed structure

set -e

echo "🚀 Starting project restructure..."

# Create new directory structure
echo "📁 Creating new directory structure..."

# Apps directory
mkdir -p apps/frontend/src/{components,pages,hooks,services,types,utils,assets}
mkdir -p apps/frontend/{public,tests}
mkdir -p apps/api-gateway/src/{controllers,middleware,services,types,utils}
mkdir -p apps/api-gateway/tests
mkdir -p apps/market-service/src/{controllers,services,models,utils}
mkdir -p apps/market-service/tests
mkdir -p apps/trading-engine/src/{exchange,strategies,ai,models,utils}
mkdir -p apps/trading-engine/tests

# Infrastructure directory
mkdir -p infrastructure/{terraform/{environments/{dev,staging,prod},modules,scripts},kubernetes/{base,overlays,helm-charts},ansible}

# CI/CD directory
mkdir -p ci-cd/{github-actions/{workflows,scripts,templates},jenkins,gitlab-ci}

# Monitoring directory
mkdir -p monitoring/{prometheus,grafana/{dashboards,datasources},alertmanager,jaeger}

# Security directory
mkdir -p security/{policies,scanning,secrets}

# Shared directory
mkdir -p shared/{types,schemas,constants,utils}

# Documentation directory
mkdir -p docs/{api,deployment,development,architecture}

# Scripts directory
mkdir -p scripts/{deployment,database,backup,maintenance}

# Docker directory
mkdir -p docker/{development,staging,production}

# Tests directory
mkdir -p tests/{e2e,performance,security}

# Config directory
mkdir -p .config

echo "✅ Directory structure created"

# Move existing files
echo "📦 Moving existing files..."

# Move frontend files
if [ -d "client" ]; then
    echo "Moving client to apps/frontend..."
    cp -r client/* apps/frontend/
    cp client/package.json apps/frontend/ 2>/dev/null || true
    cp client/vite.config.ts apps/frontend/ 2>/dev/null || true
    cp client/tailwind.config.js apps/frontend/ 2>/dev/null || true
    cp client/postcss.config.js apps/frontend/ 2>/dev/null || true
    cp client/nginx.conf apps/frontend/ 2>/dev/null || true
fi

# Move server files
if [ -d "server" ]; then
    echo "Moving server files..."
    # API Gateway
    if [ -f "server/api_gateway.ts" ]; then
        cp server/api_gateway.ts apps/api-gateway/src/
    fi
    
    # Market Service
    if [ -f "server/server_market.ts" ]; then
        cp server/server_market.ts apps/market-service/src/
    fi
    
    # Trading Service
    if [ -f "server/sv_trading.py" ]; then
        cp server/sv_trading.py apps/trading-engine/src/
    fi
    
    # Market Service Python
    if [ -f "server/sv_maket.py" ]; then
        cp server/sv_maket.py apps/market-service/src/
    fi
fi

# Move core files
if [ -d "core" ]; then
    echo "Moving core files..."
    cp -r core/* apps/trading-engine/src/
    cp core/requirements.txt apps/trading-engine/ 2>/dev/null || true
fi

# Move shared files
if [ -d "shared" ]; then
    echo "Moving shared files..."
    cp -r shared/* shared/
fi

# Move config files
if [ -d "config" ]; then
    echo "Moving config files..."
    cp -r config/* .config/
fi

# Move scripts
if [ -d "scripts" ]; then
    echo "Moving scripts..."
    cp scripts/handle_ccxt.py scripts/deployment/ 2>/dev/null || true
    cp scripts/handle_redis.py scripts/deployment/ 2>/dev/null || true
fi

echo "✅ Files moved successfully"

# Create new configuration files
echo "⚙️ Creating new configuration files..."

# Create root package.json
cat > package.json << 'EOF'
{
  "name": "trade-bot-scratch",
  "version": "1.0.0",
  "description": "Trading Bot Microservice System",
  "scripts": {
    "install:all": "npm run install:frontend && npm run install:api-gateway && npm run install:market-service && npm run install:trading-engine",
    "install:frontend": "cd apps/frontend && npm install",
    "install:api-gateway": "cd apps/api-gateway && npm install",
    "install:market-service": "cd apps/market-service && npm install",
    "install:trading-engine": "cd apps/trading-engine && pip install -r requirements.txt",
    "dev": "docker-compose -f docker-compose.dev.yml up -d",
    "dev:down": "docker-compose -f docker-compose.dev.yml down",
    "test": "npm run test:frontend && npm run test:api-gateway && npm run test:market-service && npm run test:trading-engine",
    "test:frontend": "cd apps/frontend && npm test",
    "test:api-gateway": "cd apps/api-gateway && npm test",
    "test:market-service": "cd apps/market-service && npm test",
    "test:trading-engine": "cd apps/trading-engine && python -m pytest",
    "lint": "npm run lint:frontend && npm run lint:api-gateway && npm run lint:market-service",
    "lint:frontend": "cd apps/frontend && npm run lint",
    "lint:api-gateway": "cd apps/api-gateway && npm run lint",
    "lint:market-service": "cd apps/market-service && npm run lint",
    "build": "docker-compose -f docker-compose.prod.yml build",
    "deploy": "docker-compose -f docker-compose.prod.yml up -d",
    "clean": "docker-compose down -v && docker system prune -f"
  },
  "workspaces": [
    "apps/*"
  ],
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
EOF

# Create Makefile
cat > Makefile << 'EOF'
.PHONY: help install test build deploy clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing dependencies..."
	npm run install:all

dev: ## Start development environment
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Stop development environment
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

test: ## Run all tests
	@echo "Running tests..."
	npm test

lint: ## Run linting
	@echo "Running linting..."
	npm run lint

build: ## Build all services
	@echo "Building services..."
	docker-compose -f docker-compose.prod.yml build

deploy: ## Deploy to production
	@echo "Deploying to production..."
	docker-compose -f docker-compose.prod.yml up -d

clean: ## Clean up containers and volumes
	@echo "Cleaning up..."
	docker-compose down -v
	docker system prune -f

logs: ## Show logs
	docker-compose -f docker-compose.dev.yml logs -f

db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	cd apps/api-gateway && npm run migrate

db-seed: ## Seed database with test data
	@echo "Seeding database..."
	cd apps/api-gateway && npm run seed

security-scan: ## Run security scans
	@echo "Running security scans..."
	docker run --rm -v $(PWD):/app aquasec/trivy fs /app

monitoring: ## Start monitoring stack
	@echo "Starting monitoring..."
	docker-compose -f docker-compose.monitoring.yml up -d
EOF

# Create improved docker-compose.dev.yml
cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  # Development tools
  dev-tools:
    image: node:18-alpine
    volumes:
      - .:/workspace
    working_dir: /workspace
    command: tail -f /dev/null

  # Frontend with hot reload
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - api-gateway

  # API Gateway with auto-reload
  api-gateway:
    build:
      context: ./apps/api-gateway
      dockerfile: Dockerfile.dev
    ports:
      - "5000:5000"
    volumes:
      - ./apps/api-gateway:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/tradebot_dev
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret-key
    depends_on:
      - postgres
      - redis

  # Market Service
  market-service:
    build:
      context: ./apps/market-service
      dockerfile: Dockerfile.dev
    ports:
      - "5001:5001"
    volumes:
      - ./apps/market-service:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  # Trading Engine
  trading-engine:
    build:
      context: ./apps/trading-engine
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./apps/trading-engine:/app
    environment:
      - ENVIRONMENT=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/tradebot_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Database with migrations
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=tradebot_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/database/init.sql:/docker-entrypoint-initdb.d/init.sql

  # Redis with persistence
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # Monitoring stack
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards

  # Development tools
  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
EOF

# Create production docker-compose
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  # Frontend
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  # API Gateway
  api-gateway:
    build:
      context: ./apps/api-gateway
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    depends_on:
      - postgres
      - redis

  # Market Service
  market-service:
    build:
      context: ./apps/market-service
      dockerfile: Dockerfile
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - REDIS_URL=${REDIS_URL}
    restart: unless-stopped
    depends_on:
      - redis

  # Trading Engine
  trading-engine:
    build:
      context: ./apps/trading-engine
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: unless-stopped
    depends_on:
      - postgres
      - redis

  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  # Redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF

# Create GitHub Actions workflow
mkdir -p .github/workflows
cat > .github/workflows/ci-cd.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [frontend, api-gateway, market-service]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: apps/${{ matrix.service }}/package-lock.json
    
    - name: Install dependencies
      run: |
        cd apps/${{ matrix.service }}
        npm ci
    
    - name: Run tests
      run: |
        cd apps/${{ matrix.service }}
        npm test
    
    - name: Run linting
      run: |
        cd apps/${{ matrix.service }}
        npm run lint

  test-trading-engine:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd apps/trading-engine
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd apps/trading-engine
        python -m pytest

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v3
      with:
        sarif_file: 'trivy-results.sarif'

  build:
    needs: [test, test-trading-engine, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push Docker images
      run: |
        for service in frontend api-gateway market-service trading-engine; do
          docker buildx build \
            --platform linux/amd64,linux/arm64 \
            --tag ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/$service:${{ github.sha }} \
            --file apps/$service/Dockerfile \
            --push \
            apps/$service
        done
EOF

# Create monitoring configuration
mkdir -p monitoring/prometheus
cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:5000']
    metrics_path: '/metrics'

  - job_name: 'trading-engine'
    static_configs:
      - targets: ['trading-engine:8000']
    metrics_path: '/metrics'

  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/metrics'
EOF

# Create database initialization script
mkdir -p scripts/database
cat > scripts/database/init.sql << 'EOF'
-- Initialize database for Trade Bot Scratch
CREATE DATABASE IF NOT EXISTS tradebot_dev;
CREATE DATABASE IF NOT EXISTS tradebot_test;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bots table
CREATE TABLE IF NOT EXISTS bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    strategy_type VARCHAR(100) NOT NULL,
    exchange VARCHAR(100) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id),
    exchange_trade_id VARCHAR(255),
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
    amount DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    total DECIMAL(20,8) NOT NULL,
    fee DECIMAL(20,8),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bots_user_id ON bots(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_bot_id ON trades(bot_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);
EOF

echo "✅ Configuration files created"

# Create .env.example
cat > .env.example << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/tradebot_dev
POSTGRES_DB=tradebot_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# API Configuration
API_PORT=5000
FRONTEND_URL=http://localhost:3000

# Trading Engine Configuration
TRADING_ENGINE_PORT=8000
ENVIRONMENT=development

# Monitoring Configuration
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
EOF

# Create .gitignore improvements
cat >> .gitignore << 'EOF'

# Environment files
.env
.env.local
.env.production

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Docker
.dockerignore

# Terraform
*.tfstate
*.tfstate.*
.terraform/
.terraform.lock.hcl

# Kubernetes
*.kubeconfig

# Monitoring
prometheus_data/
grafana_data/
EOF

echo "✅ Additional configuration files created"

# Create README for the new structure
cat > README.md << 'EOF'
# Trade Bot Scratch

A microservice-based trading bot system with React frontend, Node.js backend, and Python trading engine.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trade-bot-scratch
   ```

2. **Install dependencies**
   ```bash
   make install
   # or
   npm run install:all
   ```

3. **Start development environment**
   ```bash
   make dev
   # or
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Access applications**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:5000
   - Market Service: http://localhost:5001
   - Trading Engine: http://localhost:8000
   - Grafana: http://localhost:3001 (admin/admin)

## 📁 Project Structure

```
trade-bot-scratch/
├── apps/                    # Applications
│   ├── frontend/           # React frontend
│   ├── api-gateway/        # API Gateway service
│   ├── market-service/     # Market data service
│   └── trading-engine/     # Python trading engine
├── infrastructure/         # Infrastructure as Code
├── ci-cd/                 # CI/CD configurations
├── monitoring/            # Monitoring & Observability
├── security/              # Security configurations
├── shared/                # Shared resources
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── memory-bank/           # Project knowledge base
```

## 🛠️ Available Commands

```bash
# Development
make dev              # Start development environment
make dev-down         # Stop development environment
make logs             # Show logs

# Testing
make test             # Run all tests
make lint             # Run linting

# Database
make db-migrate       # Run database migrations
make db-seed          # Seed database

# Deployment
make build            # Build all services
make deploy           # Deploy to production
make clean            # Clean up containers

# Security
make security-scan    # Run security scans

# Monitoring
make monitoring       # Start monitoring stack
```

## 🔧 Configuration

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **Update environment variables**
   ```bash
   # Edit .env file with your configuration
   nano .env
   ```

## 📊 Monitoring

The project includes comprehensive monitoring:

- **Prometheus**: Metrics collection
- **Grafana**: Visualization and dashboards
- **Alerting**: Automated alerts for critical issues

Access monitoring at:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

## 🔒 Security

- Automated vulnerability scanning with Trivy
- Security policies and best practices
- Secret management integration
- OWASP compliance

## 🚀 Deployment

### Development
```bash
make dev
```

### Production
```bash
make build
make deploy
```

## 📚 Documentation

- [Architecture Overview](memory-bank/architecture/)
- [Development Guide](docs/development/)
- [API Documentation](docs/api/)
- [Deployment Guide](docs/deployment/)

## 🤝 Contributing

1. Follow the coding standards in `memory-bank/development/coding-standards/`
2. Create feature branches: `feature/feature-name`
3. Write tests for new features
4. Update documentation
5. Submit pull requests

## 📄 License

This project is licensed under the MIT License.

---

For more information, see the [Memory Bank](memory-bank/README.md).
EOF

echo "✅ README updated"

echo ""
echo "🎉 Project restructure completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review the new structure in memory-bank/architecture/proposed-structure.md"
echo "2. Update your IDE settings for the new structure"
echo "3. Test the new setup with: make dev"
echo "4. Update team documentation"
echo "5. Commit the changes to version control"
echo ""
echo "🔧 Available commands:"
echo "  make help          # Show all available commands"
echo "  make install       # Install all dependencies"
echo "  make dev           # Start development environment"
echo "  make test          # Run all tests"
echo ""
echo "📚 Documentation:"
echo "  - Architecture: memory-bank/architecture/proposed-structure.md"
echo "  - Development: docs/development/"
echo "  - API: docs/api/"
