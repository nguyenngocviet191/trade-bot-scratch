# Coding Standards 

## 🎯 Mục tiêu
- Đảm bảo code clean, quality, consistency và maintainability across toàn bộ dự án.

## Follow Code principle
- DRY – Don’t Repeat Yourself
- KISS – Keep It Simple, Stupid
- SOLID – 5 nguyên tắc thiết kế OOP
- YAGNI – You Aren’t Gonna Need It
- SoC – Separation of Concerns
- TDA – Tell, Don’t As
- Fail Fast
- Law of Demeter – Principle of Least Knowledge
- Composition over Inheritance
- Clean Code Principles (Google Coding Standards)

### Naming Conventions
- Đặt tên rõ nghĩa, không viết tắt , có thể phát âm, mô tả đúng vai trò,
- **Components**: PascalCase (e.g., `CurrencyTable.tsx`)
- **Files**: kebab-case (e.g., `currency-table.tsx`)
- **Variables**: camelCase (e.g., `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Class/Types/Interfaces**: PascalCase (e.g., `UserProfile`)
- **Python Variables/Function**: snake_case (e.g., `calculate_area`)

### Small Functions
- Phải nhỏ, làm một việc duy nhất
- Dễ đọc, dễ test , có thể đọc như một câu văn

### Single Responsibility Principle (SRP) 
– Mỗi class/hàm chỉ có một lý do để thay đổi

### Comment
- Comment chỉ khi cần thiết, code nên tự giải thích
- Comment giải thích tại sao hơn là làm gì
- Khi tạo function bắt buộc comment để AI có thể hiểu để call tool

### Formating
- Thụt lề 2 spaces (Java, JavaScript) hoặc 4 spaces (Python, C++).
- Dài dòng tối đa 80–100 ký tự.
- Dùng khoảng trắng hợp lý để tách khối lệnh.

## Code style
- Tránh magic numbers → dùng hằng số.
- Ưu tiên code rõ ràng hơn code “ngắn gọn khó hiểu”.

### Error Handling
- Xử lý lỗi gọn gàng, không để logic lỗi trộn lẫn logic xử lý chính
- Tránh trả về error code, dùng exception khi hợp lý



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
*Last updated: 11/08/2025*
