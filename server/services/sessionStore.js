import crypto from "node:crypto";

const SESSION_TTL_MS = Number(process.env.RESULT_SESSION_TTL_MS || 60 * 60 * 1000);
const captchaSessions = new Map();
const portalSessions = new Map();

function cleanup() {
  const now = Date.now();
  for (const [id, s] of captchaSessions.entries()) {
    if (s.expiresAt <= now) captchaSessions.delete(id);
  }
  for (const [id, s] of portalSessions.entries()) {
    if (s.expiresAt <= now) portalSessions.delete(id);
  }
}

export function createSession(session) {
  cleanup();
  const sessionId = crypto.randomUUID();
  captchaSessions.set(sessionId, {
    ...session,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionId;
}

export function getSession(sessionId) {
  cleanup();
  return captchaSessions.get(sessionId) || null;
}

export function deleteSession(sessionId) {
  captchaSessions.delete(sessionId);
}

export function createPortalSession({ jar, semesters, formDetails }) {
  cleanup();
  const portalSessionId = crypto.randomUUID();
  portalSessions.set(portalSessionId, {
    jar,
    semesters,
    formDetails,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return portalSessionId;
}

export function getPortalSession(portalSessionId) {
  cleanup();
  return portalSessions.get(portalSessionId) || null;
}

export function deletePortalSession(portalSessionId) {
  portalSessions.delete(portalSessionId);
}

export function getPortalSessionsMap() {
  return portalSessions;
}
