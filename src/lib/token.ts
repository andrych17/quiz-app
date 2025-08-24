export const makeToken = () =>
  Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
