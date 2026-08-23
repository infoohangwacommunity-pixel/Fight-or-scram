# Stage 01 Research Report

## Executive Summary

This report documents the research conducted for **WaxPrep Stage 01 — Project Foundation**. The goal of Stage 01 is to establish a professional, secure, and consistent repository foundation before any application code is written.

**Research Date:** 2026-08-23  
**Repository:** `infoohangwacommunity-pixel/Fight-or-scram`  
**Project Name:** WaxPrep

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

### Recommendation: **Node.js 22.x**

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
- **Example**:
```javascript
const express = require('express');
module.exports = { hello };
```

### ESM (ECMAScript Modules)

- **Module system**: JavaScript standard (TC39)
- **Syntax**: `import` and `export`
- **Loading**: Asynchronous, static analysis at parse time
- **Features**: Tree-shaking, static analysis, better tooling
- **Example**:
```javascript
import express from 'express';
export { hello };
```

### `"type": "module"` in `package.json`

This field tells Node.js to treat all `.js` files as ESM instead of CommonJS. Without it, `.js` files default to CommonJS.

### Why WaxPrep Uses ESM Only

1. **Modern standard**: ESM is the future of JavaScript modules
2. **Better tree-shaking**: Unused exports are removed in production
3. **Static analysis**: Tools can analyze imports at build time
4. **Async loading**: Better performance for large applications
5. **Consistency**: All modern frameworks (Next.js, Vite, etc.) use ESM
6. **No `require()` confusion**: Clear module system throughout codebase

### ESM Configuration

```json
{
  "type": "module",
  "main": "src/index.js"
}
```

---

## 3. Environment Variables and Secret Management

### How `process.env` Works

Node.js exposes environment variables through `process.env`, which is a plain object:

```javascript
console.log(process.env.MY_VAR); // Returns string or undefined
```

Environment variables are:
- Set in the operating system or shell
- Available to the Node.js process and its children
- Not stored in the code itself
- Can be changed without modifying code

### The `dotenv` Package

`dotenv` (version 16.x+) reads `.env` files and populates `process.env`:

```javascript
import dotenv from 'dotenv';
dotenv.config(); // Loads .env into process.env
```

**Why use dotenv:**
- Local development convenience
- No need to set environment variables manually
- Different `.env` files for different environments (`.env.development`, `.env.test`)

### Why Secrets Must NEVER Go in Code or GitHub

**Security risks:**
- **Public exposure**: Anyone can view public repositories
- **Automated scraping**: Bots scan GitHub for leaked secrets
- **Insider threats**: Anyone with repo access can steal secrets
- **CI/CD exposure**: Secrets in code can leak through logs
- **Compliance violations**: GDPR, HIPAA, PCI-DSS all forbid this

**Best practices:**
1. Never commit `.env` files
2. Never commit files containing real secrets
3. Use `.env.example` as a template (no real values)
4. Rotate any accidentally leaked secrets immediately

### `.env.example` vs `.env`

| `.env.example` | `.env` |
|----------------|--------|
| ✅ Committed to GitHub | ❌ Never committed |
| ✅ Template with variable names | ✅ Local file with real values |
| ✅ No real values (use placeholders) | ✅ Contains actual secrets |
| ✅ Shows required variables | ✅ Ignored by git |
| ✅ Helps new developers | ✅ Private to developer |

**Example `.env.example`:**
```
# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=your_token_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

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

**Without fail fast:**
```
App starts → User sends message → Error: "WHATSAPP_ACCESS_TOKEN is undefined"
(Cryptic error 10 steps later)
```

**With fail fast:**
```
App starts → Error: "WHATSAPP_ACCESS_TOKEN is required"
(Clear error at startup)
```

### Zod Library

**Zod** is a TypeScript-first validation library that also works in JavaScript:
- **Schema validation**: Define what data should look like
- **Runtime validation**: Check actual values against schemas
- **Clear error messages**: Tells you exactly what's wrong
- **Type inference**: Works with TypeScript for type safety

### How Zod Validates Environment Variables

```javascript
import { z } from 'zod';

