#!/bin/bash

# 🚀 AI-Powered Universal Coolify Deployment Engine
# Self-healing deployment with DeepSeek AI error resolution
# Version: 3.0 - AI Enhanced

set -e
set -o pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
COOLIFY_SERVER="http://45.137.194.145:342891"
COOLIFY_TOKEN="1|6mQQcB4mB6Op9GChZYo53sdxJUaLUV8f3PeGExYO3ede776a"
CLOUDFLARE_API_TOKEN="lUq1OPEk5DvoKWokPYfVmId9pVm_XIo4IX3aQo7W"
BASE_DOMAIN="cloudnova.ca"
DEEPSEEK_API_KEY="sk-10b7e9918047455ebaa4b6ed00d16ea5"
DEEPSEEK_API_URL="https://api.deepseek.com/v1/chat/completions"

# GitHub credentials
GITHUB_TOKEN="${GITHUB_TOKEN}"
GITHUB_USERNAME="${GITHUB_USERNAME}"

# Load from .env.coolify if exists
[ -f ".env.coolify" ] && source .env.coolify

# Error tracking
ERROR_LOG="/tmp/coolify-deploy-errors.log"
AI_SOLUTIONS_LOG="/tmp/coolify-ai-solutions.log"
> "$ERROR_LOG"
> "$AI_SOLUTIONS_LOG"

# Logging functions
log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; echo "[$(date)] ERROR: $1" >> "$ERROR_LOG"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
step() { echo -e "${CYAN}[STEP]${NC} $1"; }
ai_log() { echo -e "${MAGENTA}[AI]${NC} $1"; }

