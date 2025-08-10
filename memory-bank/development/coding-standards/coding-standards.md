# Coding Standards - Trade Bot Scratch

## 🎯 Mục tiêu
Đảm bảo code quality, consistency và maintainability across toàn bộ dự án.

## 📋 Frontend Standards (React + TypeScript)

### File Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── features/     # Feature-specific components
│   └── layouts/      # Layout components
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── services/         # API services
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── lib/              # Third-party library configs
```

### Naming Conventions
- **Components**: PascalCase (e.g., `CurrencyTable.tsx`)
- **Files**: kebab-case (e.g., `currency-table.tsx`)
- **Variables**: camelCase (e.g., `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `UserProfile`)

### Code Style
```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await updateProfile(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-profile">
      {/* Component content */}
    </div>
  );
};

// ❌ Bad
const userProfile = ({user}) => {
  const [loading, setLoading] = useState(false);
  
  const submit = async (data) => {
    setLoading(true);
    try {
      await updateProfile(data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };
  
  return <div>{/* content */}</div>;
};
```

## 📋 Backend Standards (Node.js + TypeScript)

### Project Structure
```
server/
├── src/
│   ├── controllers/   # Route handlers
│   ├── services/      # Business logic
│   ├── models/        # Data models
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript types
├── tests/             # Test files
└── config/            # Configuration files
```

### API Design
```typescript
// ✅ Good - RESTful API
// GET /api/users/:id
// POST /api/users
// PUT /api/users/:id
// DELETE /api/users/:id

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Controller example
export const getUserById = async (
  req: Request,
  res: Response<ApiResponse<User>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
```

## 🐍 Python Standards (FastAPI)

### Project Structure
```
core/
├── exchange/
│   ├── adapter/       # Exchange adapters
│   └── base.py        # Base classes
├── ai/                # AI/ML modules
└── utils/             # Utility functions
```

### Code Style
```python
# ✅ Good
from typing import List, Optional, Dict
from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass
class TradingSignal:
    """Represents a trading signal."""
    symbol: str
    signal_type: str  # 'BUY' or 'SELL'
    price: float
    timestamp: int
    confidence: float

class ExchangeAdapter(ABC):
    """Base class for exchange adapters."""
    
    def __init__(self, exchange_name: str):
        self.exchange_name = exchange_name
        self.connection = None
    
    @abstractmethod
    def connect(self) -> bool:
        """Establish connection to exchange."""
        pass
    
    def get_ticker(self, symbol: str) -> Optional[Dict]:
        """Get current ticker data."""
        if not self.connection:
            raise ConnectionError("Not connected to exchange")
        
        try:
            return self._fetch_ticker(symbol)
        except Exception as e:
            logger.error(f"Failed to fetch ticker: {e}")
            return None

# ❌ Bad
class exchange_adapter:
    def __init__(self, exchange):
        self.exchange = exchange
        self.conn = None
    
    def connect(self):
        # implementation
        pass
    
    def get_ticker(self, symbol):
        if not self.conn:
            raise Exception("not connected")
        return self.fetch_ticker(symbol)
```

## 🔧 Tools & Configuration

### ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Python Black Configuration
```toml
[tool.black]
line-length = 88
target-version = ['py38']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''
```

## 📝 Code Review Checklist

### Frontend
- [ ] TypeScript types properly defined
- [ ] Component is reusable and modular
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Accessibility considerations
- [ ] Performance optimizations
- [ ] Tests written

### Backend
- [ ] Input validation implemented
- [ ] Error handling comprehensive
- [ ] Logging appropriate
- [ ] Security considerations
- [ ] API documentation updated
- [ ] Tests written
- [ ] Performance considerations

### Python
- [ ] Type hints used
- [ ] Docstrings present
- [ ] Exception handling proper
- [ ] Logging implemented
- [ ] Tests written
- [ ] Performance considerations

## 🚀 Git Workflow

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `refactor/component-name` - Code refactoring

### Commit Messages
```
type(scope): description

feat: add new trading strategy
fix: resolve API timeout issue
docs: update API documentation
refactor: improve error handling
test: add unit tests for user service
```

## 📊 Code Quality Metrics
- **Test Coverage**: > 80%
- **Code Complexity**: < 10 (Cyclomatic)
- **Code Duplication**: < 5%
- **Technical Debt**: < 10%

---
*Last updated: 10/08/2025*
