# Stage 01 Research Report

**Status:** ✅ Implemented  
**Date:** 2026-08-23  
**Repository:** `infoohangwacommunity-pixel/Fight-or-scram`

---

## Executive Summary

This report documents the research conducted for **WaxPrep Stage 01 — Project Foundation**. The goal of Stage 01 is to establish a professional, secure, and consistent repository foundation before any application code is written.

**Implementation Status:** Complete - All files created and pushed to GitHub.

---

## 1. Node.js LTS and Version Pinning

### What is LTS?

**LTS (Long Term Support)** is Node.js's release schedule that designates certain versions as stable and receiving long-term support. Node.js follows a six-month release cycle with two types of releases:

- **LTS versions**: Receive bug fixes, security patches, and stability improvements for ~30 months
- **Current versions**: Receive new features but only ~6 months of support

### Active LTS (as of 2026-08-23)

Based on Node.js release schedule:
- **Node.js 22.x (Hydrogen)** - Active LTS (released October 2024)
- **Node.js 20.x (Iron)** - Maintenance LTS (released April 2023)
- **Node.js 18.x** - End of Life (April 2025)

### Recommendation: **Node.js 22.x** ✅ IMPLEMENTED

**Why Node 22:**
- Latest Active LTS with full modern JavaScript features
- Better performance than Node 20
- Full support for modern ESM features
- Long support window until April 2027
- Best compatibility with modern packages

### `.nvmrc` Purpose

The `.nvmrc` file is a simple text file containing a Node.js version string (e.g., `22`). It allows:

- **Automatic version switching**: `nvm use` reads this file and switches to the correct Node version
- **Team consistency**: Every developer uses the exact same Node version
- **CI/CD reliability**: Build servers automatically use the correct version
- **Prevents "works on my machine" issues**

### `engines` Field in `package.json`

```json
{
  "engines": {
    "node": ">=22.0.0"
  }
}
```

This field:
- Documents required Node version for users
- Can trigger warnings with `npm install --engine-strict`
- Helps package managers understand compatibility
- Is a best practice for all Node.js projects

---

## 2. ESM vs CommonJS

### CommonJS (CJS)

- **Module system**: Node.js's original module system
- **Syntax**: `require()` and `module.exports`
- **Loading**: Synchronous, static resolution at runtime
- **Use case**: Legacy Node.js code, many npm packages

### ESM (ECMAScript Modules)

- **Module system**: JavaScript standard (TC39)
- **Syntax**: `import` and `export`
- **Loading**: Asynchronous, static analysis at parse time
- **Features**: Tree-shaking, static analysis, better tooling

### `"type": "module"` in `package.json`

This field tells Node.js to treat all `.js` files as ESM instead of CommonJS. Without it, `.js` files default to CommonJS.

### Why WaxPrep Uses ESM Only ✅ IMPLEMENTED

1. **Modern standard**: ESM is the future of JavaScript modules
2. **Better tree-shaking**: Unused exports are removed in production
3. **Static analysis**: Tools can analyze imports at build time
4. **Async loading**: Better performance for large applications
5. **Consistency**: All modern frameworks (Next.js, Vite, etc.) use ESM
6. **No `require()` confusion**: Clear module system throughout codebase

---

## 3. Environment Variables and Secret Management

### How `process.env` Works

Node.js exposes environment variables through `process.env`, which is a plain object.

### The `dotenv` Package

`dotenv` (version 16.x+) reads `.env` files and populates `process.env`.

### Why Secrets Must NEVER Go in Code or GitHub

**Security risks:**
- **Public exposure**: Anyone can view public repositories
- **Automated scraping**: Bots scan GitHub for leaked secrets
- **Insider threats**: Anyone with repo access can steal secrets
- **CI/CD exposure**: Secrets in code can leak through logs
- **Compliance violations**: GDPR, HIPAA, PCI-DSS all forbid this

### `.env.example` vs `.env`

| `.env.example` | `.env` |
|----------------|--------|
| ✅ Committed to GitHub | ❌ Never committed |
| ✅ Template with variable names | ✅ Local file with real values |
| ✅ No real values (use placeholders) | ✅ Contains actual secrets |
| ✅ Shows required variables | ✅ Ignored by git |
| ✅ Helps new developers | ✅ Private to developer |

