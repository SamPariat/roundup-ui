import type { Rule, Scope } from 'eslint'

/** Any node the rule sees, with its parent. */
type TNode = Rule.Node

/** Anything that names its ESTree type. */
interface ITyped<K> {
  /** The ESTree node type, such as CallExpression. */
  type: K
}

/** A node of one ESTree type. */
type TNodeOf<K extends TNode['type']> = Extract<TNode, ITyped<K>>

/** A function whose body may be a component's or a hook's. */
type TFunctionNode = TNodeOf<
  'ArrowFunctionExpression' | 'FunctionDeclaration' | 'FunctionExpression'
>

/** A top-level statement of a component or hook body. */
type TStatement = TNodeOf<'BlockStatement'>['body'][number]

/**
 * The groups a component or hook body is laid out in, top to bottom. Plain values that read
 * nothing from the body are neutral: they may sit anywhere and do not split groups.
 */
const Group = {
  neutral: 0,
  context: 1,
  state: 2,
  data: 3,
  derived: 4,
  handler: 5,
  built: 6,
  effect: 7,
} satisfies Record<string, number>

/** One of the group numbers. */
type TGroup = (typeof Group)[keyof typeof Group]

/** How each group is named in a report. */
const GROUP_NAMES: Record<TGroup, string> = {
  0: 'plain value',
  1: 'context read',
  2: 'state or ref',
  3: 'data or view model hook',
  4: 'derived value',
  5: 'handler',
  6: 'value built from a handler',
  7: 'effect',
}

/** Hooks that read what is around the component and hold no state of their own. */
const CONTEXT_HOOKS: ReadonlySet<string> = new Set([
  'use',
  'useBreakpoint',
  'useColorScheme',
  'useContext',
  'useDeps',
  'useExploreParams',
  'useGlobalSearchParams',
  'useHeaderHeight',
  'useId',
  'useIsFocused',
  'useLayout',
  'useLocalSearchParams',
  'useNavigation',
  'useNotify',
  'usePathname',
  'useQueryClient',
  'useReducedMotion',
  'useRoleColor',
  'useRouter',
  'useSafeAreaInsets',
  'useSegments',
  'useT',
  'useTheme',
  'useWindowDimensions',
])

/** Hooks that hold the component's own state or references. */
const STATE_HOOKS: ReadonlySet<string> = new Set([
  'useAnimatedRef',
  'useReducer',
  'useRef',
  'useSharedValue',
  'useState',
])

/** Hooks that work out a value from others. */
const DERIVED_HOOKS: ReadonlySet<string> = new Set([
  'useAnimatedStyle',
  'useDerivedValue',
  'useMemo',
])

/** Hooks that run after render. */
const EFFECT_HOOKS: ReadonlySet<string> = new Set([
  'useAnimatedReaction',
  'useEffect',
  'useFocusEffect',
  'useImperativeHandle',
  'useInsertionEffect',
  'useLayoutEffect',
])

/** How many declared names a report lists before it shortens the rest. */
const MAX_LABEL_NAMES = 2

/** A component's name: PascalCase. */
const COMPONENT_NAME = /^[A-Z]/

/** A hook's name: use, then a capital. */
const HOOK_NAME = /^use[A-Z]/

/** What the rule knows about one checked statement. */
interface IPlaced {
  /** The statement. */
  node: TStatement
  /** Where it stands among the body's statements. */
  index: number
  /** Its group once what it reads is counted. */
  group: TGroup
  /** What the report calls it: the hook it calls, or the name it declares. */
  label: string
  /** Whether a blank line sits directly above it, or above the comment directly above it. */
  blankAbove: boolean
  /** Whether a comment sits directly above it. */
  commented: boolean
}

/** The problems the rule reports. */
type TMessageId = 'blankBetween' | 'noBlankWithin' | 'order'

/** A node that has a name. */
interface INamed {
  /** The name, as written. */
  name: string
}

/** A function declaration, which may be anonymous when it is a default export. */
interface IMaybeNamed {
  /** Its name, or null when it has none. */
  id: INamed | null
}

/**
 * Hook order helpers. Static methods only.
 */
class HookOrder {
  /**
   * Whether a function is a component or a hook with a block body, the only ones checked.
   * @param fn - Any function the parser meets.
   * @returns True when its name is PascalCase or starts with use, and its body is a block.
   */
  static isChecked(fn: TFunctionNode): fn is TFunctionNode & ITyped<TFunctionNode['type']> {
    const name = HookOrder.nameOf(fn)

    if (name === undefined) return false

    return (COMPONENT_NAME.test(name) || HOOK_NAME.test(name)) && fn.body.type === 'BlockStatement'
  }

  /**
   * The name a function is known by: its own, or that of the variable it is assigned to.
   * @param fn - Any function the parser meets.
   * @returns The name, or undefined for an anonymous function.
   */
  static nameOf(fn: TFunctionNode): string | undefined {
    if (fn.type === 'FunctionDeclaration') return (fn as IMaybeNamed).id?.name

    const { parent } = fn

    if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
      return parent.id.name
    }

