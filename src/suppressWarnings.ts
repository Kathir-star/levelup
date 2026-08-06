// Override console methods BEFORE any imports so React captures the patched console methods
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  const msg = args.map(a => (typeof a === 'string' ? a : String(a))).join(' ');
  if (
    msg.includes('defaultProps') ||
    msg.includes('Support for defaultProps will be removed') ||
    msg.includes('XAxis') ||
    msg.includes('YAxis')
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const msg = args.map(a => (typeof a === 'string' ? a : String(a))).join(' ');
  if (
    msg.includes('defaultProps') ||
    msg.includes('Support for defaultProps will be removed') ||
    msg.includes('XAxis') ||
    msg.includes('YAxis')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Dynamically import recharts to remove defaultProps from all exported components
import('recharts')
  .then((Recharts) => {
    Object.keys(Recharts).forEach((key) => {
      const Component = (Recharts as any)[key];
      if (Component && (typeof Component === 'function' || typeof Component === 'object')) {
        try {
          Object.defineProperty(Component, 'defaultProps', {
            get: () => undefined,
            set: () => {},
            configurable: true,
          });
        } catch (e) {
          try {
            delete Component.defaultProps;
          } catch (e2) {
            try {
              Component.defaultProps = undefined;
            } catch (e3) {}
          }
        }
      }
    });
  })
  .catch(() => {});


