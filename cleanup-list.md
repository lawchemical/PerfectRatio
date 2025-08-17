# Repository Cleanup Plan

## Files to DELETE (unnecessary/duplicate):

### Root Server Files (keep only server-production.js)
- [ ] admin-server-only.js
- [ ] auth-endpoints.js  
- [ ] import-endpoints-enhanced.js
- [ ] migrate-to-postgres.js
- [ ] server-endpoints-complete.js
- [ ] server-enhanced.js
- [ ] server-sqlite.js
- [ ] server-supabase.js
- [ ] server-two-projects.js
- [ ] server-with-init.js
- [ ] server.js
- [ ] setup-admin-password.js
- [ ] setup-admin.js
- [ ] vessels-api-endpoints.js

### Test Files
- [ ] test-connection.js
- [ ] test-login.html
- [ ] test-railway-connection.swift
- [ ] generate-api-key.js

### Public Folder - Admin HTML duplicates (keep only admin-ios-style.html)
- [ ] admin-complete.html
- [ ] admin-login.html
- [ ] admin-restored.html
- [ ] admin.html

### Public Folder - Admin JS duplicates (keep the working versions)
- [ ] admin-app-backup.js
- [ ] admin-app.js
- [ ] admin-bases.js (keep admin-bases-complete.js)
- [ ] admin-oils-simple.js (keep admin-oils-complete.js)
- [ ] admin-oils.js (keep admin-oils-complete.js)
- [ ] admin-enhanced.js
- [ ] admin-import.js
- [ ] admin-import-enhanced.js
- [ ] admin-import-complete.js

### Backup/Migration folders
- [ ] supabase-migration/ (entire folder if migration is complete)

### Security Files (should already be in .gitignore)
- [ ] SECURE_RAILWAY_ENV.txt
- [ ] NEW_RAILWAY_ENV.txt
- [ ] RAILWAY_ENV_VARS.txt

## Files to KEEP:

### Root Directory
- server-production.js (admin panel server)
- package.json
- package-lock.json
- .gitignore
- railway-backend/ (entire folder for iOS cache)

### Public Folder
- admin-ios-style.html (main admin HTML)
- admin-core.js
- admin-suppliers.js
- admin-bases-complete.js
- admin-oils-complete.js
- admin-vessels.js
- admin-styles-enhanced.css
- index.html (if exists)

### iOS App Files
- /PerfectRatio/Formulator/ (all iOS app files)

### Railway Backend
- railway-backend/ (entire folder with its own package.json)