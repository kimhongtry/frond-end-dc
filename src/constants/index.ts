import { envCons } from "./env";

/**
 * @example
 * _cons.x
 */
export const _cons = {
  ...envCons,
  // other constant goes here
};

console.log("✅ API BASE URL:", import.meta.env.VITE_API_BASE_URL);

// env
export const _envCons = envCons;
