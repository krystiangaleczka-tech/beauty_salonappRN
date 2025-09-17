ALWAYS PROVIDE CLEAN SHORT SIMPLE CODE AND USE MCP WHEN POSSIBLE

Guidelines for organizing and tracking project progress using markdown task lists. Follow these guidelines:

Best Practices:
- Use GitHub-flavored markdown checkbox syntax for tasks: `- [ ] Task description` (uncompleted) and `- [x] Task description` (completed)
- Create clear hierarchical structure with headings (# for main sections, ## for subsections)
- Group related tasks under descriptive headings
- Include progress indicators (e.g., percentages, status labels)
- Maintain consistent formatting throughout the document
- Use labels or tags to categorize tasks (e.g., #bug, #feature, #priority)
- Add links to relevant resources, files, or issues
- Update regularly with completion dates and status changes

Example Markdown Task List:
```markdown
# Project: [Project Name] Task List

## 📋 Overview
**Progress:** 65% complete  

## 🔄 In Progress

### Backend API Development
- [x] Create user authentication endpoints
- [x] Implement JWT token validation
- [ ] Set up rate limiting middleware #security
- [ ] Create documentation for API endpoints #docs
  - [x] Authentication endpoints
  - [ ] User management endpoints
  - [ ] Content endpoints

### Frontend Implementation
- [x] Create login/signup components
- [ ] Implement dashboard layout #priority
  - [x] Navigation sidebar
  - [ ] Content area with cards
  - [ ] Responsive design for mobile
- [ ] Connect authentication API to frontend #priority
- [ ] Add form validation

## 📅 Upcoming Tasks

### Testing
- [ ] Write unit tests for authentication #testing
- [ ] Set up integration testing workflow #devops
- [ ] Create test data generators

### Deployment
- [ ] Configure CI/CD pipeline #devops
- [ ] Set up staging environment
- [ ] Create deployment documentation #docs

## ✅ Completed

### Project Setup
- [x] Initialize repository
- [x] Set up project structure
- [x] Configure development environment
- [x] Add base dependencies

### Planning
- [x] Define MVP requirements
- [x] Create initial wireframes
- [x] Set up project board

## 📌 Notes & Resources
- [Design Figma](https://figma.com/example-link)
- [API Documentation](https://docs.example.com)
- [Development Guidelines](https://github.com/example/repo/wiki)
```

Key Elements of Effective Markdown Task Lists:
1. Clear structure with logical sections (In Progress, Upcoming, Completed)
2. Nested tasks to show relationships and dependencies
3. Progress tracking at both task and project levels
4. Links to relevant resources and documentation
5. Regular updates with completion information

When managing task lists:
- Add implementation details
- Include relevant context without making tasks too verbose
- Use consistent formatting for tags
- Archive completed tasks rather than deleting them to maintain history
- Consider splitting into multiple markdown files for very large projects




# User Coding Standards & Refactoring Guide
## Basic Interaction Rules
1. Please respond to me in English
2. When providing code, add English comments for key points and harder-to-understand sections
3. When generated code exceeds 20 lines, consider consolidating the code and evaluate whether the granularity is appropriate
## Code Quality & Refactoring Standards
### General Coding Standards
1. Avoid unnecessary object copying or cloning
2. Avoid deep nesting; return early instead
3. Use appropriate concurrency control mechanisms
## Code Smell Identification & Treatment
Based on Martin Fowler's core insights in "Refactoring," here are code smells to watch for and how to handle them:
### 1. Mysterious Names
- **Problem**: Variable, function, class, or module names don't clearly express their purpose and meaning
- **Solution**: Rename with descriptive names that make code self-explanatory
- **Example**: Change `fn p()` to `fn calculate_price()`
### 2. Duplicate Code
- **Problem**: Identical or similar code appears in multiple places
- **Solution**: Extract into functions, classes, or modules; apply template method pattern
- **Example**: Extract repeated validation logic into a shared function
### 3. Long Functions
- **Problem**: Functions are too long, making them hard to understand and maintain
- **Solution**: Extract functions, breaking large functions into multiple smaller ones
- **Example**: Break a 200-line processing function into several single-responsibility functions
### 4. Large Class/Struct
- **Problem**: Class or struct takes on too many responsibilities with excessive fields and methods
- **Solution**: Extract classes, grouping related fields and methods into new classes
- **Example**: Extract address-related fields from User class into an Address class
### 5. Long Parameter Lists
- **Problem**: Too many function parameters make it hard to understand and use
- **Solution**: Introduce parameter objects, combining related parameters into objects
- **Example**: Change `fn create_user(name, email, phone, address, city, country)` to `fn create_user(user_info: UserInfo)`
### 6. Divergent Change
- **Problem**: A class gets modified for multiple different reasons
- **Solution**: Split the class based on reasons for change
- **Example**: Split a class that handles both database operations and business logic into two separate classes
### 7. Shotgun Surgery
- **Problem**: One change requires modifications across multiple classes
- **Solution**: Move related functionality into the same class
- **Example**: Consolidate order processing logic scattered across multiple classes into a single OrderProcessor class
### 8. Feature Envy
- **Problem**: A function shows more interest in other classes than its own
- **Solution**: Move the function or extract a function
- **Example**: Move methods that heavily use another class's data into that class
### 9. Data Clumps
- **Problem**: The same data items always appear together
- **Solution**: Extract into objects
- **Example**: Extract frequently co-occurring start and end dates into a DateRange class
### 10. Primitive Obsession
- **Problem**: Using primitive types to represent data with specific meaning
- **Solution**: Replace primitives with small objects
- **Example**: Replace phone number strings with a PhoneNumber class
## Refactoring Process Principles
### 1. Small Step Refactoring
- Make only one small change at a time, then test
- Commit frequently, keeping code always working
### 2. Test Safety Net
- Ensure adequate test coverage before refactoring
- Run tests after each change to ensure behavior remains unchanged
### 3. Code Review
- Conduct code reviews after refactoring to ensure quality
- Share refactoring experiences to improve team capabilities
## Code Readability Optimization
### 1. Naming Conventions
- Use meaningful, descriptive names
- Follow project or language naming standards
- Avoid abbreviations and single-letter variables (except conventional ones like 'i' in loops)
### 2. Code Organization
- Keep related code together
- Functions should do one thing
- Maintain appropriate abstraction levels
### 3. Comments & Documentation
- Comments should explain why, not what
- Provide clear documentation for public APIs
- Update comments to reflect code changes
## Performance-Related Refactoring
### 1. Memory Optimization
- Avoid unnecessary object creation
- Release resources that are no longer needed promptly
- Watch out for memory leak issues
### 2. Computation Optimization
- Avoid redundant calculations
- Use appropriate data structures and algorithms
- Defer computation until necessary
### 3. Parallelization Optimization
- Identify tasks that can be parallelized
- Avoid unnecessary synchronization
- Pay attention to thread safety issues