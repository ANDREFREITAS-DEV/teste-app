// src/core/eventBus.js
const listeners = new Map();

export function on(event, callback) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(callback);
}

export function emit(event, payload) {
  if (!listeners.has(event)) return;
  for (const cb of listeners.get(event)) {
    cb(payload);
  }
}
