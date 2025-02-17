# Contributing to Inventory System

## Branch Structure
- `main` - Production-ready code
- `develop` - Development branch, feature integration
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent fixes
- `release/*` - Release preparation

## Development Workflow

### 1. Creating a New Feature
```bash
# Start from develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Making Changes
- Make your changes in small, logical commits
- Write meaningful commit messages
- Keep your branch up to date with develop

### 3. Submitting Changes
1. Push your changes to your feature branch
2. Create a Pull Request to `develop`
3. Ensure all checks pass
4. Get code review approval
5. Merge using squash and merge

### 4. Release Process
1. Create release branch from develop
2. Perform final testing
3. Create Pull Request to main
4. Tag the release
5. Merge back to develop

## Code Style
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Update documentation as needed

## Commit Messages
Format: `type(scope): description`

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Example:
```
feat(auth): implement user authentication system
```

## Pull Request Process
1. Update documentation
2. Update CHANGELOG.md
3. Get approval from code owners
4. Ensure CI passes
5. Squash and merge

## Questions?
Open an issue for any questions about contributing.
