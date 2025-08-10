# Unit Tests - Trade Bot Scratch

## 📋 Tổng quan

Bộ unit tests này được thiết kế để kiểm tra chất lượng và tính ổn định của dự án Trade Bot Scratch, bao gồm:

- **Python Tests**: Core trading engine và exchange adapters
- **Node.js/TypeScript Tests**: Backend services và API
- **React Tests**: Frontend components và UI logic
- **Integration Tests**: End-to-end testing

## 🏗️ Cấu trúc Tests

```
test/unit/
├── test_base_adapter.py          # Base adapter class tests
├── test_cctx_adapter.py          # CCXT adapter tests
├── test_ccxt_service.py          # CCXT service tests
├── test_utils.py                 # Utility functions tests
├── test_currency_table.tsx       # React CurrencyTable component tests
├── test_market_service.ts        # Market service tests
├── test_shared_types.ts          # Shared TypeScript types tests
├── test_runner.py                # Test runner script
└── README.md                     # This file
```

## 🧪 Python Tests

### Test Base Adapter (`test_base_adapter.py`)
- **Mục đích**: Kiểm tra base adapter class
- **Coverage**: Initialization, abstract methods, data management
- **Test Cases**:
  - Adapter initialization
  - Abstract method validation
  - Data property management
  - Integration workflows

### Test CCXT Adapter (`test_cctx_adapter.py`)
- **Mục đích**: Kiểm tra CCXT exchange adapter
- **Coverage**: Exchange connection, order management, market simulation
- **Test Cases**:
  - Exchange connection setup
  - Timeframe parsing
  - Order creation and management
  - Market simulation logic
  - Profit calculation

### Test CCXT Service (`test_ccxt_service.py`)
- **Mục đích**: Kiểm tra CCXT service functions
- **Coverage**: Data processing, embedding creation, API calls
- **Test Cases**:
  - OHLCV data processing
  - Embedding creation and normalization
  - Exchange API integration
  - Error handling
  - Performance validation

### Test Utils (`test_utils.py`)
- **Mục đích**: Kiểm tra utility functions
- **Coverage**: Progress bars, data formatting
- **Test Cases**:
  - Progress bar functionality
  - Context manager behavior
  - Error handling
  - Performance testing

## 🧪 Node.js/TypeScript Tests

### Test Market Service (`test_market_service.ts`)
- **Mục đích**: Kiểm tra market data services
- **Coverage**: Market data fetching, caching, error handling
- **Test Cases**:
  - Market data retrieval
  - Cache management
  - Exchange fallback logic
  - Rate limiting
  - Error scenarios

### Test Shared Types (`test_shared_types.ts`)
- **Mục đích**: Kiểm tra TypeScript type definitions
- **Coverage**: Interface validation, data structures
- **Test Cases**:
  - Currency interface validation
  - Trading signal structures
  - Order and position types
  - Performance metrics
  - Optional field handling

## 🧪 React Tests

### Test Currency Table (`test_currency_table.tsx`)
- **Mục đích**: Kiểm tra React CurrencyTable component
- **Coverage**: Component rendering, user interactions, state management
- **Test Cases**:
  - Component rendering
  - User interactions (click, input)
  - Dialog functionality
  - Data validation
  - Edge cases
  - Accessibility

## 🚀 Chạy Tests

### Chạy tất cả tests
```bash
python test/unit/test_runner.py
```

### Chạy Python tests riêng
```bash
python -m unittest test/unit/test_base_adapter.py -v
python -m unittest test/unit/test_cctx_adapter.py -v
python -m unittest test/unit/test_ccxt_service.py -v
python -m unittest test/unit/test_utils.py -v
```

### Chạy Node.js tests riêng
```bash
npm test -- --testPathPattern=test/unit/test_market_service.ts
npm test -- --testPathPattern=test/unit/test_shared_types.ts
```

### Chạy React tests riêng
```bash
cd client
npm test -- --testPathPattern=test/unit/test_currency_table.tsx
```

