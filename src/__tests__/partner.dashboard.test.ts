import { describe, it, expect } from 'vitest';
import {
  PARTNER_DASHBOARD,
  PARTNER_SECTIONS,
  resolveDashboard,
  generateDashboardSnapshot,
  verifyDashboardSnapshot,
  evaluateFromSnapshot,
  validateTenantIsolation
} from '../index.js';
import type { ResolutionContext, DashboardSnapshot } from '../types/dashboard.types.js';

function createFullContext(partnerId: string, tenantId?: string): ResolutionContext {
  return {
    partnerId,
    tenantId,
    permissions: [
      'partner:overview:read',
      'tenants:read',
      'pricing:read',
      'incentives:read',
      'feature-flags:read',
      'branding:read',
      'audit:read',
      'ai:read',
      'integrations:read'
    ],
    entitlements: ['whitelabel-access'],
    featureFlags: ['incentives-enabled', 'ai-features-enabled'],
    timestamp: Date.now()
  };
}

function createLimitedContext(partnerId: string): ResolutionContext {
  return {
    partnerId,
    permissions: ['partner:overview:read', 'tenants:read'],
    entitlements: [],
    featureFlags: [],
    timestamp: Date.now()
  };
}

describe('Partner Dashboard Declarations', () => {
  it('should have exactly 9 sections defined', () => {
    expect(PARTNER_SECTIONS).toHaveLength(9);
  });

  it('should have all required sections', () => {
    const sectionIds = PARTNER_SECTIONS.map(s => s.id);
    expect(sectionIds).toContain('partner-overview');
    expect(sectionIds).toContain('tenants-management');
    expect(sectionIds).toContain('pricing-plans');
    expect(sectionIds).toContain('incentives-affiliates');
    expect(sectionIds).toContain('feature-flags');
    expect(sectionIds).toContain('branding-whitelabel');
    expect(sectionIds).toContain('audit-activity');
    expect(sectionIds).toContain('ai-automation');
    expect(sectionIds).toContain('support-integrations');
  });

  it('should have sections ordered correctly', () => {
    const orders = PARTNER_SECTIONS.map(s => s.order);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should have valid gating for each section', () => {
    for (const section of PARTNER_SECTIONS) {
      expect(section.gating).toBeDefined();
      expect(section.gating.permissions).toBeDefined();
      expect(Array.isArray(section.gating.permissions)).toBe(true);
      expect(section.gating.permissions.length).toBeGreaterThan(0);
    }
  });

  it('should be serializable (no functions or side effects)', () => {
    const serialized = JSON.stringify(PARTNER_DASHBOARD);
    const deserialized = JSON.parse(serialized);
    expect(deserialized.id).toBe(PARTNER_DASHBOARD.id);
    expect(deserialized.sections).toHaveLength(9);
  });
});

describe('Visibility Gating', () => {
  it('should hide section if permission is missing', () => {
    const context: ResolutionContext = {
      partnerId: 'partner-1',
      permissions: [],
      entitlements: [],
      featureFlags: [],
      timestamp: Date.now()
    };

    const resolved = resolveDashboard(PARTNER_DASHBOARD, context);
    const overviewSection = resolved.sections.find(s => s.id === 'partner-overview');

    expect(overviewSection?.visible).toBe(false);
    expect(overviewSection?.gatingResult.permissionsMissing).toContain('partner:overview:read');
  });

  it('should hide section if entitlement is missing', () => {
    const context: ResolutionContext = {
      partnerId: 'partner-1',
      permissions: ['branding:read'],
      entitlements: [],
      featureFlags: [],
      timestamp: Date.now()
    };

    const resolved = resolveDashboard(PARTNER_DASHBOARD, context);
    const brandingSection = resolved.sections.find(s => s.id === 'branding-whitelabel');

    expect(brandingSection?.visible).toBe(false);
    expect(brandingSection?.gatingResult.entitlementsMissing).toContain('whitelabel-access');
  });

  it('should hide section if feature flag is disabled', () => {
    const context: ResolutionContext = {
      partnerId: 'partner-1',
      permissions: ['incentives:read'],
      entitlements: [],
      featureFlags: [],
      timestamp: Date.now()
    };

    const resolved = resolveDashboard(PARTNER_DASHBOARD, context);
    const incentivesSection = resolved.sections.find(s => s.id === 'incentives-affiliates');

    expect(incentivesSection?.visible).toBe(false);
    expect(incentivesSection?.gatingResult.featureFlagsMissing).toContain('incentives-enabled');
  });

  it('should show section when all gating requirements are met', () => {
    const context = createFullContext('partner-1');
    const resolved = resolveDashboard(PARTNER_DASHBOARD, context);

    for (const section of resolved.sections) {
      expect(section.visible).toBe(true);
    }
  });
});

