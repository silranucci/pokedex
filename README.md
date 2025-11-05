# Pokedex API 

A modern TypeScript API for fetching Pokemon information with fun translations using Effect-TS.

## Table of Contents

- [Features](#features)
- [Things to do better](#things-to-do-better)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Docker](#docker)
- [Project Structure](#project-structure)
- [Development](#development)

## Features

- **Pokemon Information** - Fetch detailed pokemon data from PokeAPI
- **Fun Translations** - Shakespeare and Yoda translations for descriptions
- **Type-Safe** - Full TypeScript with Effect-TS for functional programming
- **Comprehensive Testing** - Tests with MSW, smoke tests for real API integration and contract testing
- **Docker Ready** - Multi-stage builds for development, testing, and production
- **OpenAPI/Swagger** - Auto-generated API documentation
- **Error Handling** - Robust error handling with custom error types
- **Clean Architecture** - Ports & Adapters pattern with clear separation of concerns

## Things to do better
- error handling 
- set headers for rate limit
- use in source test as supported by vitest
- ci/cd
- typings
- additional attention to local dev env

## Tech Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript 5.x
- **Framework**: Effect-TS (@effect/platform)
- **HTTP Server**: Node HTTP with Effect-TS
- **Testing**: Vitest + MSW (Mock Service Worker)
- **Containerization**: Docker & Docker Compose
- **Task Runner**: just
- **External APIs**:
  - [PokeAPI](https://pokeapi.co/) - Pokemon data
  - [FunTranslations API](https://funtranslations.com/) - Text translations

## Prerequisites

- Node.js 20+ (or Docker)
- npm/yarn/pnpm
- Docker & Docker Compose (optional, for containerized development)
- [just](https://github.com/casey/just) (optional, for convenient commands)

## Installation

### Option 1: Local Development

```bash
# Clone the repository
git clone git@github.com:silranucci/pokedex.git
cd pokedex

# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Docker Development

```bash
# Clone the repository
git clone git@github.com:silranucci/pokedex.git
cd pokedex

# Using just (recommended)
just dev

# Or using docker-compose directly
docker-compose build
docker-compose up app-dev
```

The API will be available at `http://localhost:3000`

## Usage

### Basic Example

```bash
# Get Pikachu information
curl http://localhost:3000/pokemon/pikachu

# Get Pikachu with Shakespeare translation
curl http://localhost:3000/pokemon/translated/pikachu

# Get Mewtwo with Yoda translation (legendary pokemon)
curl http://localhost:3000/pokemon/translated/mewtwo
```

### Using HTTPie

```bash
# Get pokemon
http GET localhost:3000/pokemon/pikachu

# Get translated pokemon
http GET localhost:3000/pokemon/translated/charizard
```

### OpenAPI Documentation

```
GET /docs
```

Interactive Swagger UI documentation for the API.

## Testing

The project includes comprehensive test coverage with two types of tests:

### Unit Tests (with MSW)

Tests use Mock Service Worker to mock external APIs.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test pokemon-get-by.test.ts

# Using Docker
just test
just test-watch
just test-coverage
```

### Smoke Tests (Real API Integration)

Tests make real calls to external APIs for integration verification.

```bash
# Run smoke tests
npm run test:smoke

# Using Docker
just test-smoke
```

**Note:** Smoke tests may fail due to rate limits on external APIs (especially FunTranslations API with 5 requests/hour limit).

### Test Structure

```
tests/
├── pokemon-get-by.test.ts           # Unit tests for GET /pokemon/:name
├── pokemon-get-by-translated.test.ts # Unit tests for GET /pokemon/translated/:name
├── pokeapi.smoke.test.ts            # Smoke tests for PokeAPI
├── funtranslation.smoke.test.ts     # Smoke tests for FunTranslations API
└── lib/
    ├── mockserver/                   # MSW mock handlers
    │   ├── index.ts
    │   ├── pokeapi.ts
    │   └── funtranslationapi.ts
    └── spawn-app.ts                  # Test helper for spawning app
```

## Docker

### Quick Start

```bash
# Setup and start development
just dev

# Run tests in Docker
just test
just test-watch

# Start production build
just prod
```

### Docker Services

- **app-dev** - Development server with hot reload
- **app-test-unit** - Run unit tests with MSW
- **app-test-smoke** - Run integration/smoke tests
- **app-test-watch** - Watch mode for TDD

### Common Docker Commands

```bash
# Development
just dev              # Start dev server
just dev-bg           # Start in background
just dev-logs         # View logs
just restart          # Restart server

# Testing
just test             # Run all tests
just test-smoke       # Smoke tests
just test-file FILE   # Test specific file

# Build & Clean
just build            # Build images
just build-clean      # Clean build
just clean            # Remove containers
just clean-all        # Remove everything

# Utilities
just shell            # Open shell in container
just exec CMD         # Execute command
just health           # Check health
just ps               # View containers
```

See [DOCKER_README.md](./DOCKER_README.md) for complete Docker documentation.

## Project Structure

```
pokedex-api/
├── src/
│   ├── app/
│   │   ├── Api.ts                    # Main API definition
│   │   ├── Http.ts                   # HTTP server setup
│   │   ├── Application/
│   │   │   ├── HealthCheck/          # Health check endpoint
│   │   │   ├── Pokemon/              # Pokemon feature
│   │   │   │   ├── Api.ts            # Pokemon API endpoints
│   │   │   │   ├── Http.ts           # Pokemon HTTP handlers
│   │   │   │   └── Service.ts        # Pokemon business logic
│   │   │   └── Ports/                # Interface definitions
│   │   │       ├── PokemonRepository.ts
│   │   │       └── TranslationService.ts
│   │   ├── Domain/
│   │   │   └── Pokemon.ts            # Pokemon domain model
│   │   ├── Infrastructure/
│   │   │   ├── PokeApi.ts            # PokeAPI adapter
│   │   │   └── FunTranslationApi.ts  # Translation API adapter
│   │   └── lib/
│   │       └── ApiError.ts           # Error definitions
│   └── index.ts                      # Application entry point
├── tests/
│   ├── pokemon-get-by.test.ts
│   ├── pokemon-get-by-translated.test.ts
│   ├── pokeapi.smoke.test.ts
│   ├── funtranslation.smoke.test.ts
│   └── lib/
│       ├── mockserver/               # MSW handlers
│       └── spawn-app.ts
├── Dockerfile                        # Multi-stage Docker build
├── docker-compose.yml                # Docker Compose configuration
├── justfile                          # Task runner commands
├── vitest.config.ts                  # Vitest configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json
```

### Architecture

The project follows **Clean Architecture** principles:

1. **Domain Layer** (`Domain/`) - Core business entities
2. **Application Layer** (`Application/`) - Use cases and business logic
3. **Infrastructure Layer** (`Infrastructure/`) - External adapters (APIs, databases)
4. **Presentation Layer** (`Api.ts`, `Http.ts`) - HTTP endpoints

**Ports & Adapters Pattern:**
- `Ports/` - Interfaces defining contracts
- `Infrastructure/` - Concrete implementations

## Development

### Available Scripts

```bash
# Development
npm run dev           # Start dev server

# Testing
npm test              # Run unit tests
npm run test:smoke    # Smoke tests
npm run test:all      # Run all tests

# Code Quality
npm run lint          # Run linter
npm run check         # Type checking
```

### Adding New Features

1. **Define Domain Model** in `Domain/`
2. **Create Port Interface** in `Application/Ports/`
3. **Implement Service** in `Application/[Feature]/Service.ts`
4. **Define API** in `Application/[Feature]/Api.ts`
5. **Create HTTP Handlers** in `Application/[Feature]/Http.ts`
6. **Implement Infrastructure** in `Infrastructure/`
7. **Write Tests** in `tests/`

### Testing Workflow

```bash
# Local TDD workflow
npm run test

# Docker TDD workflow
just test
```

## Configuration

### Vitest Configuration

Tests are split into two categories:

**Unit Tests** (`.test.ts`)
- Use MSW for mocking
- Run by default with `npm test`
- Fast, isolated, no external dependencies

**Smoke Tests** (`.smoke.test.ts`)
- Real API calls
- Run with `npm run test:smoke`
- Slower, requires internet connection
```

### TypeScript Configuration

- Strict mode enabled
- Path aliases configured
- ES modules with CommonJS interop

## API Design Decisions

### Why Effect-TS?

- **Type-safe error handling** - No uncaught exceptions
- **Composability** - Easy to combine effects
- **Testability** - Easy to mock dependencies
- **Performance** - Efficient execution model

### Error Handling

All errors are typed and handled explicitly:
- `PokemonNotFoundError` - Pokemon doesn't exist
- `PokemonFetchError` - Failed to fetch from PokeAPI
- `TranslationError` - Failed to translate text
- `NotFoundError` (API) - 404 response
- `InternalServerError` (API) - 500 response

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use Docker
just dev-stop
just clean
just dev
```

### Tests Failing

```bash
# Clean and rebuild
just clean-all
just build-clean
just test

# Check specific test
just test-file tests/pokemon-get-by.test.ts
```

### FunTranslations Rate Limit

The FunTranslations API has a rate limit of 5 requests per hour. Smoke tests may fail if you hit this limit. Wait an hour or skip smoke tests:

```bash
# Skip smoke tests
npm test

# Only smoke tests (may fail on rate limit)
npm run test:smoke
```

### Docker Issues

```bash
# Clean Docker system
just prune
just disk-usage

# Fresh start
just clean-all
just dev
```

## Resources

- [Effect-TS Documentation](https://effect.website/)
- [PokeAPI Documentation](https://pokeapi.co/docs/v2)
- [FunTranslations API](https://funtranslations.com/api/)
- [Vitest Documentation](https://vitest.dev/)
- [MSW Documentation](https://mswjs.io/)

---

**Built with ❤️ using Effect-TS and TypeScript**
