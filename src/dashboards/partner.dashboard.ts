import type { DashboardDeclaration } from '../types/dashboard.types.js';
import { PARTNER_SECTIONS } from './partner.sections.js';

export const PARTNER_DASHBOARD: DashboardDeclaration = {
  id: 'partner-dashboard',
  name: 'Partner Dashboard',
  version: '1.0.0',
  scope: 'partner',
  sections: PARTNER_SECTIONS,
  metadata: {
    createdAt: '2026-01-20T00:00:00.000Z',
    author: 'WebWaka Team',
    description: 'Partner Dashboard - Phase 4C declarative consumer of Core Dashboard Control Engine'
  }
} as const;
