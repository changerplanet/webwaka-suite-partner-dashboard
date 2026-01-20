import type { DashboardSection } from '../types/dashboard.types.js';

export const PARTNER_SECTIONS: readonly DashboardSection[] = [
  {
    id: 'partner-overview',
    name: 'Partner Overview',
    description: 'Overview of partner account, metrics, and status',
    order: 1,
    gating: {
      permissions: ['partner:overview:read'],
      entitlements: [],
      featureFlags: []
    }
  },
  {
    id: 'tenants-management',
    name: 'Tenants Management',
    description: 'Manage and view tenant accounts under this partner',
    order: 2,
    gating: {
      permissions: ['tenants:read'],
      entitlements: [],
      featureFlags: []
    }
  },
  {
    id: 'pricing-plans',
    name: 'Pricing & Plans',
    description: 'View pricing tiers and plan configurations',
    order: 3,
    gating: {
      permissions: ['pricing:read'],
      entitlements: [],
      featureFlags: []
    }
  },
  {
    id: 'incentives-affiliates',
    name: 'Incentives & Affiliates',
    description: 'Affiliate programs and incentive structures',
    order: 4,
    gating: {
      permissions: ['incentives:read'],
      entitlements: [],
      featureFlags: ['incentives-enabled']
    }
  },
  {
    id: 'feature-flags',
    name: 'Feature Flags',
    description: 'View feature flag configurations',
    order: 5,
    gating: {
      permissions: ['feature-flags:read'],
      entitlements: [],
      featureFlags: []
    }
  },
  {
    id: 'branding-whitelabel',
    name: 'Branding / Whitelabel',
    description: 'Branding customization and whitelabel settings',
    order: 6,
    gating: {
      permissions: ['branding:read'],
      entitlements: ['whitelabel-access'],
      featureFlags: []
    }
  },
  {
    id: 'audit-activity',
    name: 'Audit & Activity',
    description: 'Audit logs and activity tracking',
    order: 7,
    gating: {
      permissions: ['audit:read'],
      entitlements: [],
      featureFlags: []
    }
  },
  {
    id: 'ai-automation',
    name: 'AI & Automation',
    description: 'AI features and automation configurations',
    order: 8,
    gating: {
      permissions: ['ai:read'],
      entitlements: [],
      featureFlags: ['ai-features-enabled']
    }
  },
  {
    id: 'support-integrations',
    name: 'Support & Integrations',
    description: 'Support tools and third-party integrations',
    order: 9,
    gating: {
      permissions: ['integrations:read'],
      entitlements: [],
      featureFlags: []
    }
  }
] as const;
