import type {
  DashboardDeclaration,
  DashboardSection,
  DashboardSnapshot,
  EvaluationResult,
  GatingResult,
  ResolutionContext,
  ResolvedDashboard,
  ResolvedSection,
  SnapshotVerificationResult
} from '../types/dashboard.types.js';

function evaluateGating(
  section: DashboardSection,
  context: ResolutionContext
): GatingResult {
  const permissionsMatched = section.gating.permissions.filter(
    p => context.permissions.includes(p)
  );
  const permissionsMissing = section.gating.permissions.filter(
    p => !context.permissions.includes(p)
  );

  const requiredEntitlements = section.gating.entitlements ?? [];
  const entitlementsMatched = requiredEntitlements.filter(
    e => context.entitlements.includes(e)
  );
  const entitlementsMissing = requiredEntitlements.filter(
    e => !context.entitlements.includes(e)
  );

  const requiredFeatureFlags = section.gating.featureFlags ?? [];
  const featureFlagsMatched = requiredFeatureFlags.filter(
    f => context.featureFlags.includes(f)
  );
  const featureFlagsMissing = requiredFeatureFlags.filter(
    f => !context.featureFlags.includes(f)
  );

  return {
    permissionsMatched,
    permissionsMissing,
    entitlementsMatched,
    entitlementsMissing,
    featureFlagsMatched,
    featureFlagsMissing
  };
}

function resolveSection(
  section: DashboardSection,
  context: ResolutionContext
): ResolvedSection {
  const gatingResult = evaluateGating(section, context);

  const visible =
    gatingResult.permissionsMissing.length === 0 &&
    gatingResult.entitlementsMissing.length === 0 &&
    gatingResult.featureFlagsMissing.length === 0;

  return {
    id: section.id,
    name: section.name,
    description: section.description,
    order: section.order,
    visible,
    gatingResult
  };
}

export function resolveDashboard(
  declaration: DashboardDeclaration,
  context: ResolutionContext
): ResolvedDashboard {
  if (!context.partnerId) {
    throw new Error('Partner ID is required in resolution context');
  }

  const resolvedSections = declaration.sections.map(section =>
    resolveSection(section, context)
  );

  return {
    id: declaration.id,
    name: declaration.name,
    version: declaration.version,
    scope: declaration.scope,
    sections: resolvedSections,
    context,
    resolvedAt: Date.now()
  };
}

function createSignature(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `sig_${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

export function generateDashboardSnapshot(
  resolved: ResolvedDashboard,
  expirationMs: number = 3600000
): DashboardSnapshot {
  const now = Date.now();
  const snapshotData = JSON.stringify({
    dashboardId: resolved.id,
    version: resolved.version,
    sections: resolved.sections,
    context: resolved.context,
    createdAt: now
  });

  return {
    id: `snapshot_${resolved.id}_${now}`,
    dashboardId: resolved.id,
    version: resolved.version,
    resolved,
    signature: createSignature(snapshotData),
    createdAt: now,
    expiresAt: now + expirationMs
  };
}

export function verifyDashboardSnapshot(
  snapshot: DashboardSnapshot
): SnapshotVerificationResult {
  const now = Date.now();

  if (now > snapshot.expiresAt) {
    return {
      valid: false,
      expired: true,
      tampered: false,
      error: 'Snapshot has expired'
    };
  }

  const expectedData = JSON.stringify({
    dashboardId: snapshot.resolved.id,
    version: snapshot.resolved.version,
    sections: snapshot.resolved.sections,
    context: snapshot.resolved.context,
    createdAt: snapshot.createdAt
  });

  const expectedSignature = createSignature(expectedData);

  if (snapshot.signature !== expectedSignature) {
    return {
      valid: false,
      expired: false,
      tampered: true,
      error: 'Snapshot signature verification failed - data may have been tampered'
    };
  }

  return {
    valid: true,
    expired: false,
    tampered: false
  };
}

export function evaluateFromSnapshot(
  snapshot: DashboardSnapshot
): EvaluationResult {
  const verification = verifyDashboardSnapshot(snapshot);

  if (!verification.valid) {
    throw new Error(verification.error ?? 'Invalid snapshot');
  }

  const sections = snapshot.resolved.sections;
  const visibleSections = sections.filter(s => s.visible);
  const hiddenSections = sections.filter(s => !s.visible);

  return {
    sections,
    visibleSections,
    hiddenSections,
    evaluatedAt: Date.now()
  };
}

export function validateTenantIsolation(
  context1: ResolutionContext,
  context2: ResolutionContext
): void {
  if (context1.partnerId !== context2.partnerId) {
    throw new Error('Cross-partner context access is not allowed');
  }
  if (context1.tenantId && context2.tenantId && context1.tenantId !== context2.tenantId) {
    throw new Error('Cross-tenant context access is not allowed');
  }
}
