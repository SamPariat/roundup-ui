import { RuleTester } from 'eslint'
import { describe, it } from 'node:test'
import tseslint from 'typescript-eslint'

import { hookOrder } from './eslint-hook-order'

// RuleTester runs its cases through the test runner's describe and it.
RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

/** Runs the rule over TypeScript and JSX, as the repo is written. */
const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

/**
 * Wraps a component body in a function.
 * @param body - The lines of the body.
 * @returns The component's source.
 */
const component = (...body: string[]): string =>
  ['export const Screen = () => {', ...body, '  return null', '}'].join('\n')

tester.run('hook-order', hookOrder, {
  valid: [
    {
      name: 'every group in order, split by blank lines',
      code: component(
        '  const { t } = useT()',
        '  const router = useRouter()',
        '',
        '  const [open, setOpen] = useState<boolean>(false)',
        '  const ref = useRef<View>(null)',
        '',
        '  const { squad } = useSquad(id)',
        '  const errorText = useErrorText(squad.error)',
        '',
        '  const label = useMemo((): string => t(squad.name), [squad, t])',
        '',
        '  const handleOpen = useCallback((): void => {',
        '    setOpen(true)',
        '  }, [])',
        '',
        '  const actions = useMemo((): string[] => [handleOpen.name], [handleOpen])',
        '',
        '  useEffect(() => {',
        '    ref.current = null',
        '  }, [])',
      ),
    },
    {
      name: 'state seeded from a data hook sits in the data group, after it',
      code: component(
        '  const { t } = useT()',
        '',
        '  const { squad } = useSquad(id)',
        '  const [name, setName] = useState<string>(squad.name)',
      ),
    },
    {
      name: 'a data hook that takes a handler comes after the handlers',
      code: component(
        '  const [open, setOpen] = useState<boolean>(false)',
        '',
        '  const handleDone = useCallback((): void => {',
        '    setOpen(false)',
        '  }, [])',
        '',
        '  const sheet = useSheet({ onDone: handleDone })',
      ),
    },
    {
      name: 'a value that reads nothing from the body may sit anywhere',
      code: component(
        '  const { t } = useT()',
        '  const sheet = Platform.OS !== "web"',
        '  const router = useRouter()',
      ),
    },
    {
      name: 'a comment above a hook may take the blank line inside a group',
      code: component(
        '  const { t } = useT()',
        '',
        '  // Where the person is.',
        '  const router = useRouter()',
      ),
    },
    {
      name: 'plain functions and early returns are not checked',
      code: [
        'const helper = () => {',
        '  useEffect(() => {}, [])',
        '  const [a] = useState<number>(0)',
        '}',
        'export const Screen = () => {',
        '  const { t } = useT()',
        '',
        '  if (t === undefined) return null',
        '',
        '  const [late] = useState<number>(0)',
        '',
        '  return late',
        '}',
      ].join('\n'),
    },
    {
      name: 'a bare hook call keeps the blank line the padding rule wants after a declaration',
      code: component('  const gate = useRouteGate()', '', '  useSplash(gate.ready)'),
    },
    {
      name: 'JSX built in a plain value after the last hook is the render part, not checked',
      code: component(
        '  const reduced = useReducedMotion()',
        '',
        '  const handlePress = useCallback((): void => {}, [])',
        '',
        '  const image = reduced ? null : handlePress',
      ),
    },
  ],
  invalid: [
    {
      name: 'state before a context read',
      code: component(
        '  const [open, setOpen] = useState<boolean>(false)',
        '',
        '  const { t } = useT()',
      ),
      errors: [{ messageId: 'order' }],
    },
    {
      name: 'a handler after a value built from another handler',
      code: component(
        '  const handleOpen = useCallback((): void => {}, [])',
        '',
        '  const actions = useMemo((): string[] => [handleOpen.name], [handleOpen])',
        '',
        '  const handleClose = useCallback((): void => {}, [])',
      ),
      errors: [{ messageId: 'order' }],
    },
    {
      name: 'an effect before a handler',
      code: component(
        '  useEffect(() => {}, [])',
        '',
        '  const handleOpen = useCallback((): void => {}, [])',
      ),
      errors: [{ messageId: 'order' }],
    },
    {
      name: 'no blank line between two groups',
      code: component(
        '  const { t } = useT()',
        '  const [open, setOpen] = useState<boolean>(false)',
      ),
      errors: [{ messageId: 'blankBetween' }],
    },
    {
      name: 'a blank line inside a group of single-line hooks',
      code: component('  const { t } = useT()', '', '  const router = useRouter()'),
      errors: [{ messageId: 'noBlankWithin' }],
    },
    {
      name: 'a plain value between hooks is checked by what it reads',
      code: component(
        '  const reduced = useReducedMotion()',
        '',
        '  const handlePress = useCallback((): void => {}, [])',
        '',
        '  const speed = reduced ? 0 : 1',
        '',
        '  useEffect(() => {}, [speed])',
      ),
      errors: [{ messageId: 'order' }],
    },
    {
      name: 'a hook rule applies inside a custom hook too',
      code: [
        'export const useThing = () => {',
        '  const [a] = useState<number>(0)',
        '',
        '  const deps = useDeps()',
        '',
        '  return a',
        '}',
      ].join('\n'),
      errors: [{ messageId: 'order' }],
    },
  ],
})
