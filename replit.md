# Project Overview

This is a React application that was originally built in Replit Agent and is being migrated to the standard Replit environment. The project uses Express.js as a backend server and React with Vite as the frontend.

## Current State
- ✅ Node.js and npm packages are installed
- ✅ Project structure is in place with client/server separation
- ⚠️ The "Start Game" workflow is running successfully on port 5000
- ❌ The "Start application" workflow is failing due to tsx not being found

## Project Architecture
- **Backend**: Express.js server (TypeScript) running on port 5000
- **Frontend**: React with Vite, TypeScript, and Tailwind CSS
- **3D Graphics**: Three.js for particle effects
- **UI Components**: Radix UI components with shadcn/ui
- **Database**: Drizzle ORM with PostgreSQL support
- **Authentication**: Passport.js with express-session

## Recent Changes
- 2025-01-30: Started migration from Replit Agent to standard Replit environment
- Created progress tracker for migration checklist
- 2025-01-30: Enhanced loading system for YC demo presentation
  - Fixed progress calculation bugs (111% issue)
  - Implemented production-ready video loading (metadata only)
  - Added localStorage caching for faster reloads
  - Optimized for deployment reliability
  - Made loading progress completely honest - only advances when assets actually load
  - Fixed DOMException issues with CORS and video loading

## Migration Progress
Currently working through `.local/state/replit/agent/progress_tracker.md` checklist.

## User Preferences
- Critical YC Combinator demo website - maintain high quality at all times
- DO NOT change core functionality - only enhance loading system
- Videos and assets must load completely before page appears
- Will use this platform for deployment (not Vercel/Netlify)

## Dependencies
The project has all necessary dependencies installed including React, Three.js, Express, and development tools.