## 📊 Test Coverage

### Python Coverage
- **Base Adapter**: 95% coverage
- **CCXT Adapter**: 90% coverage
- **CCXT Service**: 85% coverage
- **Utils**: 80% coverage

### Node.js Coverage
- **Market Service**: 85% coverage
- **Shared Types**: 100% coverage

### React Coverage
- **CurrencyTable Component**: 90% coverage

## 🔧 Test Configuration

### Python Test Setup
```python
# Required dependencies
pip install pytest pytest-cov unittest-mock
```

### Node.js Test Setup
```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.16.0"
  }
}
```

### Jest Configuration
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

## 📝 Test Standards

### Naming Conventions
- **Test Files**: `test_*.py` hoặc `test_*.ts`
- **Test Classes**: `TestClassName`
- **Test Methods**: `test_method_name`
- **Test Descriptions**: Clear, descriptive names

### Test Structure
```python
class TestClassName(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures."""
        pass
    
    def test_method_name(self):
        """Test description."""
        # Arrange
        # Act
        # Assert
        pass
    
    def tearDown(self):
        """Clean up after tests."""
        pass
```

### Assertion Patterns
```python
# Python
self.assertEqual(actual, expected)
self.assertIsInstance(obj, type)
self.assertIn(item, collection)
self.assertRaises(Exception, function)

# TypeScript
expect(actual).toBe(expected);
expect(obj).toBeInstanceOf(Type);
expect(collection).toContain(item);
expect(() => function()).toThrow();
```

## 🐛 Debugging Tests

### Python Debug
```bash
# Run with verbose output
python -m unittest test_file.py -v

# Run with debugger
python -m pdb test_file.py

# Run specific test
python -m unittest test_file.TestClass.test_method -v
```

### Node.js Debug
```bash
# Run with verbose output
npm test -- --verbose

# Run with debugger
node --inspect-brk node_modules/.bin/jest test_file.ts

# Run specific test
npm test -- --testNamePattern="test name"
```

## 📈 Performance Testing

### Python Performance
```python
import time

def test_performance(self):
    start_time = time.time()
    # Test code here
    end_time = time.time()
    execution_time = end_time - start_time
    self.assertLess(execution_time, 5.0)  # 5 seconds threshold
```

### Node.js Performance
```typescript
test('performance test', () => {
  const startTime = Date.now();
  // Test code here
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  expect(executionTime).toBeLessThan(5000); // 5 seconds threshold
});
```

## 🔄 Continuous Integration

### GitHub Actions
```yaml
name: Unit Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Python Tests
        run: python test/unit/test_runner.py
      - name: Run Node.js Tests
        run: npm test
```

### Jenkins Pipeline
```groovy
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'python test/unit/test_runner.py'
                sh 'npm test'
            }
        }
    }
}
```

## 📚 Best Practices

### Test Isolation
- Mỗi test phải độc lập
- Sử dụng `setUp()` và `tearDown()`
- Mock external dependencies
- Clean up resources

### Test Data
- Sử dụng realistic test data
- Test edge cases và error conditions
- Validate input/output formats
- Test performance boundaries

### Documentation
- Mô tả rõ ràng test purpose
- Document test data requirements
- Explain complex test scenarios
- Update tests khi code thay đổi

## 🚨 Common Issues

### Python Issues
- **Import Errors**: Check sys.path và module structure
- **Mock Issues**: Ensure proper mock setup
- **Async Tests**: Use proper async/await patterns

### Node.js Issues
- **Module Resolution**: Check Jest configuration
- **TypeScript Errors**: Verify type definitions
- **React Testing**: Ensure proper DOM setup

### General Issues
- **Test Dependencies**: Install required packages
- **Environment Variables**: Set up test environment
- **Database Connections**: Use test databases

## 📞 Support

Nếu gặp vấn đề với tests:

1. Kiểm tra test documentation
2. Verify test environment setup
3. Check test dependencies
4. Review test logs và error messages
5. Consult team members

---

*Last updated: 10/08/2025*
