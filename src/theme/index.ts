/**
 * The one import every other file uses: `import { color, space, text } from "@/theme"`.
 *
 * Motion is namespaced rather than spread, because `press`, `arrive` and
 * `count` are words a screen is likely to want for its own locals, and
 * `motion.press` never collides.
 */
export * from "./tokens";
export * from "./type";
export * as motion from "./motion";