    return undefined
  }

  /**
   * The hook a statement calls at its top, as `const x = useX()` or `useEffect(...)`.
   * @param statement - A top-level statement of the body.
   * @returns The hook's name, or undefined when the statement calls none.
   */
  static hookOf(statement: TStatement): string | undefined {
    const call = HookOrder.topCall(statement)

    if (call?.callee.type !== 'Identifier') return undefined

    const { name } = call.callee

    return HOOK_NAME.test(name) || name === 'use' ? name : undefined
  }

  /**
   * The call at the top of a statement: an expression statement's, or a declaration's initializer.
   * @param statement - A top-level statement of the body.
   * @returns The call, or undefined when the statement is not one.
   */
  static topCall(statement: TStatement): TNodeOf<'CallExpression'> | undefined {
    if (statement.type === 'ExpressionStatement') {
      const { expression } = statement

      return expression.type === 'CallExpression'
        ? (expression as TNodeOf<'CallExpression'>)
        : undefined
    }

    if (statement.type !== 'VariableDeclaration') return undefined

    const init = statement.declarations[0]?.init

    return init?.type === 'CallExpression' ? (init as TNodeOf<'CallExpression'>) : undefined
  }

  /**
   * The group a hook belongs to by its name alone.
   * @param hook - The hook's name, such as useState.
   * @returns The group; any hook not listed is a data or view model hook.
   */
  static baseGroup(hook: string): TGroup {
    if (CONTEXT_HOOKS.has(hook)) return Group.context

    if (STATE_HOOKS.has(hook)) return Group.state

    if (DERIVED_HOOKS.has(hook)) return Group.derived

    if (hook === 'useCallback') return Group.handler

    if (EFFECT_HOOKS.has(hook)) return Group.effect

    return Group.data
  }

  /**
   * The groups of the body's earlier bindings that a statement reads, anywhere inside it.
   * @param statement - A top-level statement of the body.
   * @param scope - The function's scope, which holds the body's bindings.
   * @param groups - The group each earlier binding carries.
   * @returns The groups read, one per binding read.
   */
  static groupsRead(
    statement: TStatement,
    scope: Scope.Scope,
    groups: ReadonlyMap<Scope.Variable, TGroup>,
  ): TGroup[] {
    const [start, end] = statement.range ?? [0, 0]

    return scope.variables.flatMap((variable): TGroup[] => {
      const carried = groups.get(variable)

      if (carried === undefined) return []

      const read = variable.references.some(({ identifier }) => {
        const [from, to] = identifier.range ?? [-1, -1]

        return from >= start && to <= end
      })

      return read ? [carried] : []
    })
  }

  /**
   * A statement's group: its hook's, raised to the latest group of anything it reads. A memo that
   * reads a handler is built from it, so it comes after the handlers.
   * @param hook - The hook the statement calls, if any.
   * @param read - The groups of what it reads.
   * @returns The group it belongs to.
   */
  static effectiveGroup(hook: string | undefined, read: TGroup[]): TGroup {
    const own = hook === undefined ? Group.neutral : HookOrder.baseGroup(hook)
    const group = Math.max(own, ...read)
    const builtFromHandler = hook !== undefined && DERIVED_HOOKS.has(hook) && group >= Group.handler

    return builtFromHandler ? Math.max(group, Group.built) : group
  }

  /**
   * What a report calls a statement.
   * @param hook - The hook the statement calls, if any.
   * @param declared - The names it declares, in order.
   * @returns The declared names with the hook they come from, the hook, or "statement".
   */
  static labelOf(hook: string | undefined, declared: string[]): string {
    const names = declared.slice(0, MAX_LABEL_NAMES).join(', ')
    const more = declared.length > MAX_LABEL_NAMES ? ', …' : ''

    if (names === '') return hook ?? 'statement'

    return hook === undefined ? `${names}${more}` : `${names}${more} (${hook})`
  }

  /**
   * Whether the line above a statement, or above the comments directly above it, is blank.
   * @param statement - A top-level statement of the body.
   * @param sourceCode - The file's source.
   * @returns True when a blank line separates it from what comes before.
   */
  static blankAbove(statement: TStatement, sourceCode: Rule.RuleContext['sourceCode']): boolean {
    const [comment] = sourceCode.getCommentsBefore(statement)
    const first = comment?.loc?.start.line ?? statement.loc?.start.line ?? 1

    return (sourceCode.lines[first - 2] ?? '').trim() === ''
  }

  /**
   * Whether a placed statement takes one line.
   * @param entry - A placed statement.
   * @returns True when it starts and ends on the same line.
   */
  static singleLine(entry: IPlaced): boolean {
    return entry.node.loc?.start.line === entry.node.loc?.end.line
  }

  /**
   * Where the hook part of a body ends: after its last hook call, and never past the first
   * statement that is not a declaration or an expression. What follows is the render part (early
   * returns, JSX built in plain values, the return), which is not checked.
   * @param body - The component's or hook's body.
   * @returns The index of the first statement after the hook part.
   */
  static hooksEnd(body: TNodeOf<'BlockStatement'>): number {
    const firstOther = body.body.findIndex(
      (statement) =>
        statement.type !== 'VariableDeclaration' && statement.type !== 'ExpressionStatement',
    )

    const top = firstOther === -1 ? body.body : body.body.slice(0, firstOther)
    const lastHook = top.findLastIndex((statement) => HookOrder.hookOf(statement) !== undefined)

    return lastHook + 1
  }

  /**
   * Works out the group of every statement in the hook part of a body (see hooksEnd).
   * @param body - The component's or hook's body.
   * @param sourceCode - The file's source.
   * @returns The statements that belong to a group, in order; neutral ones are left out.
   */
  static place(
    body: TNodeOf<'BlockStatement'>,
    sourceCode: Rule.RuleContext['sourceCode'],
  ): IPlaced[] {
    const scope = sourceCode.getScope(body)
    const fnScope = scope.type === 'function' ? scope : (scope.upper ?? scope)
    const groups = new Map<Scope.Variable, TGroup>()
    const placed: IPlaced[] = []

    for (const [index, statement] of body.body.slice(0, HookOrder.hooksEnd(body)).entries()) {
      const hook = HookOrder.hookOf(statement)
      const group = HookOrder.effectiveGroup(hook, HookOrder.groupsRead(statement, fnScope, groups))
      const declared = sourceCode.getDeclaredVariables(statement)

      for (const variable of declared) groups.set(variable, group)

      if (group === Group.neutral) continue

      placed.push({
        blankAbove: HookOrder.blankAbove(statement, sourceCode),
        commented: sourceCode.getCommentsBefore(statement).length > 0,
        group,
        index,
        label: HookOrder.labelOf(
          hook,
          declared.map((variable) => variable.name),
        ),
        node: statement,
      })
    }

    return placed
  }

  /**
   * What is wrong with a statement's place, judged against the last statement in order before it.
   * @param previous - The last statement in order before it.
   * @param current - The statement being judged.
   * @returns The problem, or undefined when it stands where it should.
   */
  static problem(previous: IPlaced, current: IPlaced): TMessageId | undefined {
    if (current.group < previous.group) return 'order'

    // Spacing is only judged between statements that stand next to each other.
    if (current.index !== previous.index + 1) return undefined

    if (current.group !== previous.group) return current.blankAbove ? undefined : 'blankBetween'

    // Only declarations stack: the padding rule wants a blank line between a declaration and a
    // bare call such as useSplash(...), and this rule gives way to it.
    const stacks =
      current.group <= Group.data &&
      current.node.type === 'VariableDeclaration' &&
      previous.node.type === 'VariableDeclaration' &&
      HookOrder.singleLine(current) &&
      HookOrder.singleLine(previous)

    return stacks && current.blankAbove && !current.commented ? 'noBlankWithin' : undefined
  }
}

