import type { Linter } from 'eslint'

import comments from '@eslint-community/eslint-plugin-eslint-comments/configs'
import eslintReact from '@eslint-react/eslint-plugin'
// The one shared ESLint flat config. The root eslint.config.ts re-exports it.
// Every block says why it is there, in the style of roundup-monorepo/.golangci.yml.
import { fixupPluginRules } from '@eslint/compat'
import js from '@eslint/js'
import expoFlat from 'eslint-config-expo/flat.js'
import prettier from 'eslint-config-prettier'
import betterTailwind from 'eslint-plugin-better-tailwindcss'
import boundaries from 'eslint-plugin-boundaries'
import { importX } from 'eslint-plugin-import-x'
import jest from 'eslint-plugin-jest'
import perfectionist from 'eslint-plugin-perfectionist'
import reactHooks from 'eslint-plugin-react-hooks'
import reactNative from 'eslint-plugin-react-native'
import reactNativeA11y from 'eslint-plugin-react-native-a11y'
import testingLibrary from 'eslint-plugin-testing-library'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tseslint from 'typescript-eslint'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const SOURCE = ['**/*.{ts,tsx}']
const TESTS = ['**/*.test.{ts,tsx}']
const COMPONENTS = ['shared/ui/src/**/*.tsx', 'apps/app/src/**/*.tsx']
const ROUTES = ['apps/app/src/app/**/*.tsx']
const TOOL_CONFIGS = [
  '*.config.ts',
  'apps/*/*.config.ts',
  'shared/*/*.config.ts',
  'knip.ts',
  'shared/config/*.ts',
  'apps/*/jest.setup*.ts',
  'shared/*/jest.setup*.ts',
]

// eslint-config-expo and the type-checked presets mix warnings and errors. With
// --max-warnings=0 a warning is a failure anyway, so say so in the config.
const warningsToErrors = (configs: Linter.Config[]): Linter.Config[] =>
  configs.map((config) => ({
    ...config,
    ...(config.rules
      ? {
          rules: Object.fromEntries(
            Object.entries(config.rules).map(([name, value]) => [
              name,
              value === 'warn' || value === 1
                ? 'error'
                : Array.isArray(value) && (value[0] === 'warn' || value[0] === 1)
                  ? ['error', ...value.slice(1)]
                  : value,
            ]),
          ),
        }
      : {}),
  }))

const STYLE_OBJECT_BAN = {
  selector: "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression",
  message: 'No inline style objects. Use className; raw values come from useTheme().',
}
const INACTIVE_BAN = {
  selector: "Literal[value='inactive']",
  message: "Do not branch on AppState 'inactive': Split View sends it. Pause on 'background' only.",
}
const INSET_MATH_BAN = {
  selector:
    "CallExpression[callee.object.name='Math'][callee.property.name=/^(max|min)$/] MemberExpression[property.name=/^(top|bottom|left|right)$/]",
  message: 'Read each safe-area inset edge separately; never collapse them with Math.max/min.',
}

const a11yRules = Object.fromEntries(
  Object.keys((reactNativeA11y as { rules: Record<string, unknown> }).rules).map((name) => [
    `react-native-a11y/${name}`,
    'error',
  ]),
)

// Plugin config objects are typed loosely (exactOptionalPropertyTypes rejects their optional keys),
// so the list is cast once here instead of at every entry. ESLint validates the shape at load time.
const blocks = (...entries: unknown[]): Linter.Config[] => entries as Linter.Config[]

