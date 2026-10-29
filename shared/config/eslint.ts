import type { Linter } from 'eslint'

import comments from '@eslint-community/eslint-plugin-eslint-comments/configs'
import eslintReact from '@eslint-react/eslint-plugin'
// The one shared ESLint flat config. The root eslint.config.ts re-exports it.
// Every block says why it is there, in the style of roundup-monorepo/.golangci.yml.
import { fixupPluginRules } from '@eslint/compat'
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import expoFlat from 'eslint-config-expo/flat.js'
import prettier from 'eslint-config-prettier'
import betterTailwind from 'eslint-plugin-better-tailwindcss'
import boundaries from 'eslint-plugin-boundaries'
import i18next from 'eslint-plugin-i18next'
import { importX } from 'eslint-plugin-import-x'
import jest from 'eslint-plugin-jest'
import jsdoc from 'eslint-plugin-jsdoc'
import perfectionist from 'eslint-plugin-perfectionist'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactNative from 'eslint-plugin-react-native'
import reactNativeA11y from 'eslint-plugin-react-native-a11y'
import sonarjs from 'eslint-plugin-sonarjs'
import testingLibrary from 'eslint-plugin-testing-library'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tseslint from 'typescript-eslint'

// sonarjs types its configs loosely (a union with legacy and array shapes); recommended is a flat config object.
const sonarRecommended = sonarjs.configs?.['recommended'] as unknown as Linter.Config

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const SOURCE = ['**/*.{ts,tsx}']
// Every package keeps tests, fixtures and helpers in tests/; TEST_FILES is the subset Jest runs.
const TESTS = ['**/tests/**/*.{ts,tsx}']
const TEST_FILES = ['**/tests/**/*.test.{ts,tsx}']
const COMPONENTS = ['shared/ui/src/**/*.tsx', 'apps/app/src/**/*.tsx']
const ROUTES = ['apps/app/src/app/**/*.tsx']

const NOT_USER_FACING_ATTRIBUTE =
  /^(?!(?:accessibilityLabel|accessibilityHint|aria-label|alt|label|loadingLabel|startLabel|placeholder|title|subtitle|body|helper|error|text|name)$).*$/

const TOOL_CONFIGS = [
  '*.config.ts',
  'apps/*/*.config.ts',
  'shared/*/*.config.ts',
  'knip.ts',
  'shared/config/*.ts',
  'apps/*/jest.setup*.ts',
  'shared/*/jest.setup*.ts',
]

/**
 * Whether a rule level means warning.
 * @param level - A rule severity.
 * @returns True for "warn" or 1.
 */
const isWarn = (level: unknown): boolean => level === 'warn' || level === 1

/**
 * Turns a warning rule entry into an error one and keeps its options.
 * @param value - A rule entry.
 * @returns The entry, at error severity if it was a warning.
 */
const raiseSeverity = (value: Linter.RuleEntry | undefined): Linter.RuleEntry | undefined => {
  let raised = value

  if (isWarn(value)) {
    raised = 'error'
  } else if (Array.isArray(value) && isWarn(value[0])) {
    const options: unknown[] = value.slice(1)

    raised = ['error', ...options] as Linter.RuleEntry
  }

  return raised
}

/**
 * eslint-config-expo and the type-checked presets mix warnings and errors. With --max-warnings=0 a warning is a failure anyway, so say so in the config.
 * @param configs - Flat config objects.
 * @returns The same configs with every warning raised.
 */
