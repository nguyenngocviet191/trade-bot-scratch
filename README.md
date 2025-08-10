# trade-bot-scratch

Tradebot microservice

Frontend :Nodejs
API gateway (notejs)
Service
-Bot manage : fastapi
-Market : nodejs

## 📚 Memory Bank
- [Project Management](./memory-bank/project-management/)
- [Architecture](./memory-bank/architecture/)
- [Development](./memory-bank/development/)
- [Trading](./memory-bank/trading/)
- [Testing](./memory-bank/testing/)
- [Operations](./memory-bank/operations/)
- [Team](./memory-bank/team/)

## 🤖 Cursor AI Integration
- [Cursor Rules](./.cursorrules) - AI guidelines và coding standards
- [Cursor Integration Guide](./memory-bank/development/coding-standards/cursor-integration.md)
- [Coding Standards](./memory-bank/development/coding-standards/coding-standards.md)

## 🚀 Quick Start
```bash
# Install dependencies
npm install

# Start development servers
npm start
```

## 📋 Project Structure
```
trade-bot-scratch/
├── client/           # React frontend
├── server/           # Node.js backend
├── core/             # Python trading engine
├── memory-bank/      # Project documentation
└── shared/           # Shared types and data
```

//xoa data redis bang cmd
DEL ohlcv_1d:BTC/USDT
redis-cli --scan --pattern 'ohlcv_1d:*' | xargs redis-cli del
// xoa bang by python
await r.delete("ohlcv_1d:BTC/USDT")