describe('Snapshot Integrity', () => {
  it('should generate a valid snapshot', () => {
    const context = createFullContext('partner-1');
    const resolved = resolveDashboard(PARTNER_DASHBOARD, context);
    const snapshot = generateDashboardSnapshot(resolved);

    expect(snapshot.id).toContain('snapshot_');
    expect(snapshot.dashboardId).toBe(PARTNER_DASHBOARD.id);
    expect(snapshot.signature).toMatch(/^sig_[a-f0-9]+$/);
    expect(snapshot.createdAt).toBeLessThanOrEqual(Date.now());
    expect(snapshot.expiresAt).toBeGreaterThan(snapshot.createdAt);
  });

  it('should verify a valid snapshot successfully', () => {
    const context = createFullContext('partner-1');
    const resolved = resolveDashboard(PARTNER_DASHBOARD, context);
    const snapshot = generateDashboardSnapshot(resolved);

    const verification = verifyDashboardSnapshot(snapshot);

    expect(verification.valid).toBe(true);
    expect(verification.expired).toBe(false);
    expect(verification.tampered).toBe(false);
  });

  it('should reject a tampered snapshot', () => {
    const context = createFullContext('partner-1');
    const resolved = resolveDashboard(PARTNER_DASHBOARD, context);
    const snapshot = generateDashboardSnapshot(resolved);

    const tamperedSnapshot: DashboardSnapshot = {
      ...snapshot,
      resolved: {
        ...snapshot.resolved,
        sections: snapshot.resolved.sections.map(s => ({
          ...s,
          name: s.name + ' TAMPERED'
        }))
      }
    };

    const verification = verifyDashboardSnapshot(tamperedSnapshot);

    expect(verification.valid).toBe(false);
    expect(verification.tampered).toBe(true);
  });

  it('should reject an expired snapshot', () => {
    const context = createFullContext('partner-1');
    const resolved = resolveDashboard(PARTNER_DASHBOARD, context);
    const snapshot = generateDashboardSnapshot(resolved, 1);

    const expiredSnapshot: DashboardSnapshot = {
      ...snapshot,
      expiresAt: Date.now() - 1000
    };

    const verification = verifyDashboardSnapshot(expiredSnapshot);

    expect(verification.valid).toBe(false);
    expect(verification.expired).toBe(true);
  });
});

describe('Determinism', () => {
  it('should produce identical results for same inputs (10x test)', () => {
    const context = createFullContext('partner-1');
    const results: string[] = [];

    for (let i = 0; i < 10; i++) {
      const resolved = resolveDashboard(PARTNER_DASHBOARD, context);
      const serialized = JSON.stringify({
        id: resolved.id,
        sections: resolved.sections.map(s => ({
          id: s.id,
          visible: s.visible,
          gatingResult: s.gatingResult
        }))
      });
      results.push(serialized);
    }

    const first = results[0];
    for (const result of results) {
      expect(result).toBe(first);
    }
  });
});

describe('Tenant Isolation', () => {
  it('should throw error for cross-partner context', () => {
    const context1: ResolutionContext = {
      partnerId: 'partner-1',
      tenantId: 'tenant-a',
      permissions: [],
      entitlements: [],
      featureFlags: [],
      timestamp: Date.now()
    };

    const context2: ResolutionContext = {
      partnerId: 'partner-2',
      tenantId: 'tenant-a',
      permissions: [],
      entitlements: [],
      featureFlags: [],
      timestamp: Date.now()
    };

    expect(() => validateTenantIsolation(context1, context2)).toThrow(
      'Cross-partner context access is not allowed'
    );
  });

  it('should throw error for cross-tenant context', () => {
    const context1: ResolutionContext = {
      partnerId: 'partner-1',
      tenantId: 'tenant-a',
      permissions: [],
      entitlements: [],
      featureFlags: [],
      timestamp: Date.now()
    };

    const context2: ResolutionContext = {
      partnerId: 'partner-1',
      tenantId: 'tenant-b',
      permissions: [],
      entitlements: [],
      featureFlags: [],
      timestamp: Date.now()
    };

    expect(() => validateTenantIsolation(context1, context2)).toThrow(
      'Cross-tenant context access is not allowed'
    );
  });
});

describe('Partner dashboard resolves deterministically with correct gating, snapshot integrity, and offline equivalence', () => {
  it('should prove online resolution, snapshot generation, verification, offline evaluation, and identical results', () => {
    const context = createFullContext('partner-1');

    const onlineResolved = resolveDashboard(PARTNER_DASHBOARD, context);
    expect(onlineResolved.sections).toHaveLength(9);

    const snapshot = generateDashboardSnapshot(onlineResolved);
    expect(snapshot.signature).toBeDefined();

    const verification = verifyDashboardSnapshot(snapshot);
    expect(verification.valid).toBe(true);
    expect(verification.expired).toBe(false);
    expect(verification.tampered).toBe(false);

    const offlineResult = evaluateFromSnapshot(snapshot);
    expect(offlineResult.sections).toHaveLength(9);

    const onlineVisibleIds = onlineResolved.sections
      .filter(s => s.visible)
      .map(s => s.id)
      .sort();

    const offlineVisibleIds = offlineResult.visibleSections
      .map(s => s.id)
      .sort();

    expect(onlineVisibleIds).toEqual(offlineVisibleIds);

    for (let i = 0; i < onlineResolved.sections.length; i++) {
      const online = onlineResolved.sections[i];
      const offline = offlineResult.sections[i];

      expect(online.id).toBe(offline.id);
      expect(online.visible).toBe(offline.visible);
      expect(online.gatingResult).toEqual(offline.gatingResult);
    }
  });

  it('should maintain gating equivalence between online and offline for limited context', () => {
    const context = createLimitedContext('partner-1');

    const onlineResolved = resolveDashboard(PARTNER_DASHBOARD, context);
    const snapshot = generateDashboardSnapshot(onlineResolved);
    const verification = verifyDashboardSnapshot(snapshot);
    expect(verification.valid).toBe(true);

    const offlineResult = evaluateFromSnapshot(snapshot);

    expect(offlineResult.visibleSections).toHaveLength(2);
    expect(offlineResult.hiddenSections).toHaveLength(7);

    const visibleIds = offlineResult.visibleSections.map(s => s.id);
    expect(visibleIds).toContain('partner-overview');
    expect(visibleIds).toContain('tenants-management');
  });
});
