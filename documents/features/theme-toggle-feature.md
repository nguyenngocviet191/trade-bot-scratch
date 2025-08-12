# Theme Toggle Feature - Technical Design Document

## Overview
Tính năng cho phép người dùng chuyển đổi giữa theme light và dark mode trong ứng dụng frontend Trade Bot Scratch.

## Purpose
- Cải thiện trải nghiệm người dùng với tùy chọn theme phù hợp
- Giảm mỏi mắt khi sử dụng ứng dụng trong môi trường thiếu sáng
- Tăng tính chuyên nghiệp và hiện đại của ứng dụng
- Lưu trữ preference của người dùng

## Design

### Architecture Components
1. **Theme Context Provider**: Quản lý state theme toàn cục
2. **Theme Toggle Component**: UI component để chuyển đổi theme
3. **CSS Variables System**: Định nghĩa colors cho cả light và dark mode
4. **LocalStorage Integration**: Lưu trữ theme preference
5. **Tailwind Configuration**: Cấu hình dark mode classes

### Technical Implementation
- Sử dụng React Context API để quản lý theme state
- CSS custom properties (variables) cho dynamic theming
- Tailwind CSS dark mode với class strategy
- LocalStorage để persist theme preference
- Smooth transitions và animations
- Accessible design với ARIA labels

### Theme Colors Scheme
**Light Mode:**
- Background: #ffffff, #f8fafc, #f1f5f9
- Text: #1e293b, #334155, #64748b
- Primary: #3b82f6, #2563eb
- Border: #e2e8f0, #cbd5e1

**Dark Mode:**
- Background: #0f172a, #1e293b, #334155
- Text: #f8fafc, #f1f5f9, #cbd5e1
- Primary: #60a5fa, #3b82f6
- Border: #475569, #64748b

## Dependencies
- React 18+ với Context API
- Tailwind CSS với dark mode plugin
- LocalStorage API
- Existing component structure (Header, Layout)

## Usage
```tsx
// Trong App.tsx
<ThemeProvider>
  <App />
</ThemeProvider>

// Trong component
const { theme, toggleTheme } = useTheme();
```

## Error Handling
- Fallback to light theme nếu localStorage không available
- Graceful degradation nếu CSS variables không supported
- Error boundary cho theme context
- Validation cho theme values

## Open Questions
- Có cần sync theme với backend user preferences?
- Có cần thêm auto theme detection (system preference)?
- Có cần thêm custom theme colors cho branding?

## Success Criteria
- Theme toggle hoạt động mượt mà với animation
- Theme preference được lưu trữ và restore
- Tất cả components hiển thị đúng trong cả light và dark mode
- Accessible với keyboard navigation và screen readers
- Performance không bị ảnh hưởng đáng kể
