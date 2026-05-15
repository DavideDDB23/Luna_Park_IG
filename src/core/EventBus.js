const listeners = new Map();

export const EventBus = {
  on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => listeners.get(event).delete(handler);
  },

  once(event, handler) {
    const unsub = EventBus.on(event, (...args) => { handler(...args); unsub(); });
    return unsub;
  },

  emit(event, payload) {
    listeners.get(event)?.forEach(h => h(payload));
  },
};
