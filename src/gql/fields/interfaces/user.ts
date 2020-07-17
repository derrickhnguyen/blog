import { arg, inputObjectType, interfaceType, objectType } from '@nexus/schema'
import { ApolloError } from 'apollo-server'
import { enumType } from '@nexus/schema'
import { Email } from '../../scalars'
import { ErrorCodeEnumType } from '../../enums'
import { PaginationCursors, PaginationCursorsType } from '../paginationCursors'
import { Post, PostType } from '../post'
import { ContextType } from '../../../contextTypes'
import { NodeType } from './node'
import { UserErrorType, UserError } from '../userError'

export interface UserType extends NodeType {
  firstName: string
  lastName: string
  email: string
  posts: PostType[]
}

enum UserPostsOrderByEnumType {
  CreatedAtAscending = 'CreatedAtAscending',
  CreatedAtDescending = 'CreatedAtDescending',
}

const UserPostsOrderByEnum = enumType({
  name: 'UserPostsOrderByEnum',
  members: ['CreatedAtAscending', 'CreatedAtDescending'],
})

const UserPostsInput = inputObjectType({
  name: 'UserPostsInput',
  definition: t => {
    t.int('limit', { default: 10 })

    t.string('after', { nullable: true })

    t.string('before', { nullable: true })

    t.field('orderBy', {
      type: UserPostsOrderByEnum,
      nullable: true,
      default: 'CreatedAtDescending',
    })
  },
})

const orderByMap = {
  [UserPostsOrderByEnumType.CreatedAtAscending]: 'asc',
  [UserPostsOrderByEnumType.CreatedAtDescending]: 'desc',
} as const

interface UserPostsType {
  results: PostType[]
  totalResults: number
  userErrors?: UserErrorType[]
  paginationCursors: PaginationCursorsType
}

const UserPosts = objectType({
  name: 'UserPosts',
  definition: t => {
    t.list.field('results', {
      type: Post,
      resolve: root => {
        const containsPostResults = (root: any): root is UserPostsType =>
          !!('results' in root)

        return containsPostResults(root) ? root.results : []
      },
    })

    t.int('totalResults', {
      resolve: root => {
        const containsTotalResults = (root: any): root is UserPostsType =>
          !!('totalResults' in root)

        return containsTotalResults(root) ? root.totalResults : 0
      },
    })

    t.field('paginationCursors', {
      type: PaginationCursors,
      resolve: root => {
        const containsPaginationCursors = (root: any): root is UserPostsType =>
          !!('paginationCursors' in root)

        return containsPaginationCursors(root) ? root.paginationCursors : {}
      },
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

interface UserProfileType {
  bio: string
  profileImageUrl?: string
}

const UserProfile = objectType({
  name: 'UserProfile',
  definition: t => {
    t.string('bio', {
      nullable: false,
      resolve: root => {
        const containsBio = (root: any): root is UserProfileType =>
          typeof root.bio === 'string'

        return containsBio(root) ? root.bio : ''
      },
    })

    t.string('profileImageUrl', { nullable: true })
  },
})

export const User = interfaceType({
  name: 'User',
  definition: t => {
    t.string('firstName', {
      resolve: root => {
        const containsFirstName = (root: any): root is UserType =>
          !!('firstName' in root)

        return containsFirstName(root) ? root.firstName : ''
      },
    })

    t.string('lastName', {
      resolve: root => {
        const containsLastName = (root: any): root is UserType =>
          !!('lastName' in root)

        return containsLastName(root) ? root.lastName : ''
      },
    })

    t.field('email', {
      type: Email,
      resolve: root => {
        const containsEmail = (root: any): root is UserType =>
          !!('email' in root)

        return containsEmail(root) ? root.email : ''
      },
    })

    t.field('posts', {
      type: UserPosts,
      args: {
        input: arg({
          nullable: true,
          type: UserPostsInput,
        }),
      },
      resolve: async (
        root,
        { input },
        context: ContextType,
      ): Promise<UserPostsType> => {
        const containsId = (root: any): root is { id: string } =>
          !!('id' in root)

        if (!containsId(root)) {
          throw new ApolloError(
            'Unable to fetch user posts. User ID was not given.',
          )
        }

        const { id } = root
        const { prisma } = context
        const {
          after,
          before,
          limit = 10,
          orderBy = UserPostsOrderByEnumType.CreatedAtDescending,
        } = input || {}

        if (after && before) {
          const userError: UserErrorType = {
            code: ErrorCodeEnumType.BadRequest,
            message:
              'Both after and before arguments were provided. Only one can be provided at a time.',
          }

          return {
            results: [],
            totalResults: 0,
            paginationCursors: {},
            userErrors: [userError],
          }
        }

        if (limit === null) {
          throw new ApolloError('WTF TypeScript')
        }

        const cursor =
          before || after ? { id: Number(before || after) } : undefined

        const totalResults = await prisma.post.count({
          where: { authorId: Number(id) },
        })

        const take = before ? limit * -1 : limit

        const firstPosts = ((await prisma.post.findMany({
          take: 1,
          where: { authorId: Number(id) },
          orderBy: { createdAt: orderBy ? orderByMap[orderBy] : null },
        })) as unknown) as PostType[]

        const results = ((await prisma.post.findMany({
          cursor,
          skip: cursor ? 1 : 0,
          take,
          where: { authorId: Number(id) },
          orderBy: { createdAt: orderBy ? orderByMap[orderBy] : null },
        })) as unknown) as PostType[]

        const startCursor =
          firstPosts[0]?.id === results[0]?.id
            ? undefined
            : String(results[0]?.id)
        const endCursor =
          results.length === limit
            ? String(results[results.length - 1]?.id)
            : undefined

        const paginationCursors = { startCursor, endCursor }

        return { results, totalResults, paginationCursors }
      },
    })

    t.field('profile', {
      type: UserProfile,
      resolve: async (
        root,
        args: Record<string, unknown>,
        context: ContextType,
      ): Promise<UserProfileType> => {
        const containsId = (root: any): root is { id: string } =>
          !!('id' in root)

        if (!containsId(root)) {
          throw new ApolloError(
            'Unable to fetch user profile. User ID was not given.',
          )
        }

        const { id } = root
        const { prisma } = context
        const userProfile = await prisma.profile.findOne({
          where: { userId: Number(id) },
          select: { bio: true, profileImageUrl: true },
        })

        const isUserProfile = (profile: unknown): profile is UserProfileType =>
          profile && typeof profile === 'object'

        if (!isUserProfile(userProfile)) {
          throw new ApolloError(
            'Unable to get user profile',
            ErrorCodeEnumType.InternalServer,
          )
        }

        return userProfile
      },
    })

    t.resolveType(() => null)
  },
})
