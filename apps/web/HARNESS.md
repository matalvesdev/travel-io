# Harness Engineering for Travel-IO

## Overview

This document describes the harness engineering approach for the Travel-IO project, following best practices from OpenAI, Anthropic, and Martin Fowler's harness engineering principles.

## Architecture

### Feedforward Controls (Guides)

These controls anticipate and steer agent behavior before it acts:

1. **AGENTS.md** - Repository knowledge base for coding agents
2. **TypeScript Strict Mode** - Prevents type errors at compile time
3. **ESLint Rules** - Enforce coding conventions
4. **Prettier** - Consistent code formatting
5. **Husky Pre-commit Hooks** - Run linting and tests before commits

### Feedback Controls (Sensors)

These controls observe after the agent acts and help it self-correct:

1. **Unit Tests** - Fast, isolated tests for individual functions
2. **Integration Tests** - Test API routes and database interactions
3. **Component Tests** - Test React components in isolation
4. **E2E Tests** - Full application workflow tests
5. **Type Checking** - TypeScript compiler catches type errors
6. **Linting** - ESLint catches code quality issues
7. **Coverage Reports** - Track test coverage metrics

## Test Pyramid

```
                    ┌─────────┐
                    │  E2E    │  (Slow, expensive, high confidence)
                    │  Tests  │
                    ├─────────┤
                    │  Integ  │  (Medium speed, medium cost)
                    │  Tests  │
                    ├─────────┤
                    │  Unit   │  (Fast, cheap, high volume)
                    │  Tests  │
                    └─────────┘
```

### Unit Tests (Fast, Isolated)

- **Location**: `src/__tests__/unit/`
- **Purpose**: Test individual functions and modules
- **Speed**: < 100ms per test
- **Coverage Target**: 80%+

### Integration Tests (API Routes, Database)

- **Location**: `src/__tests__/integration/`
- **Purpose**: Test API routes and database interactions
- **Speed**: < 1s per test
- **Coverage Target**: 70%+

### Component Tests (React Components)

- **Location**: `src/__tests__/unit/components/`
- **Purpose**: Test React components in isolation
- **Speed**: < 500ms per test
- **Coverage Target**: 70%+

### E2E Tests (Full Workflows)

- **Location**: `src/__tests__/e2e/`
- **Purpose**: Test complete user workflows
- **Speed**: < 10s per test
- **Coverage Target**: Critical paths only

## Quality Gates

### Pre-commit Hooks

```bash
# Run before each commit
npm run lint
npm run typecheck
npm run test:unit
```

### CI/CD Pipeline

```yaml
# GitHub Actions workflow
- name: Type Check
  run: npm run typecheck

- name: Lint
  run: npm run lint

- name: Unit Tests
  run: npm run test:unit

- name: Integration Tests
  run: npm run test:integration

- name: Build
  run: npm run build
```

## Git Flow

### Branch Strategy

```
main (production)
  ↑
develop (integration)
  ↑
feature/* (feature branches)
  ↑
bugfix/* (bug fix branches)
```

### Commit Conventions

```
feat: add new feature
fix: bug fix
refactor: code refactoring
test: add tests
docs: documentation
chore: maintenance
```

### Pull Request Process

1. Create feature branch from develop
2. Implement changes with tests
3. Run all quality gates
4. Create PR with description
5. Get code review approval
6. Merge to develop
7. Deploy to staging
8. Merge to main for production

## Monitoring and Observability

### Test Coverage

- Run `npm run test:coverage` to generate coverage reports
- Coverage reports stored in `coverage/` directory
- Track coverage trends over time

### Performance Metrics

- Test execution time
- Build time
- Deployment frequency
- Mean time to recovery (MTTR)

## Harness Evolution

As models improve, we regularly review and update the harness:

1. **Monthly Review**: Assess which controls are still needed
2. **Quarterly Audit**: Review test coverage and quality metrics
3. **Annual Overhaul**: Major refactoring of harness components

## References

- [OpenAI Harness Engineering](https://openai.com/pt-BR/index/harness-engineering/)
- [Anthropic Harness Design](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Martin Fowler Harness Engineering](https://martinfowler.com/articles/harness-engineering.html)
- [TLC Spec-Driven](https://agent-skills.techleads.club/skills/tlc-spec-driven/)