### `.gitignore` Purpose

`.gitignore` tells Git which files to ignore:

```
# Ignore environment files
.env
.env.local
.env.*.local
```

**Why `.env` must be in `.gitignore`:**
- Prevents accidental commits of secrets
- Each developer has their own `.env`
- Different values for different environments
- Security best practice

---

## 4. Startup Validation with Zod

### "Fail Fast" Concept

**Fail fast** means: detect and report errors immediately at startup, rather than letting the app run with bad configuration and crash later with confusing errors.

### Zod Library

**Zod** is a TypeScript-first validation library that also works in JavaScript:
- **Schema validation**: Define what data should look like
- **Runtime validation**: Check actual values against schemas
- **Clear error messages**: Tells you exactly what's wrong
- **Type inference**: Works with TypeScript for type safety

### How Zod Validates Environment Variables ✅ IMPLEMENTED

```javascript
const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
  // ... all 14 variables
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:');
  console.error(result.error.format());
  process.exit(1);
}
```

### Validation Benefits

- **Clear error messages**: "WHATSAPP_ACCESS_TOKEN is required"
- **Immediate feedback**: Developer knows immediately what's wrong
- **Type safety**: Numbers are converted, enums are validated
- **Default values**: Reasonable defaults for optional variables
- **Documentation**: Schema shows what variables are needed

---

## 5. Structured Logging with Pino

### What is Structured Logging?

**Structured logging** means logs are machine-readable objects (usually JSON) rather than plain text strings.

### Why JSON Logs Are Better

1. **Machine parsing**: Log aggregators (Datadog, Splunk, CloudWatch) can parse JSON automatically
2. **Structured queries**: Query logs by field (e.g., `level:error AND user_id:123`)
3. **Consistent format**: No parsing errors from different log formats
4. **Rich metadata**: Easy to add timestamps, process IDs, request IDs
5. **Performance**: JSON serialization is faster than string concatenation
6. **Searchability**: Better indexing in log systems

### Pino Library

**Pino** is a fast, structured logging library for Node.js:
- **Fastest**: Benchmarks show it's 2-3x faster than alternatives
- **Structured**: Always outputs JSON
- **Low overhead**: Minimal performance impact
- **Transport support**: Can send logs to different destinations
- **Child loggers**: Create loggers with pre-set context

### Log Levels

Pino defines these log levels (from lowest to highest severity):

| Level | Number | Use Case |
|-------|--------|----------|
| `trace` | 10 | Very detailed debugging (development only) |
| `debug` | 20 | Detailed debugging information |
| `info` | 30 | General informational messages |
| `warn` | 40 | Warning messages (something unusual but not critical) |
| `error` | 50 | Error messages (something failed but app continues) |
| `fatal` | 60 | Fatal errors (app must crash) |

### Pino Configuration ✅ IMPLEMENTED

```javascript
const logger = pino({
  level: env.LOG_LEVEL,
  transport: 
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
});
```

**Key decision:** Use `NODE_ENV` to decide transport:
- **Development:** Human-readable with colors via `pino-pretty`
- **Production:** Raw JSON for log aggregators

---

## Implementation Decisions

### 1. Repository Name
**Decision:** Keep as `Fight-or-scram` (not renamed to `waxprep`)

**Reason:** The repository was already created with this name and has commits. Renaming would break existing references. The project name `WaxPrep` is used in the codebase, but the repository name remains `Fight-or-scram`.

### 2. Project Structure
**Decision:** Root of the repository IS the project - no subfolder

**Structure:**
```
Fight-or-scram/
├── src/
│   ├── config/
│   │   ├── env.js
│   │   └── logger.js
│   └── index.js
├── .env.example
├── .gitignore
├── .nvmrc
└── package.json
```

### 3. dotenv Usage
**Decision:** Use `dotenv` at the top of `src/index.js`

**Implementation:**
```javascript
import './config/env.js'; // Loads dotenv and validates env first
```

**Behavior:** If `.env` doesn't exist, `dotenv` handles this quietly on its own.

### 4. Pino Transport
**Decision:** Use `NODE_ENV` to decide transport