const config = blocks(
  {
    // Build output, generated code and native folders are not ours to lint.
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      '**/coverage/**',
      '**/ios/**',
      '**/android/**',
      'shared/tokens/src/tokens.ts',
    ],
  },
  {
    // A disable comment that no longer suppresses anything is dead weight.
    linterOptions: { reportUnusedDisableDirectives: 'error', reportUnusedInlineConfigs: 'error' },
  },

  // ── Base correctness ────────────────────────────────────────
  // ESLint's own recommended rules: the floor for every file.
  js.configs.recommended,
  // strictTypeChecked + stylisticTypeChecked: the strictest typescript-eslint presets, using type information.
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    // Type-aware rules need the TypeScript program; projectService finds each file's tsconfig.
    files: SOURCE,
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: root },
    },
  },
  // Expo's flat config knows RN globals and Expo conventions. Its warnings become errors.
  ...warningsToErrors(expoFlat as Linter.Config[]),
  {
    // eslint-plugin-react reads this to pick rules for the installed React major (set after Expo's 'detect').
    settings: { react: { version: '19' } },
  },
  {
    // The Expo preset uses the legacy import plugin; import-x below does that job better with TS.
    files: SOURCE,
    rules: {
      'import/no-unresolved': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-duplicates': 'off',
      'import/export': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/first': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },

  // ── TypeScript strictness beyond the presets ────────────────
  {
    // Each rule below catches a bug class the presets leave out or leave off.
    files: SOURCE,
    rules: {
      // import type keeps type-only imports erased (verbatimModuleSyntax).
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      // A union that grows must fail the build wherever it is switched on.
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: false, requireDefaultForNonUnion: true },
      ],
      // Numbers in template strings are safe and common (sizes, counts).
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // An unawaited promise is a silent failure.
      '@typescript-eslint/no-floating-promises': 'error',
      // No truthiness on strings or numbers: '' and 0 render as text in React Native.
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: true,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
          allowAny: false,
        },
      ],
      // Names say what a thing is: camelCase values, PascalCase types and components, UPPER_CASE constants.
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'] },
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
        // CSS variables, headers, hyphenated token names and route params are data keys, not identifiers.
        {
          selector: ['objectLiteralProperty', 'objectLiteralMethod', 'typeProperty'],
          format: null,
        },
        { selector: 'import', format: null },
      ],
    },
  },
  {
    // Shared packages are consumed by other packages, so their public API must be fully typed.
    files: ['shared/*/src/**/*.{ts,tsx}'],
    ignores: TESTS,
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },

  // ── React ───────────────────────────────────────────────────
  {
    // Strict type-checked React rules: leaked renders, array-index keys, unstable context values, nested components.
    files: SOURCE,
    ...eslintReact.configs['strict-type-checked'],
  },
  {
    // Rules of Hooks plus the React Compiler diagnostics (the app builds with the compiler on).
    files: SOURCE,
    ...reactHooks.configs.flat['recommended-latest'],
  },
  {
    // react-native: text must sit inside <Text>, and styles must not use raw colours.
    // The plugin predates flat config, so fixupPluginRules adapts it.
    files: SOURCE,
    plugins: { 'react-native': fixupPluginRules(reactNative as never) },
    rules: {
      // Our own components wrap string children in <Text>, so raw text inside them is fine.
      'react-native/no-raw-text': ['error', { skip: ['Badge', 'Button', 'Chip', 'Text', 'Toast'] }],
      'react-native/no-color-literals': 'error',
    },
  },
  {
    // Accessibility: every react-native-a11y rule at error. Same checks on web and native.
    files: SOURCE,
    plugins: { 'react-native-a11y': fixupPluginRules(reactNativeA11y as never) },
    rules: {
      ...(a11yRules as Linter.RulesRecord),
      // Hints belong only where the result of an action is not obvious from the label (Apple's
      // guidance). Demanding one beside every label makes screen readers say more, not better.
      'react-native-a11y/has-accessibility-hint': 'off',
    },
  },

  // ── Project conventions ─────────────────────────────────────
  {
    // Styling goes through className + cva, buttons through Pressable. These bans keep one way of doing each.
    files: SOURCE,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: [
                'StyleSheet',
                'TouchableOpacity',
                'TouchableHighlight',
                'TouchableWithoutFeedback',
                'TouchableNativeFeedback',
                'Button',
              ],
              message:
                'Use className with cva for styling, and Pressable (or @roundup/ui Button) for taps.',
            },
          ],
        },
      ],
      'no-restricted-syntax': ['error', STYLE_OBJECT_BAN, INACTIVE_BAN, INSET_MATH_BAN],
      'no-restricted-properties': [
        'error',
        {
          object: 'Dimensions',
          property: 'get',
          message: 'Use useWindowDimensions(): window size changes on fold, rotate and Split View.',
        },
        {
          object: 'process',
          property: 'env',
          message: "Read configuration through the validated 'env' object.",
        },
      ],
    },
  },
  {
    // Tool configs and the env module are the only places allowed to read process.env.
    files: [
      ...TOOL_CONFIGS,
      'apps/app/src/config/env.ts',
      'apps/server/src/env.ts',
      'apps/server/src/main.ts',
    ],
    rules: { 'no-restricted-properties': 'off' },
  },
  {
    // The few files that need a raw style object (boxShadow on floating surfaces, per-edge safe-area padding, the glass layer) say so here and nowhere else.
    files: [
      'shared/ui/src/Modal/Modal.tsx',
      'shared/ui/src/SafeArea/SafeArea.tsx',
      'shared/ui/src/Surface/Surface.tsx',
      'shared/ui/src/Toast/Toast.tsx',
    ],
    rules: { 'no-restricted-syntax': ['error', INACTIVE_BAN, INSET_MATH_BAN] },
  },

  {
    // react-native-svg types mark the x/y geometry of <Rect> as deprecated, but there is no other way to place one.
    files: ['shared/ui/src/{EmptyState,Icon,Logo,VenueCard,Welcome}/*.tsx'],
    rules: { '@typescript-eslint/no-deprecated': 'off' },
  },

  // ── Architecture ────────────────────────────────────────────
  {
    // app -> ui -> tokens, one direction only. config is for tooling. shared/* never imports apps/*.
    files: SOURCE,
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'apps/app/**', mode: 'full' },
        { type: 'server', pattern: 'apps/server/**', mode: 'full' },
        { type: 'ui', pattern: 'shared/ui/**', mode: 'full' },
        { type: 'tokens', pattern: 'shared/tokens/**', mode: 'full' },
        { type: 'config', pattern: 'shared/config/**', mode: 'full' },
      ],
    },
    rules: {},
  },

  // ── Imports ─────────────────────────────────────────────────
  {
    // Cycles, missing dependencies, duplicate and needlessly long import paths.
    files: SOURCE,
    plugins: { 'import-x': importX },
    rules: {
      'import-x/no-cycle': ['error', { ignoreExternal: true }],
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.{ts,tsx}',
            '**/test/**',
            '**/*.config.ts',
            '**/jest.setup*.ts',
            'knip.ts',
            'shared/config/**',
            'shared/tokens/scripts/**',
            'scripts/**',
          ],
        },
      ],
      'import-x/no-default-export': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-relative-packages': 'error',
      'import-x/no-useless-path-segments': 'error',
    },
  },
  {
    // One stable order for imports, exports, props and unions, so diffs show real changes only.
    files: SOURCE,
    plugins: { perfectionist },
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          groups: [
            'type-import',
            ['value-builtin', 'value-external'],
            'type-internal',
            'value-internal',
            ['type-parent', 'type-sibling', 'type-index'],
            ['value-parent', 'value-sibling', 'value-index'],
            'ts-equals-import',
            'unknown',
          ],
          internalPattern: ['^@roundup/.+'],
          newlinesBetween: 1,
        },
      ],
      'perfectionist/sort-named-imports': ['error', { type: 'natural' }],
      'perfectionist/sort-exports': ['error', { type: 'natural' }],
      'perfectionist/sort-jsx-props': ['error', { type: 'natural' }],
      'perfectionist/sort-union-types': ['error', { type: 'natural' }],
      'perfectionist/sort-object-types': ['error', { type: 'natural' }],
    },
  },
  {
    // unicorn recommended catches many small mistakes. Filenames: Pascal for components, kebab elsewhere.
    files: SOURCE,
    ...unicorn.configs.recommended,
    rules: {
      ...unicorn.configs.recommended.rules,
      // props, ref and env are RN and Expo vocabulary; renaming them would fight the framework.
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': ['error', { cases: { kebabCase: true } }],
      // null is part of React Native APIs (refs, style, children).
      'unicorn/no-null': 'off',
      // Array#reduce is fine when typed; the rule only pushes people toward worse loops here.
      'unicorn/no-array-reduce': 'off',
      // Route files use the Expo Router default export and sibling index files.
      'unicorn/no-array-callback-reference': 'off',
      // forEach is readable for side effects.
      'unicorn/no-array-for-each': 'off',
      // Numeric separators clash with token values that mirror the design system.
      'unicorn/numeric-separators-style': 'off',
    },
  },
  {
    // Component folders are PascalCase by design (Button/Button.tsx).
    files: ['shared/ui/src/**/*.{ts,tsx}', 'apps/app/src/shell/*.{ts,tsx}'],
    rules: {
      'unicorn/filename-case': ['error', { cases: { pascalCase: true, kebabCase: true } }],
    },
  },
  {
    // Route files and special Expo names ([id], (tabs), +not-found, _layout) have framework-mandated names.
    files: ['apps/app/src/app/**/*.{ts,tsx}'],
    rules: { 'unicorn/filename-case': 'off' },
  },

  // ── Tailwind ────────────────────────────────────────────────
  {
    // Only classes the generated theme defines. bg-ctp-mauve and bg-[#fff] cannot pass, so roles stay the only palette.
    files: COMPONENTS,
    plugins: { 'better-tailwindcss': betterTailwind },
    settings: {
      'better-tailwindcss': {
        // tailwindcss is installed in the app, so resolve it from there for shared/ui files too.
        cwd: path.join(root, 'apps/app'),
        entryPoint: path.join(root, 'apps/app/global.css'),
      },
    },
    rules: {
      'better-tailwindcss/no-unknown-classes': 'error',
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'error',
      // Colour comes from roles only: no hex, rgb or hsl arbitrary values. Spacing steps outside
      // the token scale (1 2 3 4 6 8 12) are out too; sizes with no token use a visible [Npx].
      'better-tailwindcss/no-restricted-classes': [
        'error',
        {
          restrict: [
            {
              pattern: String.raw`^(?:[\w-]+:)*[\w-]+-\[(?:#|rgb|hsl|oklch|oklab|color).*\]$`,
              message: 'Use a role class such as bg-accent, not a raw colour.',
            },
            {
              pattern: String.raw`^(?:[\w-]+:)*-?(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|size|w|h|min-w|min-h|max-w|max-h|inset|top|right|bottom|left)-(?:5|7|9|10|11|1[3-9]|[2-9]\d|\d{3,})$`,
              message: 'Spacing comes from the token scale: 1, 2, 3, 4, 6, 8, 12.',
            },
          ],
        },
      ],
    },
  },

  // ── Comments ────────────────────────────────────────────────
  {
    // Disabling a rule needs a reason and a named rule, never a blanket off switch.
    files: SOURCE,
    plugins: comments.recommended.plugins,
    rules: {
      '@eslint-community/eslint-comments/require-description': 'error',
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
    },
  },

  // ── Tests ───────────────────────────────────────────────────
  {
    // Jest rules for test files.
    files: TESTS,
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/consistent-test-it': ['error', { fn: 'it' }],
      'jest/prefer-expect-assertions': 'off',
      'jest/require-top-level-describe': 'error',
      'jest/valid-title': 'error',
    },
  },
  {
    // Testing Library: query by role and label like a user does. getByTestId is banned.
    files: TESTS,
    ...testingLibrary.configs['flat/react'],
    rules: {
      ...testingLibrary.configs['flat/react'].rules,
      // React Native Testing Library 14 made fireEvent and render async, so awaiting them is correct.
      'testing-library/no-await-sync-events': 'off',
      'testing-library/prefer-screen-queries': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.property.name=/^(get|query|find)(All)?ByTestId$/]',
          message: 'Query by role, label or text so tests prove what users can reach.',
        },
      ],
    },
  },
  {
    // Test doubles are loose by nature; unsafe-* and unbound-method fire on mocks, not on real bugs.
    files: TESTS,
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // ── Node tooling ────────────────────────────────────────────
  {
    // Config files, scripts and the server run on Node, not in React Native.
    files: [
      ...TOOL_CONFIGS,
      'scripts/**/*.ts',
      'shared/tokens/scripts/**/*.ts',
      'apps/server/**/*.ts',
    ],
    languageOptions: { globals: globals.node },
  },

  {
    // Tool configs must default-export; everything else uses named exports. Expo Router routes are the other exception.
    files: [...TOOL_CONFIGS, ...ROUTES, 'apps/app/src/app/**/*.ts'],
    rules: { 'import-x/no-default-export': 'off' },
  },
  // ── Formatting ──────────────────────────────────────────────
  // Prettier owns formatting; turning off the clashing ESLint rules must come last.
  prettier,
)

export default config