const envSchema = z.object({
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment variables:');
  console.error(result.error.format());
  process.exit(1);
}

const env = result.data;
```

### What Happens Without Validation

1. **Silent failures**: App starts but features don't work
2. **Cryptic errors**: "Cannot read property 'token' of undefined"
3. **Hard to debug**: Error occurs far from the root cause
4. **Production issues**: Users see errors, not developers
5. **Wasted time**: Debugging production issues instead of building features

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

**Plain text log (bad for production):**
```
2024-01-15 10:30:45 INFO Starting application on port 3000
```

**Structured log (good for production):**
```json
{"level":30,"time":"2024-01-15T10:30:45.123Z","pid":1234,"msg":"Starting application on port 3000"}
```

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

### Why `console.log` Is Not Suitable

1. **No level**: Can't distinguish between info and error
2. **No timestamp**: Hard to correlate events
3. **No structure**: Plain text, hard to parse
4. **No metadata**: Can't add process ID, request ID, etc.
5. **Performance**: Slower than structured logging
6. **Not production-ready**: Log aggregators can't parse it

### Pino Configuration Example

```javascript
import pino from 'pino';

const logger = pino({
  level: 'info', // Only log info and above
  transport: {
    target: 'pino-pretty', // Pretty print in development
  }
});

logger.info('Application starting');
logger.error('Failed to connect to database', { error: 'connection refused' });
```

---

## Stage 01 Implementation Plan

### Recommended Node.js Version

**Pin to: `22.x`** (specifically `22.0.0` or later)

**Reasons:**
- Latest Active LTS (supported until April 2027)
- Full ESM support
- Best performance
- Modern JavaScript features
- Team consistency

### ESM Configuration

**`package.json`:**
```json
{
  "name": "waxprep",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

### Environment Variables for Stage 01

Based on the requirements, Stage 01 needs:

1. **`WHATSAPP_ACCESS_TOKEN`** - Required for WhatsApp integration
2. **`PORT`** - Optional, defaults to `3000`
3. **`NODE_ENV`** - Optional, defaults to `development`

### Startup Validation Flow

1. App starts → `src/config/env.js` imports first
2. `env.js` validates all required variables using Zod
3. If validation fails → crash with clear error message
4. If validation passes → export validated config
5. `src/index.js` imports config → app can start safely

### Pino Logging Configuration

**`src/config/logger.js`:**
```javascript
import pino from 'pino';

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

export default logger;
```

### Files to Create/Modify

#### New Files:

1. **`.nvmrc`** - Contains `22`
2. **`.gitignore`** - Contains `.env`, `.env.local`, etc.
3. **`.env.example`** - Template with placeholder values
4. **`package.json`** - ESM config, dependencies, scripts
5. **`src/config/env.js`** - Environment validation with Zod
6. **`src/config/logger.js`** - Pino logger instance
7. **`src/index.js`** - Entry point

#### Dependencies to Install:

- `zod` - Environment validation
- `pino` - Structured logging
- `pino-pretty` - Pretty print logs in development
- `dotenv` - Load `.env` files

---

## Conflicts and Clarifications Needed

### 1. Repository Name

**Current:** `Fight-or-scram`  
**Project name:** `WaxPrep`

**Question:** Should we rename the repository to `WaxPrep` for consistency, or keep `Fight-or-scram`?

### 2. Project Structure

The Stage 01 spec shows:

```
waxprep/
├── src/
│   ├── config/
│   │   ├── env.js
│   │   └── logger.js
│   └── index.js
```

**Question:** Should the root folder be named `waxprep` or should we create a `waxprep` subfolder in the repository?

### 3. Dependencies

The spec mentions `dotenv` but doesn't specify if it should be used in Stage 01.

**Recommendation:** Use `dotenv` to load `.env` files, but only if `.env` exists (don't crash if `.env` is missing).

### 4. Pino Transport

The spec mentions `pino` but doesn't specify the transport configuration.

**Recommendation:** Use `pino-pretty` for development (human-readable), but configure it to output JSON in production.

### 5. Entry Point Behavior

The spec says:

> "If all variables are present, the app starts and logs a clean JSON message"

**Question:** Should the app just log and exit, or should it start a server (even if empty)?

**Recommendation:** For Stage 01, just log and exit. Server creation is Stage 02.

---

## Summary

### What I Learned

| Topic | Key Insight |
|-------|-------------|
| **Node.js LTS** | Node 22 is Active LTS, use `.nvmrc` for team consistency |
| **ESM vs CJS** | ESM is the modern standard, use `"type": "module"` |
| **Secrets** | Never commit `.env`, always use `.env.example` template |
| **Validation** | Fail fast with Zod to catch config errors at startup |
| **Logging** | Use Pino for structured JSON logs, never `console.log` |

### Files to Create

1. `.nvmrc` - Node version pinning
2. `.gitignore` - Security (exclude `.env`)
3. `.env.example` - Template for developers
4. `package.json` - Project configuration
5. `src/config/env.js` - Environment validation
6. `src/config/logger.js` - Logger instance
7. `src/index.js` - Entry point

### Dependencies

- `zod` (v3.x) - Validation
- `pino` (v9.x) - Logging
- `pino-pretty` - Development logging
- `dotenv` (v16.x) - Environment loading

---

## Next Steps

1. **Review this report** and confirm all research is accurate
2. **Answer the clarification questions** (repository name, project structure, etc.)
3. **Approve the implementation plan**
4. **I will then create all files and push to GitHub**

---

*This report was generated as part of the WaxPrep Stage 01 research phase. All information is based on current best practices for Node.js development as of 2026-08-23.*
