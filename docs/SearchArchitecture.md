# Search Architecture

## Search Providers

- Database search
- Meilisearch placeholder
- OpenSearch placeholder
- Elastic placeholder

## Scope

The search abstraction covers jobs, companies, candidates, career content, guidance, learning, skills, salary pages, and interview pages without changing UI behavior.

## Rules

- Keep current database search as active provider.
- Add external providers only through adapters.
- Preserve existing filters and API contracts.

