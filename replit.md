# WebWaka Partner Dashboard

## Overview
Phase 4C of the WebWaka Modular Rebuild - Partner Dashboard declarative consumer of Core Dashboard Control Engine.

**Status:** Implementation complete  
**Phase:** 4C  
**Type:** TypeScript headless library (no UI)

## Project Structure
```
├── src/
│   ├── index.ts                     # Main exports
│   ├── types/
│   │   └── dashboard.types.ts       # Type definitions
│   ├── dashboards/
│   │   ├── partner.dashboard.ts     # Root dashboard declaration
│   │   └── partner.sections.ts      # 9 section declarations
│   ├── resolution/
│   │   └── resolution.contract.ts   # Phase 4A resolution consumption
│   └── __tests__/
│       └── partner.dashboard.test.ts # All required tests
├── dist/                            # Compiled output
├── module.manifest.json             # Module metadata & capabilities
├── tsconfig.json                    # TypeScript configuration
└── vitest.config.ts                 # Test configuration
```

## Partner Dashboard Sections
| # | Section | Permissions | Entitlements | Feature Flags |
|---|---------|-------------|--------------|---------------|
| 1 | Partner Overview | partner:overview:read | - | - |
| 2 | Tenants Management | tenants:read | - | - |
| 3 | Pricing & Plans | pricing:read | - | - |
| 4 | Incentives & Affiliates | incentives:read | - | incentives-enabled |
| 5 | Feature Flags | feature-flags:read | - | - |
| 6 | Branding / Whitelabel | branding:read | whitelabel-access | - |
| 7 | Audit & Activity | audit:read | - | - |
| 8 | AI & Automation | ai:read | - | ai-features-enabled |
| 9 | Support & Integrations | integrations:read | - | - |

## Capabilities
- `dashboard:partner.resolve`
- `dashboard:partner.snapshot.generate`
- `dashboard:partner.snapshot.verify`

## Commands
- `npm run build` - Compile TypeScript
- `npm test` - Run all tests

## Dependencies
- TypeScript (dev)
- Vitest (dev, testing)

## Phase 4A Resolution Contract
This module consumes:
- `resolveDashboard(declaration, context)`
- `generateDashboardSnapshot(resolved)`
- `verifyDashboardSnapshot(snapshot)`
- `evaluateFromSnapshot(snapshot)`

## Test Coverage
- Visibility Gating (permissions, entitlements, feature flags)
- Snapshot Integrity (generation, verification, tamper detection, expiration)
- Determinism (10x identical output test)
- Tenant Isolation (cross-partner/tenant error handling)
- Offline Equivalence (online vs snapshot evaluation)
