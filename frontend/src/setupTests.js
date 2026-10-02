// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// The test environment (jsdom) has no window.matchMedia, but Ant Design and
// our useTheme hook use it (responsive layout, dark mode). Provide a minimal stand-in.
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));

// The old jsdom bundled with Create React App can't parse some CSS selectors that
// Ant Design generates, so getComputedStyle() throws. Testing Library calls it to
// check visibility; fall back to the element's inline styles when that happens.
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (element, pseudoElement) => {
  try {
    return originalGetComputedStyle(element, pseudoElement);
  } catch {
    return element.style;
  }
};

// jsdom also lacks MessageChannel, which Ant Design uses to run code on the next
// tick (postMessage on port2 -> onmessage on port1). setTimeout does the same job here.
if (typeof window.MessageChannel === "undefined") {
  window.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = { onmessage: null };
      this.port2 = {
        postMessage: (data) => {
          setTimeout(() => this.port1.onmessage && this.port1.onmessage({ data }), 0);
        },
      };
    }
  };
}
