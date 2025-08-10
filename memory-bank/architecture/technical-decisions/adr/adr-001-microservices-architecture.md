# ADR-001: Microservices Architecture
**Status**: Accepted  
**Date**: 10/08/2025  
**Deciders**: [Team Members]

## Context
Dự án Trade Bot Scratch cần một kiến trúc có thể mở rộng, dễ bảo trì và hỗ trợ nhiều loại sàn giao dịch khác nhau.

## Decision
Chọn kiến trúc microservices với các service riêng biệt:
- **Frontend Service**: React application
- **API Gateway**: Express.js với proxy middleware
- **Market Service**: Xử lý dữ liệu thị trường
- **Bot Management Service**: Quản lý trading bots
- **Analysis Service**: Phân tích kỹ thuật
- **User Service**: Quản lý người dùng

## Consequences

### Positive
- **Scalability**: Mỗi service có thể scale độc lập
- **Technology Diversity**: Sử dụng công nghệ phù hợp cho từng service
- **Team Autonomy**: Các team có thể làm việc độc lập
- **Fault Isolation**: Lỗi không ảnh hưởng toàn bộ hệ thống

### Negative
- **Complexity**: Tăng độ phức tạp trong deployment và monitoring
- **Network Overhead**: Communication giữa các service
- **Data Consistency**: Khó khăn trong đảm bảo consistency
- **Testing Complexity**: Cần integration testing phức tạp hơn

## Implementation Plan
1. **Phase 1**: Setup API Gateway và basic services
2. **Phase 2**: Implement Market Service với CCXT
3. **Phase 3**: Add Bot Management Service
4. **Phase 4**: Implement Analysis Service
5. **Phase 5**: Add monitoring và logging

## Related ADRs
- ADR-002: Database Strategy
- ADR-003: API Design Patterns

---
*Last updated: 10/08/2025*
