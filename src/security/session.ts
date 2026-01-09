// src/security/session.ts

import { AccessLevel } from './access';

const STORAGE_KEY = 'ca_access_level';

/**
 * Guarda el nivel de acceso en el navegador
 */
export function setSessionAccess(level: AccessLevel) {
  if (level) {
    localStorage.setItem(STORAGE_KEY, level);
  }
}

/**
 * Obtiene el nivel de acceso guardado
 */
export function getSessionAccess(): AccessLevel {
  return localStorage.getItem(STORAGE_KEY) as AccessLevel;
}

/**
 * Cierra la sesión (borra acceso)
 */
export function clearSessionAccess() {
  localStorage.removeItem(STORAGE_KEY);
}

