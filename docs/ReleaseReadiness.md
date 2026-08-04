# Release Readiness

## Validation

- Typecheck
- Lint
- Unit tests
- Integration tests
- API tests
- Production build
- Docker build
- Docker Compose validation
- Health checks
- Load smoke tests

## Current Risk Notes

- Redis must be running for full API readiness.
- Docker is not available on the current local machine, so Docker validation must run in CI or a machine with Docker installed.
- External adapters are contract-defined and should be activated only after credentials and provider SLAs are confirmed.