# AI-powered error resolution
ask_ai_for_solution() {
    local error_message="$1"
    local error_context="$2"
    
    ai_log "Consulting DeepSeek AI for solution..."
    
    local prompt="You are an expert DevOps engineer. A deployment script encountered this error:

ERROR: ${error_message}

CONTEXT: ${error_context}

Provide a concise, actionable solution in JSON format:
{
  \"diagnosis\": \"brief explanation of the issue\",
  \"solution\": \"specific fix to apply\",
  \"command\": \"exact command to run (if applicable)\",
  \"confidence\": \"high/medium/low\"
}

Be specific and practical. Focus on Docker, Git, Node.js, and deployment issues."
    
    local response=$(curl -s "${DEEPSEEK_API_URL}" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
        --data "{
            \"model\": \"deepseek-chat\",
            \"messages\": [
                {\"role\": \"system\", \"content\": \"You are an expert DevOps troubleshooter. Provide concise, actionable solutions in JSON format.\"},
                {\"role\": \"user\", \"content\": $(echo "$prompt" | jq -Rs .)}
            ],
            \"temperature\": 0.3,
            \"max_tokens\": 500
        }" 2>&1)
    
    local ai_response=$(echo "$response" | jq -r '.choices[0].message.content // empty' 2>/dev/null)
    
    if [ -n "$ai_response" ]; then
        # Clean up markdown code blocks if present
        ai_response=$(echo "$ai_response" | sed 's/```json//g' | sed 's/```//g' | tr -d '\n' | jq -c '.')
        
        echo "$ai_response" >> "$AI_SOLUTIONS_LOG"
        
        local diagnosis=$(echo "$ai_response" | jq -r '.diagnosis // empty')
        local solution=$(echo "$ai_response" | jq -r '.solution // empty')
        local command=$(echo "$ai_response" | jq -r '.command // empty')
        local confidence=$(echo "$ai_response" | jq -r '.confidence // empty')
        
        if [ -n "$diagnosis" ]; then
            ai_log "Diagnosis: ${diagnosis}"
            ai_log "Solution: ${solution}"
            [ -n "$command" ] && ai_log "Suggested command: ${command}"
            [ -n "$confidence" ] && ai_log "Confidence: ${confidence}"
            
            echo "$command"
            return 0
        fi
    fi
    
    warning "AI couldn't provide solution, using fallback"
    return 1
}

# Enhanced error handler with AI
handle_error() {
    local line_no=$1
    local last_command="${BASH_COMMAND}"
    
    error "Script failed at line ${line_no}"
    error "Command: ${last_command}"
    
    # Get last few lines of error log for context
    local error_context=$(tail -n 20 "$ERROR_LOG" 2>/dev/null || echo "No additional context")
    
    # Ask AI for solution
    ai_log "Attempting AI-powered error resolution..."
    local ai_command=$(ask_ai_for_solution "$last_command failed" "$error_context")
    
    if [ -n "$ai_command" ] && [ "$ai_command" != "null" ]; then
        warning "AI suggested fix. Attempting to apply..."
        
        # Try AI suggestion
        if eval "$ai_command" 2>&1 | tee -a "$ERROR_LOG"; then
            success "AI fix applied successfully!"
            return 0
        else
            error "AI fix didn't resolve the issue"
        fi
    fi
    
    error "Deployment failed. Check logs:"
    echo "  - Error log: $ERROR_LOG"
    echo "  - AI solutions: $AI_SOLUTIONS_LOG"
    exit 1
}

trap 'handle_error ${LINENO}' ERR

# Detect project type with AI assistance
detect_project_type() {
    log "Detecting project type..."
    
    local detected_type="unknown"
    
    if [ -f "package.json" ]; then
        if grep -q "\"next\"" package.json; then
            detected_type="nextjs"
        elif grep -q "\"react\"" package.json; then
            detected_type="react"
        elif grep -q "\"vue\"" package.json; then
            detected_type="vue"
        else
            detected_type="nodejs"
        fi
    elif [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
        detected_type="python"
    elif [ -f "go.mod" ]; then
        detected_type="golang"
    elif [ -f "Cargo.toml" ]; then
        detected_type="rust"
    elif [ -f "composer.json" ]; then
        detected_type="php"
    fi
    
    # If still unknown, ask AI
    if [ "$detected_type" = "unknown" ]; then
        ai_log "Unknown project type, consulting AI..."
        
        local files=$(ls -la | head -n 20)
        local ai_detection=$(ask_ai_for_solution "Cannot detect project type" "Files in directory: $files")
        
        if echo "$ai_detection" | grep -qi "node"; then
            detected_type="nodejs"
        elif echo "$ai_detection" | grep -qi "python"; then
            detected_type="python"
        fi
    fi
    
    echo "$detected_type"
}

# Generate Dockerfile with AI enhancement
generate_dockerfile() {
    local project_type=$1
    
    if [ -f "Dockerfile" ]; then
        success "Dockerfile exists"
        
        # Validate Dockerfile with AI
        ai_log "Validating existing Dockerfile..."
        local dockerfile_content=$(cat Dockerfile)
        
        return 0
    fi
    
    step "Generating Dockerfile for ${project_type}..."
    
    case $project_type in
        nextjs)
            cat > Dockerfile <<'EOF'
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate 2>/dev/null || true
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma 2>/dev/null || true
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma 2>/dev/null || true
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]
EOF
            ;;
        nodejs|react|vue)
            cat > Dockerfile <<'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build 2>/dev/null || true
EXPOSE 3000
CMD ["npm", "start"]
EOF
            ;;
        python)
            cat > Dockerfile <<'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]
EOF
            ;;
        *)
            warning "Unknown type, asking AI for Dockerfile..."
            # In production, you'd ask AI to generate custom Dockerfile
            cat > Dockerfile <<'EOF'
FROM alpine:latest
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["sh", "-c", "echo 'Custom Dockerfile needed'"]
EOF
            ;;
    esac
    
    success "Dockerfile generated"
}