**Implementation:**
- **Development:** `pino-pretty` with colors and human-readable format
- **Production:** Raw JSON output (no transport)

### 5. Entry Point Behavior
**Decision:** Just log and exit, no server yet

**Implementation:**
```javascript
logger.info('WaxPrep booting — environment valid');
process.exit(0);
```

**Reason:** Stage 02 will create the server. Stage 01 proves the foundation works.

### 6. Environment Variables
**Decision:** Define ALL variables for the final system, not just Stage 01 needs

**Total:** 14 environment variables across 6 categories:
- Application (3)
- WhatsApp (5)
- Database (1)
- Cache/Queue (1)
- AI (2)
- Security (1)

**Reason:** This is the contract document for the whole project. All variables must be validated at startup.

---

## Files Created

| File | Purpose |
|------|---------|
| `.nvmrc` | Node.js version pinning (v22) |
| `.gitignore` | Security - excludes `.env` files from git |
| `.env.example` | Template with ALL project variables (no real values) |
| `package.json` | ESM config, dependencies, scripts, engines field |
| `src/config/env.js` | Zod validation for all environment variables |
| `src/config/logger.js` | Pino structured logging with NODE_ENV-based transport |
| `src/index.js` | Entry point - loads dotenv, validates env, logs startup message |

## Dependencies Installed

| Package | Version | Purpose |
|---------|---------|---------|
| `dotenv` | ^16.4.7 | Load `.env` files |
| `pino` | ^9.6.0 | Structured JSON logging |
| `pino-pretty` | ^13.0.0 | Human-readable logs in development |
| `zod` | ^3.24.2 | Runtime environment validation |

---

## Verification

### How to Test

1. **Clone and install:**
```bash
git clone https://github.com/infoohangwacommunity-pixel/Fight-or-scram.git
cd Fight-or-scram
nvm use
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with placeholder values
```

3. **Run the application:**
```bash
npm start
```

**Expected output:**
```
{"level":30,"time":"2026-08-23T22:12:34.123Z","pid":1234,"msg":"WaxPrep booting — environment valid"}
```

4. **Test validation (remove a required variable):**
```bash
# Remove WHATSAPP_PHONE_NUMBER_ID from .env
npm start
```

**Expected output:**
```
❌ Invalid environment variables:

Please ensure your .env file contains all required variables:

Copy .env.example to .env and fill in the values:
  cp .env.example .env

Validation errors:
{
  "WHATSAPP_PHONE_NUMBER_ID": {
    "_errors": ["Required"]
  },
  ...
}
```

---

## Summary

### What I Learned

| Topic | Key Insight |
|-------|-------------|
| **Node.js LTS** | Node 22 is Active LTS, use `.nvmrc` for team consistency |
| **ESM vs CJS** | ESM is the modern standard, use `"type": "module"` |
| **Secrets** | Never commit `.env`, always use `.env.example` template |
| **Validation** | Fail fast with Zod to catch config errors at startup |
| **Logging** | Use Pino for structured JSON logs, NODE_ENV-based transport |

### Implementation Status

✅ **All Stage 01 requirements completed:**
- Node.js 22 pinned via `.nvmrc` and `engines` field
- ESM configured with `"type": "module"`
- All 14 environment variables defined and validated
- Pino logger with NODE_ENV-based transport
- Fail-fast validation with clear error messages
- `.env` excluded from git, `.env.example` committed
- Clean JSON startup message logged

### Next Stage: Stage 02 - The Application Server

Stage 02 will create the HTTP server that receives all WhatsApp messages:
- Fastify server with plugin system
- Security headers with Helmet
- Graceful shutdown handling
- Health check endpoints (`/health/live`, `/health/ready`)
- Correlation IDs for request tracing

---

## Git Commit

**Commit SHA:** `d58e6362f963d50cdcc122f6803bb52d27488b63`  
**Message:** `feat: Implement Stage 01 - Project foundation with Node.js 22, ESM, env validation, and structured logging`  
**URL:** https://github.com/infoohangwacommunity-pixel/Fight-or-scram/commit/d58e6362f963d50cdcc122f6803bb52d27488b63

---

*Stage 01 complete. Ready for Stage 02.*
