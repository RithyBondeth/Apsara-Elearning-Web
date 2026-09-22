import react from "@vitejs/plugin-react-swc"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

/**
 * Test runner for unit tests (pure logic) and component tests (React + jsdom).
 *
 * The React transform is @vitejs/plugin-react-SWC, not the Babel-based
 * @vitejs/plugin-react: the Babel plugin pulls a @babel version that conflicts
 * (ERESOLVE) with shadcn's, so the SWC transform is what unblocks JSX tests here.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirror the tsconfig "@/*" -> "./*" path alias.
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next"],
  },
})
