# Contributing to StructCV Schema

## Schema Evolution Process

1. **Propose Changes**: Open an issue describing the proposed change
2. **Discussion**: Community feedback period (minimum 2 weeks)
3. **Implementation**: Create PR with:
   - Updated schema
   - Migration guide
   - Examples
   - Tests
   - metadata.json
4. **Review**: Maintainer review
5. **Release**: New version release

## Version Guidelines

- MAJOR: Breaking changes
- MINOR: New optional fields
- PATCH: Documentation/fixes

## Adding a New Schema Version

1. Create new version directory:
   ```bash
   mkdir schemas/v2.0

2. Add schema files:

structcv.schema.json - The actual schema
metadata.json - Version metadata
README.md - Version-specific documentation
CHANGELOG.md - Changes from previous version
examples/ - Example JSON files


3. Create metadata.json:
json{
  "status": "stable",
  "releaseDate": "2025-02-01",
  "deprecated": false,
  "changelog": "Added new fields X, Y, Z"
}

4. Update latest symlink (if applicable):
    ```bash
cd schemas
rm latest
ln -s v2.0 latest

5. Run validation:
    ```bash
npm test
npm run check-versions


## Pull Request Process

Fork the repo
Create feature branch (git checkout -b feature/amazing-feature)
Update schema and examples
Run tests (npm test)
Commit (git commit -m 'Add amazing feature')
Push (git push origin feature/amazing-feature)
Open Pull Request