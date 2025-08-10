# Developer Onboarding Guide - Trade Bot Scratch

## 🎯 Welcome to the Team!
Chào mừng bạn đến với dự án Trade Bot Scratch! Hướng dẫn này sẽ giúp bạn nhanh chóng làm quen với dự án và bắt đầu đóng góp.

## 📋 Prerequisites
Trước khi bắt đầu, hãy đảm bảo bạn có:
- [ ] Node.js (v18+) và npm
- [ ] Python (v3.8+)
- [ ] Git
- [ ] VS Code hoặc IDE tương tự
- [ ] Docker (optional)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/nguyenngocviet191/trade-bot-scratch.git
cd trade-bot-scratch
```

### 2. Setup Development Environment
```bash
# Install root dependencies
npm install

# Setup frontend
cd client
npm install
npm run dev

# Setup backend (in new terminal)
cd server
npm install
npm run dev

# Setup Python environment
cd core
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Configuration
Tạo file `.env` trong thư mục gốc:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/tradebot
REDIS_URL=redis://localhost:6379

# API Keys (for development)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# JWT Secret
JWT_SECRET=your_jwt_secret
```

## 📚 Project Structure Overview

### Frontend (React + TypeScript)
```
client/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services
│   └── types/         # TypeScript definitions
```

### Backend (Node.js + TypeScript)
```
server/
├── src/
│   ├── controllers/   # Route handlers
│   ├── services/      # Business logic
│   └── middleware/    # Custom middleware
```

### Core Engine (Python)
```
core/
├── exchange/          # Exchange adapters
├── ai/               # AI/ML modules
└── utils/            # Utility functions
```

## 🛠️ Development Workflow

### 1. Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new trading strategy"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Code Standards
- Follow coding standards trong `memory-bank/development/coding-standards/`
- Use TypeScript cho frontend và backend
- Write tests cho new features
- Update documentation khi cần

### 3. Testing
```bash
# Frontend tests
cd client
npm run test

# Backend tests
cd server
npm run test

# Python tests
cd core
pytest
```

## 📖 Important Documentation

### Memory Bank
- [Project Overview](../project-overview.md)
- [Coding Standards](../development/coding-standards/coding-standards.md)
- [API Documentation](../development/api-documentation/)
- [Architecture Decisions](../architecture/technical-decisions/adr/)

### External Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [CCXT Documentation](https://docs.ccxt.com/)

## 🎯 First Tasks

### Week 1: Setup & Familiarization
- [ ] Complete environment setup
- [ ] Read project documentation
- [ ] Understand codebase structure
- [ ] Run existing tests
- [ ] Join team meetings

### Week 2: First Contribution
- [ ] Pick up a simple bug fix
- [ ] Create your first PR
- [ ] Participate in code reviews
- [ ] Ask questions and seek feedback

## 👥 Team Communication

### Daily Standups
- **Time**: 9:00 AM daily
- **Format**: What you did yesterday, what you'll do today, any blockers
- **Platform**: Slack/Zoom

### Sprint Planning
- **Frequency**: Every 2 weeks
- **Purpose**: Plan upcoming sprint tasks
- **Participation**: All team members

### Code Reviews
- **Required**: All code changes
- **Process**: Create PR → Get review → Address feedback → Merge
- **Guidelines**: Be constructive, ask questions, suggest improvements

## 🆘 Getting Help

### When You're Stuck
1. **Check Documentation**: Memory bank và README files
2. **Search Issues**: GitHub issues và discussions
3. **Ask Team**: Slack channel hoặc team chat
4. **Pair Programming**: Schedule với team member

### Useful Commands
```bash
# Start development servers
npm start

# Run tests
npm test

# Build for production
npm run build

# Check code quality
npm run lint
npm run type-check
```

## 📊 Performance Expectations

### Code Quality
- **Test Coverage**: > 80%
- **Code Review**: Required for all changes
- **Documentation**: Update khi thêm features mới

### Communication
- **Response Time**: Within 24 hours
- **Meeting Attendance**: Required for all team meetings
- **Knowledge Sharing**: Contribute to memory bank

## 🎉 Success Metrics
- [ ] Environment setup completed
- [ ] First PR merged
- [ ] Understanding of project architecture
- [ ] Active participation in team activities
- [ ] Contribution to memory bank

## 📞 Contact Information
- **Team Lead**: [NAME] - [EMAIL]
- **Tech Lead**: [NAME] - [EMAIL]
- **Product Owner**: [NAME] - [EMAIL]
- **Slack Channel**: #trade-bot-dev

---
*Last updated: 10/08/2025*
