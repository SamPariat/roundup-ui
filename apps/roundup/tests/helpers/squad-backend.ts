import { HttpStatus } from '@roundup/core'

/** The signed-in person the stubbed backend knows. */
const ME = 'u1'

/** A member of a stubbed squad. */
export interface IStubMember {
  /** The user's ID. */
  id: string
  /** The user's name. */
  name: string
  /** Their role in the squad. */
  role: 'ADMIN' | 'MEMBER'
}

/** A squad the stubbed backend holds. */
export interface IStubSquad {
  /** The squad's ID. */
  id: string
  /** The squad's name. */
  name: string
  /** Its members, which include the signed-in person, ID `u1`, when they are in it. */
  members: IStubMember[]
}

/** A person the contacts lookup can find. */
interface IStubUser {
  /** The user's ID. */
  id: string
  /** The user's name. */
  name: string
  /** The number in E.164. */
  phone: string
}

/** What the squad routes need from the test's backend. */
export interface ISquadState {
  /** The squads on the "server"; the routes change it. */
  squads?: IStubSquad[]
  /** The people the lookup finds. */
  lookup?: IStubUser[]
}

/** The page size the app asks for. */
const PAGE = 25

/**
 * Stubbed squad routes over the squads a test gives. State lives in the backend object, so a
 * test sees what the app changed. Static methods only.
 */
export class SquadBackend {
  /**
   * Answers a squad, member or lookup request.
   * @param method - The request method.
   * @param path - The path with its query.
   * @param body - The parsed request body, if any.
   * @param state - The squads and lookup users.
   * @returns The response, or undefined when the path is not a squad route.
   */
  static answer(
    method: string,
    path: string,
    body: Record<string, string> | undefined,
    state: ISquadState,
  ): Response | undefined {
    const squads = (state.squads ??= [])
    const [pathname = '', query = ''] = path.split('?')

    if (pathname === '/api/v1/users/lookup') return SquadBackend.lookup(body, state)

    if (!pathname.startsWith('/api/v1/squads')) return undefined

    const [id, section, userId] = pathname.replace('/api/v1/squads', '').split('/').slice(1)

    if (id === undefined) {
      return method === 'POST'
        ? SquadBackend.create(squads, body?.['name'] ?? '')
        : SquadBackend.list(squads, new URLSearchParams(query))
    }

    const squad = squads.find((candidate) => candidate.id === id)

    if (squad === undefined) return SquadBackend.failure(HttpStatus.notFound)

    if (section === undefined) return SquadBackend.one(method, squad, body)

    return SquadBackend.members(method, { body, squad, squads, state, userId })
  }

  /**
   * Builds the success envelope.
   * @param data - The payload.
   * @param status - The HTTP status.
   * @returns The response.
   */
  private static ok(data: unknown, status: number = HttpStatus.ok): Response {
    return Response.json({ data, success: true }, { status })
  }

  /**
   * Builds the failure envelope.
   * @param status - The HTTP status.
   * @returns The response.
   */
  private static failure(status: number): Response {
    return Response.json({ error: 'nope', success: false }, { status })
  }

  /**
   * Builds a member as the API sends one.
   * @param member - The stubbed member.
   * @returns The API member.
   */
  private static member(member: IStubMember): Record<string, string> {
    return {
      avatarURL: '',
      joinedAt: '2026-01-01T00:00:00Z',
      name: member.name,
      role: member.role,
      userID: member.id,
    }
  }

  /**
   * Builds a list item for a squad, from the signed-in person's point of view.
   * @param squad - The stubbed squad.
   * @returns The list item.
   */
  private static summary(squad: IStubSquad): Record<string, unknown> {
    return {
      avatarURL: '',
      createdAt: '2026-01-01T10:00:00Z',
      createdBy: ME,
      id: squad.id,
      memberCount: squad.members.length,
      memberPreview: squad.members.slice(0, 4).map((member) => SquadBackend.member(member)),
      name: squad.name,
      role: squad.members.find((member) => member.id === ME)?.role ?? 'MEMBER',
    }
  }

