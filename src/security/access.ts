// src/security/access.ts

export type AccessLevel = 'ADMIN' | 'LIDER' | 'SERVIDOR' | null;

const ACCESS_KEYS: Record<string, AccessLevel> = {
  // Administradores
  'Ca2026Luna': 'ADMIN',
  'Ca2026Juan': 'ADMIN',
  'Ca2026Adonis': 'ADMIN',
  'Ca2026Jose': 'ADMIN',

  // Líder
  'Ca2026Lider': 'LIDER',

  // Servidor (solo lectura)
  'CaServidor': 'SERVIDOR',
};

/**
 * Valida una clave y retorna el nivel de acceso
 */
export function validateAccessKey(key: string): AccessLevel {
  return ACCESS_KEYS[key] ?? null;
}

/**
 * Verifica permisos según nivel
 */
export function hasPermission(
  level: AccessLevel,
  required: AccessLevel
): boolean {
  const hierarchy: AccessLevel[] = ['SERVIDOR', 'LIDER', 'ADMIN'];

  if (!level || !required) return false;

  return hierarchy.indexOf(level) >= hierarchy.indexOf(required);
}
