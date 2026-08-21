import { join } from 'node:path';

import { defineConfig } from 'vite-plus';

const ASSETS = join(import.meta.dirname, 'src/main/resources/assets'); // UI source root
const OUT = join(import.meta.dirname, 'build/resources/main/assets'); // compiled output

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  const lint = {
    options: { typeAware: true, typeCheck: true },
    // admin/** is CJS + XP globals (outside tsconfig); build/** is generated output.
    ignorePatterns: ['build/**', 'src/main/resources/admin/**', '**/*.d.ts'],
  };

  const fmt = {
    singleQuote: true,
    sortImports: true,
    ignorePatterns: ['build/**', 'src/main/resources/admin/**'],
  };

  // `vp pack` (tsdown) compiles server-side .ts (all under resources except assets/) to
  // per-file CommonJS, mirroring the tree into build/ so XP runs each file in place.
  const pack = {
    entry: [
      'src/main/resources/**/*.ts',
      '!src/main/resources/assets/**',
      '!src/main/resources/**/*.d.ts',
      '!src/main/resources/**/*.test.ts',
    ],
    root: 'src/main/resources',
    outDir: 'build/resources/main',
    format: 'cjs' as const,
    platform: 'node' as const,
    unbundle: true, // per-file output, not one bundle
    outExtensions: () => ({ js: '.js' }), // XP wants .js, not the cjs default .cjs
    deps: { neverBundle: [/^\/lib\//] }, // XP /lib/* requires stay external
    target: 'es2023',
    treeshake: false, // XP calls exports.get/all at runtime — don't drop as dead
    clean: false, // must not wipe the assets output `vp build` emits here
    dts: false,
    sourcemap: false,
    report: false,
  };

  // Vitest inherits the Vite config, so `root` has to be pointed back at the repo:
  // the build root is assets/, which would hide every server-side test.
  const test = {
    root: import.meta.dirname,
    environment: 'node' as const,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: true,
  };

  return {
    root: ASSETS,
    // Default would be <root>/node_modules/.vite — inside the resources tree, which
    // processResources then copies into the jar.
    cacheDir: join(import.meta.dirname, 'node_modules/.vite'),
    base: './', // relative asset URLs — served under the extension's own path
    build: {
      outDir: OUT,
      emptyOutDir: false, // shared with `vp pack` output — don't clear it
      target: 'es2023',
      minify: isProd,
      sourcemap: !isProd,
      rollupOptions: {
        // The host loads this with `import()`, so it stays one ES module entry.
        input: { 'js/section': join(ASSETS, 'js/section.ts') },
        // ! Without this the entry's exports are dropped — an app build assumes nothing
        // ! imports the entry, and the host would load an inert module.
        preserveEntrySignatures: 'strict' as const,
        output: {
          format: 'es',
          entryFileNames: '[name].js', // js/section → js/section.js
          chunkFileNames: 'js/chunks/[name]-[hash].js',
        },
      },
    },
    lint,
    fmt,
    pack,
    test,
  };
});