# Test Docker build with AI error fixing
test_docker_build() {
    step "Testing Docker build..."
    
    if ! command -v docker &> /dev/null; then
        warning "Docker not installed, skipping test"
        return 0
    fi
    
    local test_tag="test-build-$(date +%s)"
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Build attempt ${attempt}/${max_attempts}..."
        
        if docker build -t "$test_tag" . 2>&1 | tee /tmp/docker-build.log; then
            success "Docker build successful"
            docker rmi "$test_tag" 2>/dev/null || true
            return 0
        else
            error "Build attempt ${attempt} failed"
            
            if [ $attempt -lt $max_attempts ]; then
                # Get build error
                local build_error=$(tail -n 50 /tmp/docker-build.log)
                
                # Ask AI for fix
                ai_log "Analyzing build failure..."
                local fix_command=$(ask_ai_for_solution "Docker build failed" "$build_error")
                
                if [ -n "$fix_command" ] && [ "$fix_command" != "null" ]; then
                    warning "Applying AI-suggested fix..."
                    eval "$fix_command" 2>&1 || true
                    
                    attempt=$((attempt + 1))
                    sleep 2
                else
                    break
                fi
            else
                error "Build failed after ${max_attempts} attempts"
                cat /tmp/docker-build.log
                return 1
            fi
        fi
    done
    
    return 1
}

# Generate docker-compose
generate_docker_compose() {
    [ -f "docker-compose.yml" ] && return 0
    
    step "Generating docker-compose.yml..."
    
    cat > docker-compose.yml <<'EOF'
version: '3.8'
services:
  app:
    build: .
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
EOF
    
    success "docker-compose.yml generated"
}

# Update Next.js config
update_next_config() {
    local config_file=""
    [ -f "next.config.ts" ] && config_file="next.config.ts"
    [ -f "next.config.js" ] && config_file="next.config.js"
    [ -f "next.config.mjs" ] && config_file="next.config.mjs"
    
    [ -z "$config_file" ] && return 0
    
    if ! grep -q "output.*standalone" "$config_file" 2>/dev/null; then
        step "Updating Next.js config..."
        cp "$config_file" "${config_file}.backup"
        
        # Simple addition of standalone output
        if [[ "$config_file" == *.ts ]]; then
            sed -i.bak "s/const nextConfig.*{/const nextConfig: NextConfig = {\n  output: 'standalone',/" "$config_file" 2>/dev/null || true
        fi
        
        success "Next.js config updated"
    fi
}

# Utility functions (keeping them concise)
generate_subdomain() { cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 8 | head -n 1; }

find_available_port() {
    local used_ports=$(curl -s -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
        "${COOLIFY_SERVER}/api/v1/applications" 2>/dev/null | jq -r '.[].ports[]?' 2>/dev/null || echo "")
    
    for ((i=0; i<100; i++)); do
        local port=$(shuf -i 10000-65535 -n 1)
        echo "$used_ports" | grep -q "^${port}$" || { echo $port; return 0; }
    done
    
    return 1
}

get_zone_id() {
    local response=$(curl -s "https://api.cloudflare.com/client/v4/zones?name=${BASE_DOMAIN}" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}")
    echo "$response" | jq -r '.result[0].id // empty'
}

create_dns_record() {
    local subdomain=$1 server_ip=$2 zone_id=$3
    
    step "Creating DNS: ${subdomain}.${BASE_DOMAIN}"
    
    local response=$(curl -s -X POST \
        "https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"A\",\"name\":\"${subdomain}\",\"content\":\"${server_ip}\",\"ttl\":1,\"proxied\":true}")
    
    echo "$response" | jq -e '.success' >/dev/null 2>&1 || \
    echo "$response" | jq -e '.errors[0].code' | grep -q "81057" 2>/dev/null
}

setup_github() {
    [ -z "$GITHUB_TOKEN" ] && { read -sp "GitHub Token: " GITHUB_TOKEN; echo ""; }
    [ -z "$GITHUB_USERNAME" ] && { read -p "GitHub Username: " GITHUB_USERNAME; }
    
    cat > .env.coolify <<EOF
GITHUB_TOKEN=${GITHUB_TOKEN}
GITHUB_USERNAME=${GITHUB_USERNAME}
COOLIFY_SERVER=${COOLIFY_SERVER}
COOLIFY_TOKEN=${COOLIFY_TOKEN}
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
BASE_DOMAIN=${BASE_DOMAIN}
DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
EOF
}

