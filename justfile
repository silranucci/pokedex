# Default recipe (show help)
default:
    @just --list

# Build Docker images
build:
    docker-compose build

# Build without cache
build-clean:
    docker-compose build --no-cache

# Start development server
dev:
    docker-compose up app-dev

# Start development server in background
dev-bg:
    docker-compose up -d app-dev

# Stop development server
dev-stop:
    docker-compose stop app-dev

# View development logs
dev-logs:
    docker-compose logs -f app-dev

# Run all tests
test:
    docker-compose --profile test run --rm app-test-unit

# Run smoke tests only
test-smoke:
    docker-compose --profile test run --rm app-test-smoke

# Run a specific test file
test-file FILE:
    docker-compose --profile test run --rm app-test-unit npm test -- {{FILE}}

# Clean up Docker resources
clean:
    docker-compose down -v
    docker-compose --profile test down -v
    docker-compose --profile production down -v

# Clean up Docker resources and images
clean-all:
    docker-compose down -v --rmi all
    docker-compose --profile test down -v --rmi all

# Restart development server
restart:
    docker-compose restart app-dev

# Execute command in running dev container
exec CMD:
    docker-compose exec app-dev {{CMD}}

# Open shell in running dev container
shell:
    docker-compose exec app-dev sh

# Open shell in test container
shell-test:
    docker-compose --profile test run --rm app-test-unit sh

# Check container health
health:
    docker-compose exec app-dev wget --spider http://localhost:3000/health-check || echo "Health check failed"

# View all running containers
ps:
    docker-compose ps -a

# Show logs for all services
logs:
    docker-compose logs -f

# Run linter
lint:
    docker-compose run --rm app-dev npm run lint

# Format code
lint-fix:
    docker-compose run --rm app-dev npm run lint:fix

# Quick test (no build)
test-quick:
    docker-compose --profile test run --rm --no-deps app-test-unit npm test

# Prune Docker system
prune:
    docker system prune -f

# Show Docker disk usage
disk-usage:
    docker system df
