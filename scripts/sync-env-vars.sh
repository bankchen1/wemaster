#!/bin/bash
# Environment Variables Synchronization Script
# Syncs environment variables between backend (wemaster-nest) and frontend (wemaster-core)

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paths
BACKEND_ENV="/Volumes/BankChen/wemaster/wemaster-nest/.env"
FRONTEND_ENV="/Volumes/BankChen/wemaster/wemaster-core/.env.local"
BACKUP_DIR="/Volumes/BankChen/wemaster/backups"

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Environment Variables Synchronization${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo

# Check if backend .env exists
if [ ! -f "$BACKEND_ENV" ]; then
  echo -e "${RED}❌ Error: Backend .env file not found at: $BACKEND_ENV${NC}"
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup existing frontend .env.local if exists
if [ -f "$FRONTEND_ENV" ]; then
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  cp "$FRONTEND_ENV" "$BACKUP_DIR/.env.local.backup.$TIMESTAMP"
  echo -e "${YELLOW}📦 Backed up existing .env.local to: $BACKUP_DIR/.env.local.backup.$TIMESTAMP${NC}"
fi

# Start creating new frontend .env.local
echo -e "${GREEN}🔄 Syncing environment variables...${NC}"
echo

# Create header
cat > "$FRONTEND_ENV" << 'EOF'
# Frontend Environment Variables
# Auto-synced from backend .env
# Generated at: TIMESTAMP
# ⚠️  Do NOT edit manually - run scripts/sync-env-vars.sh instead

EOF

sed -i "" "s/TIMESTAMP/$(date)/" "$FRONTEND_ENV"

# Extract and write variables
{
  echo "# ============================================================================"
  echo "# NEXT.JS PUBLIC VARIABLES (accessible in browser)"
  echo "# ============================================================================"
  echo
  grep "^NEXT_PUBLIC_" "$BACKEND_ENV" || echo "# No NEXT_PUBLIC_* variables found"
  echo

  echo "# ============================================================================"
  echo "# API URLS"
  echo "# ============================================================================"
  echo
  grep "^NEXT_PUBLIC_API_URL=" "$BACKEND_ENV" || echo "NEXT_PUBLIC_API_URL=http://localhost:3001"
  echo

  echo "# ============================================================================"
  echo "# TENANT ID"
  echo "# ============================================================================"
  echo
  grep "^NEXT_PUBLIC_TENANT_ID=" "$BACKEND_ENV" || echo "NEXT_PUBLIC_TENANT_ID=wemaster"
  echo

  echo "# ============================================================================"
  echo "# DATA SOURCE MODE"
  echo "# ============================================================================"
  echo
  echo "NEXT_PUBLIC_DATA_SOURCE=real  # Options: mock | real"
  echo

  echo "# ============================================================================"
  echo "# AUTHENTICATION (for Server Components only)"
  echo "# ============================================================================"
  echo
  echo "# JWT_SECRET is NOT exposed to browser (Server-side only)"
  grep "^JWT_SECRET=" "$BACKEND_ENV" || echo "# JWT_SECRET not found in backend .env"
  echo

  echo "# ============================================================================"
  echo "# DATABASE (for Server Actions only - NOT exposed to browser)"
  echo "# ============================================================================"
  echo
  grep "^DATABASE_URL=" "$BACKEND_ENV" || echo "# DATABASE_URL not found in backend .env"
  echo

} >> "$FRONTEND_ENV"

echo -e "${GREEN}✅ Environment variables synced successfully!${NC}"
echo
echo -e "${YELLOW}📋 Summary:${NC}"
echo -e "  - Source: ${BACKEND_ENV}"
echo -e "  - Target: ${FRONTEND_ENV}"
echo -e "  - Backup: ${BACKUP_DIR}/"
echo
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo -e "  1. NEXT_PUBLIC_* variables are exposed to the browser"
echo -e "  2. Other variables are only accessible in Server Components/Actions"
echo -e "  3. Restart your Next.js dev server for changes to take effect"
echo
echo -e "${GREEN}🚀 To apply changes:${NC}"
echo -e "  cd /Volumes/BankChen/wemaster/wemaster-core"
echo -e "  npm run dev"
echo