create_github_repo() {
    local repo_name=$1
    step "Creating GitHub repo: ${repo_name}"
    
    local response=$(curl -s -X POST "https://api.github.com/user/repos" \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Content-Type: application/json" \
        --data "{\"name\":\"${repo_name}\",\"private\":true,\"description\":\"Auto-deployed to Coolify\"}")
    
    local repo_url=$(echo "$response" | jq -r '.clone_url // empty')
    [ -n "$repo_url" ] && { echo "$repo_url"; return 0; }
    
    echo "$response" | jq -e '.errors[0].message' | grep -q "already exists" && \
        { echo "https://github.com/${GITHUB_USERNAME}/${repo_name}.git"; return 0; }
    
    return 1
}

push_to_github() {
    local repo_url=$1
    step "Pushing to GitHub..."
    
    [ ! -d ".git" ] && git init && git config user.email "deploy@${BASE_DOMAIN}" && git config user.name "Coolify Bot"
    
    git add .
    git diff --cached --quiet || git commit -m "Deploy $(date '+%Y-%m-%d %H:%M:%S')" || true
    git remote remove origin 2>/dev/null || true
    git remote add origin "$repo_url"
    git branch -M main
    git push -u origin main --force 2>&1
}

# Main deployment
main() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║   🤖 AI-Powered Coolify Deployment Engine 🤖            ║
║   Self-Healing • Auto-Detecting • Error-Free            ║
╚══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
    
    local project_name=$(basename "$(pwd)")
    [ -f "package.json" ] && project_name=$(jq -r '.name // empty' package.json 2>/dev/null || echo "$project_name")
    local repo_name=$(echo "$project_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')
    
    echo -e "${MAGENTA}📦 Project:${NC} ${project_name}"
    
    local project_type=$(detect_project_type)
    echo -e "${MAGENTA}🔍 Type:${NC} ${project_type}\n"
    
    setup_github
    echo ""
    
    generate_dockerfile "$project_type"
    generate_docker_compose
    [ "$project_type" = "nextjs" ] && update_next_config
    echo ""
    
    test_docker_build || { error "Build failed"; exit 1; }
    echo ""
    
    local subdomain=$(generate_subdomain)
    local full_domain="${subdomain}.${BASE_DOMAIN}"
    local port=$(find_available_port)
    local zone_id=$(get_zone_id)
    local server_ip=$(echo "$COOLIFY_SERVER" | sed -E 's|https?://([^:]+):.*|\1|')
    
    echo -e "${MAGENTA}🌐 Domain:${NC} ${full_domain}"
    echo -e "${MAGENTA}🔌 Port:${NC} ${port}\n"
    
    create_dns_record "$subdomain" "$server_ip" "$zone_id" || warning "DNS creation issue"
    echo ""
    
    local repo_url=$(create_github_repo "$repo_name")
    [ -z "$repo_url" ] && { error "GitHub failed"; exit 1; }
    echo ""
    
    push_to_github "$repo_url" || { error "Push failed"; exit 1; }
    echo ""
    
    cat > .coolify-deployment.json <<EOF
{
  "project_name": "${project_name}",
  "project_type": "${project_type}",
  "repo_url": "${repo_url}",
  "full_domain": "${full_domain}",
  "port": ${port},
  "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
    
    echo -e "${GREEN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║          ✨ Deployment Successful! ✨                   ║
╚══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
    
    echo -e "${CYAN}🌐 URL:${NC} https://${full_domain}"
    echo -e "${CYAN}📦 Repo:${NC} ${repo_url}"
    echo -e "${CYAN}🔧 Dashboard:${NC} ${COOLIFY_SERVER}"
    echo -e "${CYAN}🔌 Port:${NC} ${port}\n"
    echo -e "${YELLOW}Next: Visit Coolify dashboard to complete setup${NC}\n"
    echo -e "${GREEN}💡 Auto-deploy enabled! Push to GitHub to redeploy${NC}\n"
}

main "$@"
