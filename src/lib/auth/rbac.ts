export type UserRole = "super_admin" | "admin" | "student";

/**
 * Permission definitions for role-based access control
 */
export const ROLE_PERMISSIONS = {
  super_admin: [
    "users:read",
    "users:write",
    "users:delete",
    "exams:read",
    "exams:write",
    "exams:delete",
    "exams:publish",
    "questions:read",
    "questions:write",
    "questions:delete",
    "questions:import",
    "attempts:read",
    "attempts:grade",
    "proctoring:read",
    "proctoring:configure",
    "reports:read",
    "reports:export",
    "settings:read",
    "settings:write",
    "monitoring:read",
    "audit:read",
  ],
  admin: [
    "users:read",
    "exams:read",
    "exams:write",
    "exams:publish",
    "questions:read",
    "questions:write",
    "questions:import",
    "attempts:read",
    "attempts:grade",
    "proctoring:read",
    "reports:read",
    "reports:export",
    "monitoring:read",
  ],
  student: [
    "exams:read",
    "attempts:read",
    "attempts:write",
    "profile:read",
    "profile:write",
  ],
} as const;

export type Permission =
  (typeof ROLE_PERMISSIONS)[keyof typeof ROLE_PERMISSIONS][number];

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] as readonly string[];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: string[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a role is admin-level (admin or super_admin)
 */
export function isAdminRole(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

/**
 * Protected route mappings
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/admin": ["super_admin", "admin"],
  "/student": ["student"],
};

/**
 * Get the default redirect path for a role
 */
export function getDefaultRedirect(role: UserRole): string {
  switch (role) {
    case "super_admin":
    case "admin":
      return "/admin/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      return "/login";
  }
}
