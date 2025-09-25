# EuroTopo Quiz - Claude Development Guide

## 🚀 Deployment & Branch Strategy

### GitHub Branch Strategy
- **`staging`**: Default development branch - all new features go here first
- **`main`**: Production branch - only push when explicitly requested

### Railway Deployment Setup

#### 1. Current Production Service
- **URL**: https://eurotopo-quiz-production.up.railway.app
- **Branch**: `main` (production)
- **Status**: Active

#### 2. Create Staging Environment
To set up staging deployment in Railway:

1. **Create New Service**:
   - Go to Railway dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `skydam/eurotopo-quiz`
   - Choose `staging` branch
   - Name it: `eurotopo-quiz-staging`

2. **Configure Staging Service**:
   - Use same settings as production
   - Different domain (will be auto-generated)
   - Same environment variables

3. **Expected URLs**:
   - **Production**: https://eurotopo-quiz-production.up.railway.app (main branch)
   - **Staging**: https://eurotopo-quiz-staging.up.railway.app (staging branch)

### 🔄 Development Workflow

#### For Claude Code Assistant:
1. **Default Branch**: Always work on `staging` branch
2. **All Changes**: Push to `staging` first for testing
3. **Production Deploy**: Only when user explicitly requests "push to main" or "deploy to production"
4. **After Production**: IMMEDIATELY switch back to `staging` branch

#### Commands for Claude:
```bash
# Default - work on staging
git checkout staging
git push origin staging

# Only when explicitly requested by user
git checkout main
git merge staging
git push origin main
git checkout staging  # IMMEDIATELY switch back
```

## 📋 Current Features

### ✅ Completed Features
- [x] Interactive European capitals quiz
- [x] Bilingual support (English/Dutch)
- [x] Accurate map positioning with 28 calibration points
- [x] Animated pulsing markers for current cities
- [x] Rolling score graph (last 20 questions)
- [x] Celebration video at 15 consecutive correct answers
- [x] Streak counter display (X/15)
- [x] Skip functionality with tracking
- [x] Real-time feedback and statistics

### 🎯 Technical Stack
- **Framework**: Next.js 15.5.4 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Deployment**: Railway
- **Maps**: Custom calibrated coordinate system

### 📊 Data & Content
- **Total Cities**: 46 European capitals
- **Curriculum**: Filtered for 11-year-old education level
- **Languages**: English/Dutch translations
- **Map**: Accurate pixel positioning with 0px precision

## 🛠 Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start           # Start production server

# Git workflow (for Claude)
git checkout staging              # Switch to staging
git add .                        # Stage changes
git commit -m "Description"      # Commit changes
git push origin staging          # Push to staging

# Production (only when explicitly requested)
git checkout main && git merge staging && git push origin main && git checkout staging
```

## ⚠️ Important Notes for Claude

1. **Never push to main** unless user explicitly requests production deployment
2. **Always work on staging branch** by default
3. **After production push**, immediately switch back to staging
4. **Test features on staging** before production
5. **Rolling score graph** shows performance of last 20 questions
6. **Celebration video** triggers at 15 consecutive correct answers
7. **Streak counter** resets on incorrect/skip, tracks progress to 15

## 🎮 User Experience Features

- **Visual Learning**: Map-based geography learning
- **Progress Tracking**: Rolling score percentage
- **Motivation**: Celebration video for achievement streaks
- **Accessibility**: Bilingual interface with easy language switching
- **Responsive**: Works on all devices
- **Real-time Feedback**: Immediate answer validation

---
*This document is maintained by Claude Code Assistant for consistent development workflow.*