const warningsToErrors = (configs: Linter.Config[]): Linter.Config[] =>
  configs.map((config) => ({
    ...config,
    ...(config.rules
      ? {
          rules: Object.fromEntries(
            Object.entries(config.rules).map(([name, value]) => [name, raiseSeverity(value)]),
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

/** The shape of a plugin that ships no types: just its rules by name. */
interface RuleSet {
  /** The rules the plugin defines. */
  rules: Record<string, unknown>
}

const a11yRules = Object.fromEntries(
  Object.keys((reactNativeA11y as RuleSet).rules).map((name) => [
    `react-native-a11y/${name}`,
    'error',
  ]),
)

/**
 * Plugin config objects are typed loosely (exactOptionalPropertyTypes rejects their optional keys),
 * so the list is cast once here instead of at every entry. ESLint validates the shape at load time.
 * @param entries - Flat config objects from plugins and from this file.
 * @returns The same objects, typed as flat configs.
 */
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
    // JSX props never receive an inline arrow, function or bind result: a fresh function per render
    // defeats memoisation and hides handlers from review. Use a module-level function, useCallback,
    // or a handler that reads its data from props. Refs, DOM components and props are all checked.
    // The plugin is already registered by the Expo preset, so only the rule is switched on.
    files: SOURCE,
    plugins: { react },
    rules: {
      'react/jsx-no-bind': [
        'error',
        {
          allowArrowFunctions: false,
          allowBind: false,
          allowFunctions: false,
          ignoreDOMComponents: false,
          ignoreRefs: false,
        },
      ],
    },
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
      'shared/ui/src/components/Modal.tsx',
      'shared/ui/src/components/SafeArea.tsx',
      'shared/ui/src/components/Surface.tsx',
      'shared/ui/src/components/Toast.tsx',
    ],
    rules: { 'no-restricted-syntax': ['error', INACTIVE_BAN, INSET_MATH_BAN] },
  },

  {
    // react-native-svg types mark the x/y geometry of <Rect> as deprecated, but there is no other way to place one.
    files: ['shared/ui/src/components/{EmptyState,Icon,Logo,VenueCard,Welcome}.tsx'],
    rules: { '@typescript-eslint/no-deprecated': 'off' },
  },

  // ── Code quality ────────────────────────────────────────────
  {
    // SonarQube's rules, so the SonarCloud gate has nothing left to report. The recommended set
    // ships some rules at warn; with --max-warnings=0 that is an error anyway, so it is spelled out.
    files: SOURCE,
    plugins: sonarRecommended.plugins,
    rules: Object.fromEntries(
      Object.entries(sonarRecommended.rules ?? {}).map(([name, value]) => [
        name,
        value === 'off' || value === 0 ? 'off' : 'error',
      ]),
    ),
  },

  // ── i18n ────────────────────────────────────────────────────
  {
    // Every user-visible string comes from @roundup/i18n. jsx-only flags literal text and literal
    // attribute values in JSX (labels, hints, placeholders), which is where copy hides; strings in
    // plain TypeScript are covered by review and by the i18n package's key tests.
    files: ['apps/app/src/**/*.tsx', 'shared/ui/src/**/*.tsx'],
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          // The plugin's attribute option only excludes, so the list is inverted: every attribute
          // is skipped except the ones a person reads or hears (labels, hints, copy props).
          'jsx-attributes': { exclude: [NOT_USER_FACING_ATTRIBUTE] },
        },
      ],
    },
  },

  // ── Architecture ────────────────────────────────────────────
  {
    // app -> ui -> i18n and tokens, one direction only. i18n and tokens import nothing internal
    // (config is the tooling every package may reach for its Jest preset and tsconfig). The server
    // is a separate service. shared/* never imports apps/*.
    files: SOURCE,
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'apps/app/**', partialMatch: false },
        { type: 'server', pattern: 'apps/server/**', partialMatch: false },
        { type: 'ui', pattern: 'shared/ui/**', partialMatch: false },
        { type: 'i18n', pattern: 'shared/i18n/**', partialMatch: false },
        { type: 'tokens', pattern: 'shared/tokens/**', partialMatch: false },
        { type: 'config', pattern: 'shared/config/**', partialMatch: false },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              allow: { to: { element: { type: ['app', 'ui', 'i18n', 'tokens', 'config'] } } },
            },
            {
              from: { element: { type: 'server' } },
              allow: { to: { element: { type: ['server', 'config'] } } },
            },
            {
              from: { element: { type: 'ui' } },
              allow: { to: { element: { type: ['ui', 'i18n', 'tokens', 'config'] } } },
            },
            {
              from: { element: { type: 'i18n' } },
              allow: { to: { element: { type: ['i18n', 'config'] } } },
            },
            {
              from: { element: { type: 'tokens' } },
              allow: { to: { element: { type: ['tokens', 'config'] } } },
            },
            {
              from: { element: { type: 'config' } },
              allow: { to: { element: { type: ['config'] } } },
            },
          ],
        },
      ],
    },
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
            '**/tests/**',
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
    // SVG artwork lives in the repo-root assets/ folder, which npm sees as the root package, so
    // no-relative-packages would rewrite these paths into a package name that resolves nowhere.
    // There is no package to import the files from; a relative path is the only form that works.
    files: [
      'shared/ui/src/lib/icons.ts',
      'shared/ui/src/components/Logo.tsx',
      'shared/ui/src/components/Welcome.tsx',
    ],
    rules: { 'import-x/no-relative-packages': 'off' },
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
      // A nested ternary hides which branch wins. Use an early return, a lookup object or an if
      // block. The core rule bans every nesting; unicorn's own version allows a parenthesised one.
      'no-nested-ternary': 'error',
      'unicorn/no-nested-ternary': 'off',
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
    // Component files are PascalCase by design (components/Button.tsx); helpers in lib/ stay kebab-case.
    files: [
      'shared/ui/src/components/*.tsx',
      'shared/ui/tests/components/*.tsx',
      'apps/app/src/shell/*.tsx',
      'apps/app/tests/shell/*.tsx',
    ],
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
      // Tailwind's default scale is the vocabulary: h-[36px] must be h-9, w-[60%] w-3/5, and so on.
      // An arbitrary value survives only where no default step exists (text-[15px], tracking).
      'better-tailwindcss/enforce-canonical-classes': 'error',
      'better-tailwindcss/enforce-shorthand-classes': 'error',
      'better-tailwindcss/no-deprecated-classes': 'error',
      // Colour comes from roles only: no hex, rgb or hsl arbitrary values.
      'better-tailwindcss/no-restricted-classes': [
        'error',
        {
          restrict: [
            {
              pattern: String.raw`^(?:[\w-]+:)*[\w-]+-\[(?:#|rgb|hsl|oklch|oklab|color).*\]$`,
              message: 'Use a role class such as bg-accent, not a raw colour.',
            },
          ],
        },
      ],
    },
  },

  // ── Documentation ───────────────────────────────────────────
  {
    // Everything is documented, so a reader never has to open the body to learn what a thing is for.
    // The recommended-typescript preset leaves types to TypeScript (no-types) and checks tag
    // syntax; the rules below add the requirement itself. Callbacks passed as arguments (describe,
    // it, map, useEffect) are not matched by these contexts, so they stay exempt.
    files: SOURCE,
    ...jsdoc.configs['flat/recommended-typescript-error'],
    rules: {
      ...jsdoc.configs['flat/recommended-typescript-error'].rules,
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: false,
          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },
          contexts: [
            'VariableDeclarator > ArrowFunctionExpression',
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'TSPropertySignature',
            'TSEnumDeclaration',
            // The same nodes as `ExportNamedDeclaration > VariableDeclaration`, selected from the export
            // so the doc above `export const` is the one found: jsdoc looks for the comment before the
            // matched node, and a bare VariableDeclaration inside an export can never have one there.
            'ExportNamedDeclaration:has(> VariableDeclaration)',
            'TSMethodSignature',
          ],
          checkGetters: true,
          exemptEmptyFunctions: false,
        },
      ],
      'jsdoc/require-description': 'error',
      // Destructured props are documented once, on their interface, so a component does not
      // need an @param per prop; plain parameters still do.
      'jsdoc/require-param': ['error', { checkDestructured: false, checkDestructuredRoots: false }],
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/informative-docs': 'error',
      'jsdoc/no-types': 'error',
      'jsdoc/require-hyphen-before-param-description': ['error', 'always'],
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
    files: TEST_FILES,
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
    files: TEST_FILES,
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
    // Tool configs must default-export; everything else uses named exports. Expo Router routes and the
    // ambient *.svg module declaration (a module's default export is its component) are the exceptions.
    files: [...TOOL_CONFIGS, ...ROUTES, 'apps/app/src/app/**/*.ts', 'shared/ui/src/svg.d.ts'],
    rules: { 'import-x/no-default-export': 'off' },
  },
  // ── Formatting ──────────────────────────────────────────────
  // Prettier owns formatting; turning off the clashing ESLint rules must come last.
  prettier,
  {
    // Blank lines between statements are not Prettier's business (it only collapses runs of them),
    // and neither rule is in eslint-config-prettier's disable list, so they sit after it and win.
    files: SOURCE,
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
      '@stylistic/padding-line-between-statements': [
        'error',
        // A declaration group ends with a blank line, but single-line declarations may stack.
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['singleline-const', 'singleline-let', 'singleline-var'],
          next: ['singleline-const', 'singleline-let', 'singleline-var'],
        },
        {
          blankLine: 'always',
          prev: ['multiline-const', 'multiline-let', 'multiline-var'],
          next: '*',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: ['multiline-const', 'multiline-let', 'multiline-var'],
        },
        // Control flow exits stand apart so the reader sees where a block ends.
        { blankLine: 'always', prev: '*', next: ['return', 'throw', 'break', 'continue'] },
        // Blocks and multi-line expressions get air on both sides.
        {
          blankLine: 'always',
          prev: '*',
          next: ['block-like', 'multiline-block-like', 'multiline-expression'],
        },
        {
          blankLine: 'always',
          prev: ['block-like', 'multiline-block-like', 'multiline-expression'],
          next: '*',
        },
        { blankLine: 'always', prev: 'directive', next: '*' },
        { blankLine: 'any', prev: 'directive', next: 'directive' },
        // Exports are the module's surface; consecutive ones (barrels) may stack.
        { blankLine: 'always', prev: '*', next: 'export' },
        { blankLine: 'always', prev: 'export', next: '*' },
        { blankLine: 'any', prev: 'export', next: 'export' },
        // Imports are ordered and grouped by perfectionist/sort-imports instead.
        { blankLine: 'any', prev: 'import', next: 'import' },
      ],
    },
  },
  {
    // Jest: blank lines around describe, test, hook and expect groups, so each test reads in blocks.
    files: TEST_FILES,
    plugins: { jest },
    rules: { 'jest/padding-around-all': 'error' },
  },
)

export default config
