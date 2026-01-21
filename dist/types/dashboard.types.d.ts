export interface Permission {
    readonly id: string;
    readonly resource: string;
    readonly action: string;
}
export interface Entitlement {
    readonly id: string;
    readonly description: string;
}
export interface FeatureFlag {
    readonly id: string;
    readonly description: string;
}
export interface GatingRequirements {
    readonly permissions: readonly string[];
    readonly entitlements?: readonly string[];
    readonly featureFlags?: readonly string[];
}
export interface DashboardSection {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly order: number;
    readonly gating: GatingRequirements;
}
export interface DashboardDeclaration {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly scope: 'partner' | 'superadmin' | 'tenant';
    readonly sections: readonly DashboardSection[];
    readonly metadata: DashboardMetadata;
}
export interface DashboardMetadata {
    readonly createdAt: string;
    readonly author: string;
    readonly description: string;
}
export interface ResolutionContext {
    readonly partnerId: string;
    readonly tenantId?: string;
    readonly permissions: readonly string[];
    readonly entitlements: readonly string[];
    readonly featureFlags: readonly string[];
    readonly timestamp: number;
}
export interface ResolvedSection {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly order: number;
    readonly visible: boolean;
    readonly gatingResult: GatingResult;
}
export interface GatingResult {
    readonly permissionsMatched: readonly string[];
    readonly permissionsMissing: readonly string[];
    readonly entitlementsMatched: readonly string[];
    readonly entitlementsMissing: readonly string[];
    readonly featureFlagsMatched: readonly string[];
    readonly featureFlagsMissing: readonly string[];
}
export interface ResolvedDashboard {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly scope: 'partner' | 'superadmin' | 'tenant';
    readonly sections: readonly ResolvedSection[];
    readonly context: ResolutionContext;
    readonly resolvedAt: number;
}
export interface DashboardSnapshot {
    readonly id: string;
    readonly dashboardId: string;
    readonly version: string;
    readonly resolved: ResolvedDashboard;
    readonly signature: string;
    readonly createdAt: number;
    readonly expiresAt: number;
}
export interface SnapshotVerificationResult {
    readonly valid: boolean;
    readonly expired: boolean;
    readonly tampered: boolean;
    readonly error?: string;
}
export interface EvaluationResult {
    readonly sections: readonly ResolvedSection[];
    readonly visibleSections: readonly ResolvedSection[];
    readonly hiddenSections: readonly ResolvedSection[];
    readonly evaluatedAt: number;
}
//# sourceMappingURL=dashboard.types.d.ts.map