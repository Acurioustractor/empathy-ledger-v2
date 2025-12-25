#!/bin/bash

# Claude Skills Menu - Interactive Skill Selection
# Quick way to discover and invoke Claude skills

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}           ${CYAN}Claude Skills Menu - Empathy Ledger v2${NC}          ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print category header
print_category() {
    echo -e "\n${YELLOW}═══ $1 ═══${NC}\n"
}

# Function to print skill option
print_skill() {
    local number=$1
    local name=$2
    local description=$3
    printf "${GREEN}%2d${NC}) ${CYAN}%-30s${NC} %s\n" "$number" "$name" "$description"
}

print_category "🏗️  Architecture & Codebase"
print_skill 1 "codebase-explorer" "Navigate and understand codebase architecture"
print_skill 2 "empathy-ledger-codebase" "Best practices for code quality and architecture"

print_category "🗄️  Database & Data"
print_skill 3 "supabase" "Database tables, relationships, query patterns"
print_skill 4 "supabase-sql-manager" "Execute SQL queries and manage database"
print_skill 5 "database-navigator" "Multi-tenant database schema navigation"
print_skill 6 "data-analysis" "AI-powered analysis for themes and insights"

print_category "🎨  Design & Components"
print_skill 7 "design-component" "Design storyteller cards and UI components"

print_category "🔐  Security & Compliance"
print_skill 8 "cultural-review" "Cultural sensitivity and Indigenous data sovereignty"
print_skill 9 "gdpr-compliance" "GDPR and data privacy compliance"

print_category "🚀  Deployment & DevOps"
print_skill 10 "deployment-workflow" "Deploy to GitHub and Vercel (+ run script)"

print_category "📊  Analytics & Reporting"
print_skill 11 "storyteller-analytics" "Analytics and insights from storyteller data"

print_category "🔗  Integrations"
print_skill 12 "gohighlevel-oauth" "GoHighLevel OAuth integration"

print_category "✍️  Content & Stories"
print_skill 13 "story-craft" "Story creation, editing, and curation"

print_category "📖  Documentation & Help"
print_skill 14 "skills-registry" "View complete skills registry (SKILLS_REGISTRY.md)"
print_skill 15 "deployment-docs" "View deployment documentation"

print_category "🛠️  Quick Actions"
print_skill 16 "run-deploy-script" "Run deployment script (./scripts/deploy.sh)"
print_skill 17 "create-icons" "Generate app icons (./scripts/create-icons.sh)"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Prompt for selection
read -p "$(echo -e ${CYAN}Enter skill number [1-17] or ${YELLOW}q${CYAN} to quit: ${NC})" choice

