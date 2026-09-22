import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

/**
 * Unit-test runner for pure, framework-agnostic logic (validation schemas,
 * formatting helpers, stores). Component/DOM tests are intentionally out of
 * scope here: adding @vitejs/plugin-react pulls a Babel version that conflicts
 * with shadcn's, so keep this config JSX-free until that is resolved.
 */
export default defineConfig({
  resolve: {
    // Mirror the tsconfig "@/*" -> "./*" path alias.
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
})