  /**
   * Answers the squad list one page at a time; the cursor is the index the page starts at.
   * @param squads - Every squad.
   * @param query - The request's query.
   * @returns The page.
   */
  private static list(squads: IStubSquad[], query: URLSearchParams): Response {
    const start = Number(query.get('cursor') ?? 0)
    const end = start + PAGE

    return SquadBackend.ok({
      nextCursor: end < squads.length ? String(end) : null,
      squads: squads.slice(start, end).map((squad) => SquadBackend.summary(squad)),
    })
  }

  /**
   * Makes a squad with the signed-in person as its only member and admin.
   * @param squads - Every squad; the new one is added.
   * @param name - The new squad's name.
   * @returns The created squad.
   */
  private static create(squads: IStubSquad[], name: string): Response {
    const squad: IStubSquad = {
      id: `new-${squads.length + 1}`,
      members: [{ id: ME, name: 'Asha Rao', role: 'ADMIN' }],
      name,
    }

    squads.unshift(squad)

    return SquadBackend.ok(SquadBackend.summary(squad), HttpStatus.created)
  }

  /**
   * Answers a read or a rename of one squad.
   * @param method - GET or PATCH.
   * @param squad - The squad to read or rename.
   * @param body - Holds the new name on a rename.
   * @returns The squad's detail, or its list item after a rename.
   */
  private static one(
    method: string,
    squad: IStubSquad,
    body: Record<string, string> | undefined,
  ): Response {
    if (method === 'PATCH') {
      squad.name = body?.['name'] ?? squad.name

      return SquadBackend.ok(SquadBackend.summary(squad))
    }

    const admin = squad.members.some((member) => member.id === ME && member.role === 'ADMIN')

    return SquadBackend.ok({
      ...SquadBackend.summary(squad),
      createdByName: 'Asha Rao',
      members: squad.members.map((member) => ({
        ...SquadBackend.member(member),
        isMe: member.id === ME,
      })),
      myRole: admin ? 'ADMIN' : 'MEMBER',
      permissions: {
        canAddMembers: admin,
        canChangeRoles: admin,
        canEditSquad: admin,
        canRemoveMembers: admin,
      },
    })
  }

  /**
   * Answers the member routes: add, change role and remove.
   * @param method - POST, PATCH or DELETE.
   * @param context - The squad, the squads it sits among, the lookup users, the body and the member.
   * @param context.body - The parsed request body.
   * @param context.squad - The squad the member belongs to.
   * @param context.squads - Every squad; an emptied one is dropped.
   * @param context.state - The lookup users.
   * @param context.userId - The member in the path, if any.
   * @returns The response.
   */
  private static members(
    method: string,
    context: {
      /** The parsed request body. */
      body: Record<string, string> | undefined
      /** The squad. */
      squad: IStubSquad
      /** Every squad. */
      squads: IStubSquad[]
      /** The lookup users. */
      state: ISquadState
      /** The member in the path. */
      userId: string | undefined
    },
  ): Response {
    const { body, squad, squads, state, userId } = context

    if (method === 'POST') {
      const user = state.lookup?.find((candidate) => candidate.phone === body?.['phone'])

      if (user === undefined) return SquadBackend.failure(HttpStatus.notFound)

      const member: IStubMember = { id: user.id, name: user.name, role: 'MEMBER' }

      squad.members.push(member)

      return SquadBackend.ok(SquadBackend.member(member), HttpStatus.created)
    }

    const target = squad.members.find((member) => member.id === userId)

    if (target === undefined) return SquadBackend.failure(HttpStatus.notFound)

    if (method === 'PATCH') {
      target.role = body?.['role'] === 'ADMIN' ? 'ADMIN' : 'MEMBER'
    } else {
      squad.members = squad.members.filter((member) => member.id !== userId)

      if (squad.members.length === 0) squads.splice(squads.indexOf(squad), 1)
    }

    return new Response(null, { status: HttpStatus.noContent })
  }

  /**
   * Answers the contacts lookup with the stubbed users whose number was asked about.
   * @param body - The request body with the phones.
   * @param state - The lookup users.
   * @returns The users found.
   */
  private static lookup(body: Record<string, unknown> | undefined, state: ISquadState): Response {
    const phones = (body?.['phones'] ?? []) as string[]

    return SquadBackend.ok({
      users: (state.lookup ?? [])
        .filter((user) => phones.includes(user.phone))
        .map((user) => ({ avatarURL: '', ...user })),
    })
  }
}