case $choice in
    1)
        echo -e "\n${GREEN}📘 Opening codebase-explorer skill...${NC}\n"
        if [ -f ".claude/skills/codebase-explorer/SKILL.md" ]; then
            cat .claude/skills/codebase-explorer/SKILL.md | less
        else
            echo "Skill file not found. Navigate to: .claude/skills/codebase-explorer/"
        fi
        ;;
    2)
        echo -e "\n${GREEN}📘 Opening empathy-ledger-codebase skill...${NC}\n"
        if [ -f ".claude/skills/empathy-ledger-codebase/skill.md" ]; then
            cat .claude/skills/empathy-ledger-codebase/skill.md | less
        else
            echo "Skill file not found. Navigate to: .claude/skills/empathy-ledger-codebase/"
        fi
        ;;
    3)
        echo -e "\n${GREEN}📘 Opening supabase skill...${NC}\n"
        if [ -f ".claude/skills/supabase/SKILL.md" ]; then
            cat .claude/skills/supabase/SKILL.md | less
        else
            echo "Skill file not found. Navigate to: .claude/skills/supabase/"
        fi
        ;;
    4)
        echo -e "\n${GREEN}📘 Opening supabase-sql-manager skill...${NC}\n"
        if [ -f ".claude/skills/supabase-sql-manager/skill.md" ]; then
            cat .claude/skills/supabase-sql-manager/skill.md | less
        else
            echo "Skill file not found. Navigate to: .claude/skills/supabase-sql-manager/"
        fi
        ;;
    5)
        echo -e "\n${GREEN}📘 Opening database-navigator skill...${NC}\n"
        if [ -f ".claude/skills/database-navigator.md" ]; then
            cat .claude/skills/database-navigator.md | less
        else
            echo "Skill file not found."
        fi
        ;;
    6)
        echo -e "\n${GREEN}📘 Opening data-analysis skill...${NC}\n"
        if [ -d ".claude/skills/data-analysis" ]; then
            ls -la .claude/skills/data-analysis/
            echo ""
            echo "Navigate to: .claude/skills/data-analysis/"
        else
            echo "Skill directory not found."
        fi
        ;;
    7)
        echo -e "\n${GREEN}📘 Opening design-component skill...${NC}\n"
        if [ -f ".claude/skills/design-component/SKILL.md" ]; then
            cat .claude/skills/design-component/SKILL.md | less
        else
            echo "Skill file not found. Navigate to: .claude/skills/design-component/"
        fi
        ;;
    8)
        echo -e "\n${GREEN}📘 Opening cultural-review skill...${NC}\n"
        if [ -f ".claude/skills/cultural-review/SKILL.md" ]; then
            cat .claude/skills/cultural-review/SKILL.md | less
        else
            echo "Skill file not found. Navigate to: .claude/skills/cultural-review/"
        fi
        ;;
    9)
        echo -e "\n${GREEN}📘 Opening gdpr-compliance skill...${NC}\n"
        if [ -f ".claude/skills/gdpr-compliance/SKILL.md" ]; then
            cat .claude/skills/gdpr-compliance/SKILL.md | less
        else
            echo "Skill file not found. Navigate to: .claude/skills/gdpr-compliance/"
        fi
        ;;
    10)
        echo -e "\n${GREEN}🚀 Deployment Workflow${NC}\n"
        echo "Choose an option:"
        echo "  1) View deployment skill documentation"
        echo "  2) Run deployment script (./scripts/deploy.sh)"
        echo ""
        read -p "Enter choice [1-2]: " deploy_choice

        if [ "$deploy_choice" = "1" ]; then
            cat .claude/skills/deployment-workflow/skill.md | less
        elif [ "$deploy_choice" = "2" ]; then
            echo ""
            ./scripts/deploy.sh
        fi
        ;;
    11)
        echo -e "\n${GREEN}📘 Opening storyteller-analytics skill...${NC}\n"
        if [ -f ".claude/skills/storyteller-analytics.md" ]; then
            cat .claude/skills/storyteller-analytics.md | less
        else
            echo "Skill file not found."
        fi
        ;;
    12)
        echo -e "\n${GREEN}📘 Opening gohighlevel-oauth skill...${NC}\n"
        if [ -f ".claude/skills/gohighlevel-oauth/skill.md" ]; then
            cat .claude/skills/gohighlevel-oauth/skill.md | less
        else
            echo "Skill file not found. Navigate to: .claude/skills/gohighlevel-oauth/"
        fi
        ;;
    13)
        echo -e "\n${GREEN}📘 Opening story-craft skill...${NC}\n"
        if [ -d ".claude/skills/story-craft" ]; then
            ls -la .claude/skills/story-craft/
            echo ""
            echo "Navigate to: .claude/skills/story-craft/"
        else
            echo "Skill directory not found."
        fi
        ;;
    14)
        echo -e "\n${GREEN}📚 Opening Skills Registry...${NC}\n"
        if [ -f ".claude/SKILLS_REGISTRY.md" ]; then
            cat .claude/SKILLS_REGISTRY.md | less
        else
            echo "Skills registry not found."
        fi
        ;;
    15)
        echo -e "\n${GREEN}📖 Opening Deployment Documentation...${NC}\n"
        echo "Choose a document:"
        echo "  1) DEPLOYMENT_READY.md - Complete deployment system"
        echo "  2) READY_TO_DEPLOY.md - Deployment checklist"
        echo "  3) DEPLOY_TO_PHONE.md - Mobile deployment guide"
        echo ""
        read -p "Enter choice [1-3]: " doc_choice

        case $doc_choice in
            1) cat DEPLOYMENT_READY.md | less ;;
            2) cat READY_TO_DEPLOY.md | less ;;
            3) cat DEPLOY_TO_PHONE.md | less ;;
            *) echo "Invalid choice" ;;
        esac
        ;;
    16)
        echo -e "\n${GREEN}🚀 Running Deployment Script...${NC}\n"
        ./scripts/deploy.sh
        ;;
    17)
        echo -e "\n${GREEN}🎨 Running Icon Generation Script...${NC}\n"
        ./scripts/create-icons.sh
        ;;
    [qQ])
        echo -e "\n${CYAN}Goodbye!${NC}\n"
        exit 0
        ;;
    *)
        echo -e "\n${YELLOW}Invalid choice. Please select a number between 1-17 or 'q' to quit.${NC}\n"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Tip: You can also invoke skills by asking Claude naturally:${NC}"
echo -e "${YELLOW}  \"I need to deploy to production\"${NC}"
echo -e "${YELLOW}  \"Show me the database schema\"${NC}"
echo -e "${YELLOW}  \"Design a storyteller card\"${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""
