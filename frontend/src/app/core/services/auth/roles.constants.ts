/**
 * Roles do realm "blue-fox-global-group" (blue-fox-iam/realm-config/realm-export.json).
 * Mantenha em sincronia com backend/src/modules/auth/roles.constants.ts.
 */
export const KeycloakRole = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  FINANCE_ADMIN: 'ROLE_FINANCE_ADMIN',
  FINANCE_USER: 'ROLE_FINANCE_USER',
} as const;

export type KeycloakRole = (typeof KeycloakRole)[keyof typeof KeycloakRole];

/** Qualquer usuário com acesso à plataforma financeira. */
export const FINANCE_ACCESS_ROLES: KeycloakRole[] = [
  KeycloakRole.ADMIN,
  KeycloakRole.FINANCE_ADMIN,
  KeycloakRole.FINANCE_USER,
];
