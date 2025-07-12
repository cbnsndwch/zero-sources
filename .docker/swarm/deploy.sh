#!/bin/bash

# ZRocket Docker Swarm Deployment Script
# This script automates the deployment process for the ZRocket application

set -euo pipefail

# Configuration
STACK_NAME="zrocket"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
SCHEMA_SOURCE="../../../libs/zchat-contracts/src/discriminated-schema.json"
SCHEMA_DEST="./schema/discriminated-schema.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in Docker Swarm mode
check_swarm_mode() {
    if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q "active"; then
        log_error "Docker is not running in Swarm mode"
        log_info "Initialize Swarm mode with: docker swarm init"
        exit 1
    fi
    log_success "Docker Swarm mode is active"
}

# Check if environment file exists
check_environment() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file '$ENV_FILE' not found"
        log_info "Copy .env.example to .env and configure your values"
        exit 1
    fi
    
    # Source environment variables
    set -a
    source "$ENV_FILE"
    set +a
    
    log_success "Environment configuration loaded"
}

# Copy Zero schema file
copy_schema() {
    if [[ -f "$SCHEMA_SOURCE" ]]; then
        mkdir -p "$(dirname "$SCHEMA_DEST")"
        cp "$SCHEMA_SOURCE" "$SCHEMA_DEST"
        log_success "Zero schema copied to deployment directory"
    else
        log_warning "Schema source file not found: $SCHEMA_SOURCE"
        log_info "Schema will need to be copied manually after deployment"
    fi
}

# Create Docker secrets if they don't exist
create_secrets() {
    log_info "Creating Docker secrets..."
    
    # PostgreSQL password
    if ! docker secret inspect zrocket_postgres_password >/dev/null 2>&1; then
        if [[ -z "${POSTGRES_PASSWORD:-}" ]]; then
            log_error "POSTGRES_PASSWORD not set in environment"
            exit 1
        fi
        echo "$POSTGRES_PASSWORD" | docker secret create zrocket_postgres_password -
        log_success "Created PostgreSQL password secret"
    else
        log_info "PostgreSQL password secret already exists"
    fi
    
    # JWT secret
    if ! docker secret inspect zrocket_jwt_secret >/dev/null 2>&1; then
        if [[ -z "${JWT_SECRET:-}" ]]; then
            log_error "JWT_SECRET not set in environment"
            exit 1
        fi
        echo "$JWT_SECRET" | docker secret create zrocket_jwt_secret -
        log_success "Created JWT secret"
    else
        log_info "JWT secret already exists"
    fi
}

# Check if required networks exist
check_networks() {
    if ! docker network inspect traefik-public >/dev/null 2>&1; then
        log_warning "traefik-public network not found"
        log_info "Creating external network: traefik-public"
        docker network create --driver overlay --attachable traefik-public
        log_success "Created traefik-public network"
    else
        log_success "traefik-public network exists"
    fi
}

# Deploy the stack
deploy_stack() {
    log_info "Deploying ZRocket stack..."
    
    # Deploy with environment variables
    docker stack deploy \
        --compose-file "$COMPOSE_FILE" \
        --with-registry-auth \
        "$STACK_NAME"
    
    log_success "Stack deployment initiated"
}

# Wait for services to be ready
wait_for_services() {
    log_info "Waiting for services to start..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        local running_services
        running_services=$(docker stack services "$STACK_NAME" --format "table {{.Replicas}}" | grep -c "1/1\|2/2" || true)
        local total_services
        total_services=$(docker stack services "$STACK_NAME" --quiet | wc -l)
        
        if [[ $running_services -eq $total_services ]]; then
            log_success "All services are running"
            break
        fi
        
        log_info "Attempt $attempt/$max_attempts: $running_services/$total_services services running"
        sleep 10
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_warning "Services may still be starting. Check with: docker stack services $STACK_NAME"
    fi
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    echo ""
    docker stack services "$STACK_NAME"
    echo ""
    
    log_info "Service URLs:"
    echo "🌐 Frontend: https://${DOMAIN_NAME:-zrocket.app}"
    echo "📡 API: https://${API_DOMAIN:-api.zrocket.app}"
    echo "🔄 Zero Sync: https://${ZERO_DOMAIN:-zero.zrocket.app}"
    echo ""
    
    log_info "Useful Commands:"
    echo "• View logs: docker service logs ${STACK_NAME}_zrocket-api"
    echo "• Scale service: docker service scale ${STACK_NAME}_zrocket-api=4"
    echo "• Remove stack: docker stack rm $STACK_NAME"
}

# Main deployment function
main() {
    log_info "Starting ZRocket deployment..."
    
    check_swarm_mode
    check_environment
    copy_schema
    create_secrets
    check_networks
    deploy_stack
    wait_for_services
    show_status
    
    log_success "ZRocket deployment completed!"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "remove")
        log_info "Removing ZRocket stack..."
        docker stack rm "$STACK_NAME"
        log_success "Stack removal initiated"
        ;;
    "status")
        show_status
        ;;
    "logs")
        service_name="${2:-zrocket-api}"
        docker service logs "${STACK_NAME}_${service_name}" --follow
        ;;
    "scale")
        service_name="${2:-zrocket-api}"
        replicas="${3:-2}"
        docker service scale "${STACK_NAME}_${service_name}=${replicas}"
        ;;
    *)
        echo "Usage: $0 {deploy|remove|status|logs [service]|scale [service] [replicas]}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy the ZRocket stack (default)"
        echo "  remove  - Remove the ZRocket stack"
        echo "  status  - Show deployment status"
        echo "  logs    - Show logs for a service (default: zrocket-api)"
        echo "  scale   - Scale a service (default: zrocket-api to 2 replicas)"
        exit 1
        ;;
esac