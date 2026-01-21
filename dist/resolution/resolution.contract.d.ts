import type { DashboardDeclaration, DashboardSnapshot, EvaluationResult, ResolutionContext, ResolvedDashboard, SnapshotVerificationResult } from '../types/dashboard.types.js';
export declare function resolveDashboard(declaration: DashboardDeclaration, context: ResolutionContext): ResolvedDashboard;
export declare function generateDashboardSnapshot(resolved: ResolvedDashboard, expirationMs?: number): DashboardSnapshot;
export declare function verifyDashboardSnapshot(snapshot: DashboardSnapshot): SnapshotVerificationResult;
export declare function evaluateFromSnapshot(snapshot: DashboardSnapshot): EvaluationResult;
export declare function validateTenantIsolation(context1: ResolutionContext, context2: ResolutionContext): void;
//# sourceMappingURL=resolution.contract.d.ts.map