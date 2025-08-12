# Quy trình làm việc tiêu chuẩn cho Fullstack Developer

## 🎯 Overview
Workflow tối ưu cho solo developer trong dự án software development với memory bank integration.

## 📋 Workflow Steps

### 1. **Hiểu yêu cầu & Phân tích**  
   - Nắm rõ User Story hoặc task được giao từ Product Backlog
   - **Memory Bank Check**: Review related documentation trong memory bank
   - Làm rõ các yêu cầu chức năng và phi chức năng
   - Xác định dependencies với các components khác
   - Nếu cần, trao đổi với Product Owner hoặc team để làm rõ

### 2. **Thiết kế giải pháp**  
   - **Architecture Review**: Check Architecture Decision Records (ADRs) trong memory bank
   - Lên sơ đồ kiến trúc cho frontend, backend, và system components
   - Xác định API contracts, database schema, và UI components
   - **Security Design**: Plan authentication, authorization, data protection
   - **Performance Planning**: Consider scalability và response times

### 3. **Phát triển frontend**
   - Viết code theo coding standards trong memory bank
   - Implement type safety (TypeScript nếu applicable)
   - Kết nối với backend qua API với proper error handling
   - Đảm bảo responsiveness và accessibility standards
   - Implement loading states và user feedback

### 4. **Phát triển backend**
   - Xây dựng API theo RESTful standards hoặc GraphQL
   - Implement business logic với proper validation
   - Tương tác với database với proper connection management
   - **Security Implementation**: Input validation, authentication, logging
   - **Performance Optimization**: Query optimization, caching strategies

### 5. **Testing & Quality Assurance**
   - **Unit Tests**: Frontend components, backend services (coverage > 80%)
   - **Integration Tests**: API endpoints, database integration
   - **E2E Tests**: Complete user workflows
   - **Performance Tests**: Response time, load testing (nếu cần)
   - **Security Tests**: Vulnerability scanning, penetration testing
   - Code review (self-review hoặc peer review)

### 6. **Documentation & Memory Bank**
   - **API Documentation**: Update API documentation (OpenAPI/Swagger)
   - **Technical Documentation**: Architecture decisions, deployment guides
   - **Memory Bank Entry**: Create/update relevant documentation
   - **User Documentation**: User guides, admin guides (nếu cần)
   - **Business Documentation**: Process flows, compliance docs (nếu cần)

### 7. **Deployment & DevOps**
   - **Environment Setup**: Configure staging environment
   - **CI/CD Pipeline**: Automated testing và deployment
   - **Monitoring**: Set up alerts và logging
   - **Security**: Environment variables, secrets management
   - Deploy to staging, run smoke tests

### 8. **Production Deployment**
   - **Release Planning**: Feature flags, gradual rollout (nếu cần)
   - **Deployment**: Production deployment với rollback plan
   - **Monitoring**: Real-time monitoring và alerting
   - **Incident Response**: Handle issues và incidents

### 9. **Post-Deployment**
   - **Performance Monitoring**: Track KPIs và metrics
   - **User Feedback**: Collect và analyze user feedback
   - **Bug Fixes**: Address production issues
   - **Optimization**: Performance tuning và improvements

### 10. **Continuous Improvement**
   - **Retrospective**: Review lessons learned
   - **Code Refactoring**: Improve code quality
   - **Process Improvement**: Update workflows và templates
   - **Knowledge Sharing**: Update memory bank với best practices

## 🔧 Quality Gates

### Definition of Done Checklist
- [ ] Code implemented và tested (coverage > 80%)
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code reviewed và approved
- [ ] Documentation updated trong memory bank
- [ ] Security review completed
- [ ] Performance requirements met
- [ ] Deployed to staging và tested
- [ ] Product Owner acceptance
- [ ] No critical bugs

### Security Checklist
- [ ] Input validation implemented
- [ ] Authentication/authorization verified
- [ ] Data encryption applied (nếu cần)
- [ ] SQL injection prevention
- [ ] XSS protection implemented
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] Logging và monitoring set up

### Performance Checklist
- [ ] Response time meet requirements
- [ ] Database queries optimized
- [ ] Caching implemented where appropriate
- [ ] Resource usage optimized
- [ ] Load testing completed (nếu cần)
- [ ] Scalability considerations addressed

## 📊 Tools & Resources

### Development Tools
- **IDE**: VS Code hoặc preferred IDE với extensions
- **Version Control**: Git với conventional commits
- **Testing**: Jest, Testing Library, Postman, hoặc equivalent
- **Documentation**: Markdown, API documentation tools

### Memory Bank Integration
- **Templates**: Use templates từ memory bank
- **Documentation**: Update relevant sections
- **Knowledge Base**: Contribute lessons learned
- **Standards**: Follow coding standards và ADRs

### Monitoring & DevOps
- **Logging**: Structured logging với correlation IDs
- **Monitoring**: Application performance monitoring
- **Alerting**: Proactive alerting cho issues
- **Deployment**: Automated CI/CD pipeline

## 🎯 Best Practices

### Code Quality
- Follow language-specific best practices
- Implement proper error handling
- Use consistent naming conventions
- Write self-documenting code
- Regular code refactoring

### Testing Strategy
- Test-driven development (TDD) when possible
- Comprehensive test coverage
- Automated testing pipeline
- Performance testing for critical paths
- Security testing integration

### Documentation
- Keep documentation up-to-date
- Use clear và concise language
- Include examples và code snippets
- Regular documentation reviews
- Version control documentation

### Security
- Security-first mindset
- Regular security reviews
- Follow OWASP guidelines
- Implement defense in depth
- Regular security updates

## 🔄 Customization Guidelines

### Project-Specific Adaptations
- **Technology Stack**: Adjust steps based on frontend/backend technologies
- **Architecture**: Modify cho monolithic, microservices, hoặc serverless
- **Team Size**: Scale workflow cho solo, small team, hoặc large team
- **Domain**: Adapt cho web apps, mobile apps, APIs, hoặc data systems

### Industry-Specific Considerations
- **Financial**: Additional compliance và security requirements
- **Healthcare**: HIPAA compliance và data privacy
- **E-commerce**: Payment processing và inventory management
- **Gaming**: Real-time performance và user experience

### Environment-Specific Adjustments
- **Startup**: Faster iteration, minimal bureaucracy
- **Enterprise**: More formal processes, compliance requirements
- **Open Source**: Community contribution guidelines
- **Consulting**: Client-specific requirements và deliverables

---
*Workflow Version: 2.1*  
*Last Updated: 10/08/2025*