# Proposed Project Structure - Trade Bot Scratch

## 🎯 Mục tiêu cải thiện
- Tăng tính maintainability và scalability
- Chuẩn hóa cấu trúc cho từng service
- Tối ưu hóa cho CI/CD pipeline
- Cải thiện developer experience

## 📁 Cấu trúc thư mục đề xuất

```
trade-bot-scratch/
├── 📁 apps/                          # Applications
│   ├── 📁 frontend/                  # React frontend
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/        # Reusable components
│   │   │   ├── 📁 pages/             # Page components
│   │   │   ├── 📁 hooks/             # Custom React hooks
│   │   │   ├── 📁 services/          # API services
│   │   │   ├── 📁 types/             # TypeScript definitions
│   │   │   ├── 📁 utils/             # Utility functions
│   │   │   └── 📁 assets/            # Static assets
│   │   ├── 📁 public/                # Public assets
│   │   ├── 📁 tests/                 # Frontend tests
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── 📁 api-gateway/               # API Gateway service
│   │   ├── 📁 src/
│   │   │   ├── 📁 controllers/       # Route handlers
│   │   │   ├── 📁 middleware/        # Custom middleware
│   │   │   ├── 📁 services/          # Business logic
│   │   │   ├── 📁 types/             # TypeScript types
│   │   │   └── 📁 utils/             # Utility functions
│   │   ├── 📁 tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── 📁 market-service/            # Market data service
│   │   ├── 📁 src/
│   │   │   ├── 📁 controllers/
│   │   │   ├── 📁 services/
│   │   │   ├── 📁 models/
│   │   │   └── 📁 utils/
│   │   ├── 📁 tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── 📁 trading-engine/            # Python trading engine
│       ├── 📁 src/
│       │   ├── 📁 exchange/          # Exchange adapters
│       │   ├── 📁 strategies/        # Trading strategies
│       │   ├── 📁 ai/                # AI/ML modules
│       │   ├── 📁 models/            # Data models
│       │   └── 📁 utils/             # Utility functions
│       ├── 📁 tests/
│       ├── Dockerfile
│       └── requirements.txt
│
├── 📁 infrastructure/                # Infrastructure as Code
│   ├── 📁 terraform/                 # Terraform configurations
│   │   ├── 📁 environments/
│   │   │   ├── 📁 dev/
│   │   │   ├── 📁 staging/
│   │   │   └── 📁 prod/
│   │   ├── 📁 modules/
│   │   └── 📁 scripts/
│   ├── 📁 kubernetes/                # K8s manifests
│   │   ├── 📁 base/
│   │   ├── 📁 overlays/
│   │   └── 📁 helm-charts/
│   └── 📁 ansible/                   # Ansible playbooks
│
├── 📁 ci-cd/                         # CI/CD configurations
│   ├── 📁 github-actions/
│   │   ├── 📁 workflows/
│   │   ├── 📁 scripts/
│   │   └── 📁 templates/
│   ├── 📁 jenkins/
│   └── 📁 gitlab-ci/
│
├── 📁 monitoring/                    # Monitoring & Observability
│   ├── 📁 prometheus/
│   ├── 📁 grafana/
│   ├── 📁 alertmanager/
│   └── 📁 jaeger/                    # Distributed tracing
│
├── 📁 security/                      # Security configurations
│   ├── 📁 policies/                  # Security policies
│   ├── 📁 scanning/                  # Vulnerability scanning
│   └── 📁 secrets/                   # Secret management
│
├── 📁 shared/                        # Shared resources
│   ├── 📁 types/                     # Shared TypeScript types
│   ├── 📁 schemas/                   # API schemas
│   ├── 📁 constants/                 # Shared constants
│   └── 📁 utils/                     # Shared utilities
│
├── 📁 docs/                          # Documentation
│   ├── 📁 api/                       # API documentation
│   ├── 📁 deployment/                # Deployment guides
│   ├── 📁 development/               # Development guides
│   └── 📁 architecture/              # Architecture docs
│
├── 📁 scripts/                       # Utility scripts
│   ├── 📁 deployment/
│   ├── 📁 database/
│   ├── 📁 backup/
│   └── 📁 maintenance/
│
├── 📁 docker/                        # Docker configurations
│   ├── 📁 development/
│   ├── 📁 staging/
│   └── 📁 production/
│
├── 📁 memory-bank/                   # Project knowledge base
│   ├── 📁 architecture/
│   ├── 📁 development/
│   ├── 📁 operations/
│   └── 📁 templates/
│
├── 📁 tests/                         # Integration tests
│   ├── 📁 e2e/
│   ├── 📁 performance/
│   └── 📁 security/
│
├── 📁 .github/                       # GitHub configurations
├── 📁 .vscode/                       # VS Code settings
├── 📁 .husky/                        # Git hooks
├── 📁 .config/                       # Tool configurations
├── docker-compose.yml                # Development environment
├── docker-compose.prod.yml           # Production environment
├── Makefile                          # Development commands
├── package.json                      # Root package.json
└── README.md
```

## 🔧 **2. Cải thiện DevOps & CI/CD**

### Docker Compose cải thiện:
```yaml
# docker-compose.dev.yml
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
```

## 🚀 **3. GitHub Actions Workflow**

```yaml
# .github/workflows/ci-cd.yml
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
        service: [frontend, api-gateway, market-service, trading-engine]
    
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
    needs: [test, security-scan]
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
        docker buildx build \
          --platform linux/amd64,linux/arm64 \
          --tag ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }} \
          --file apps/frontend/Dockerfile \
          --push \
          apps/frontend

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment"
        # Add deployment logic here

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      run: |
        echo "Deploying to production environment"
        # Add deployment logic here
```

## 📋 **4. Makefile cho Development**

```makefile
# Makefile
.PHONY: help install test build deploy clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing dependencies..."
	cd apps/frontend && npm install
	cd apps/api-gateway && npm install
	cd apps/market-service && npm install
	cd apps/trading-engine && pip install -r requirements.txt

dev: ## Start development environment
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Stop development environment
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

test: ## Run all tests
	@echo "Running tests..."
	cd apps/frontend && npm test
	cd apps/api-gateway && npm test
	cd apps/market-service && npm test
	cd apps/trading-engine && python -m pytest

lint: ## Run linting
	@echo "Running linting..."
	cd apps/frontend && npm run lint
	cd apps/api-gateway && npm run lint
	cd apps/market-service && npm run lint

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
```

## 🔒 **5. Security Improvements**

### Security scanning configuration:
```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  push:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Snyk to check for vulnerabilities
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high
    
    - name: Run OWASP ZAP scan
      uses: zaproxy/action-full-scan@v0.8.0
      with:
        target: 'http://localhost:3000'
```

## 📊 **6. Monitoring & Observability**

### Prometheus configuration:
```yaml
# monitoring/prometheus/prometheus.yml
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
```

## 🎯 **Kết luận và Next Steps**

### Ưu tiên thực hiện:
1. **Tái cấu trúc thư mục** theo đề xuất
2. **Setup CI/CD pipeline** với GitHub Actions
3. **Implement security scanning**
4. **Cải thiện monitoring**
5. **Tạo development tools** (Makefile, scripts)

### Lợi ích đạt được:
- ✅ **Scalability**: Dễ dàng thêm services mới
- ✅ **Maintainability**: Code organization rõ ràng
- ✅ **Security**: Automated security scanning
- ✅ **DevOps**: Streamlined development workflow
- ✅ **Monitoring**: Comprehensive observability
- ✅ **Documentation**: Centralized knowledge base

---
*Last updated: 10/08/2025*
