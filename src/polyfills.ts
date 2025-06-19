// Polyfills for Cloudflare Workers environment

// MessageChannel polyfill
if (typeof MessageChannel === 'undefined') {
  (globalThis as any).MessageChannel = class MessageChannel {
    port1: MessagePort;
    port2: MessagePort;

    constructor() {
      this.port1 = {
        postMessage: () => {},
        close: () => {},
        onmessage: null,
        onmessageerror: null,
        start: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
      } as MessagePort;
      
      this.port2 = {
        postMessage: () => {},
        close: () => {},
        onmessage: null,
        onmessageerror: null,
        start: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
      } as MessagePort;
    }
  };
}

// MessagePort polyfill
if (typeof MessagePort === 'undefined') {
  (globalThis as any).MessagePort = class MessagePort {
    onmessage: ((this: MessagePort, ev: MessageEvent) => any) | null = null;
    onmessageerror: ((this: MessagePort, ev: MessageEvent) => any) | null = null;

    postMessage(message: any, transfer?: Transferable[]): void {}
    close(): void {}
    start(): void {}
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {}
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {}
    dispatchEvent(event: Event): boolean { return false; }
  };
}

// queueMicrotask polyfill
if (typeof queueMicrotask === 'undefined') {
  (globalThis as any).queueMicrotask = (fn: () => void): void => {
    Promise.resolve().then(fn);
  };
}

// Performance polyfill for React DevTools
if (typeof performance === 'undefined') {
  (globalThis as any).performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    getEntriesByType: () => [],
    clearMarks: () => {},
    clearMeasures: () => {}
  };
}

// Additional React-related polyfills
if (typeof requestIdleCallback === 'undefined') {
  (globalThis as any).requestIdleCallback = (fn: (deadline: { timeRemaining: () => number }) => void): number => {
    return setTimeout(() => fn({ timeRemaining: () => 0 }), 0) as any;
  };
}

if (typeof cancelIdleCallback === 'undefined') {
  (globalThis as any).cancelIdleCallback = (id: number): void => {
    clearTimeout(id as any);
  };
}