import type { AuditEvent, UserRole } from "@/lib/types";

export function createAuditEvent(
  role: UserRole,
  action: string,
  entity: string,
  details: string,
): AuditEvent {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    actorRole: role,
    action,
    entity,
    details,
  };
}

export const roleLabels: Record<UserRole, string> = {
  analyst: "Аналитик",
  manager: "Менеджер",
  auditor: "Аудитор",
};