/**
 * Lays out the top of a component or hook body in a fixed order: context reads, state and refs,
 * data and view model hooks, derived values, handlers, values built from handlers, then effects.
 * A statement that reads something from a later group belongs to that group. Groups are split by
 * one blank line, and single-line context reads, state and data hooks stack without one.
 */
export const hookOrder: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Order the hooks of a component or hook body by group, with a blank line between groups.',
    },
    schema: [],
    messages: {
      order:
        '{{label}} is a {{group}}, so it goes before the {{previousGroup}} {{previous}}. Order: context reads, state and refs, data and view model hooks, derived values, handlers, values built from handlers, effects.',
      blankBetween: 'Leave one blank line between the {{previousGroup}}s and the {{group}}s.',
      noBlankWithin: 'Stack single-line {{group}}s without a blank line between them.',
    },
  },
  /**
   * Checks every component and hook body in a file.
   * @param context - The file being linted and the way to report on it.
   * @returns A check for each kind of function.
   */
  create(context: Rule.RuleContext): Rule.RuleListener {
    const { sourceCode } = context

    /**
     * Checks one component or hook body.
     * @param fn - Any function the parser meets; only components and hooks are checked.
     */
    const check = (fn: TFunctionNode): void => {
      if (!HookOrder.isChecked(fn) || fn.body.type !== 'BlockStatement') return

      let previous: IPlaced | undefined

      for (const current of HookOrder.place(fn.body as TNodeOf<'BlockStatement'>, sourceCode)) {
        const problem = previous === undefined ? undefined : HookOrder.problem(previous, current)

        if (previous !== undefined && problem !== undefined) {
          context.report({
            data: {
              group: GROUP_NAMES[current.group] ?? '',
              label: current.label,
              previous: previous.label,
              previousGroup: GROUP_NAMES[previous.group] ?? '',
            },
            messageId: problem,
            node: current.node,
          })
        }

        // After a statement out of order, the next one is still judged against the group before.
        if (previous === undefined || current.group >= previous.group) previous = current
      }
    }

    return {
      ArrowFunctionExpression: check,
      FunctionDeclaration: check,
      FunctionExpression: check,
    }
  },
}
