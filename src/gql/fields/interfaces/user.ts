import { arg, inputObjectType, interfaceType, objectType } from '@nexus/schema'
import { ApolloError } from 'apollo-server'
import { Email } from '../../scalars'
import { ErrorCodeEnumType } from '../../enums'
import { Post, PostType } from '../post'
import { ContextType } from '../../../contextTypes'
import { NodeType } from './node'

export interface UserType extends NodeType {
  firstName: string
  lastName: string
  email: string
  posts: PostType[]
}

const UserPostsInput = inputObjectType({
  name: 'UserPostsInput',
  definition: t => {
    t.int('limit', { default: 10 })

    t.string('after')
  },
})

interface UserPostsType {
  results: PostType[]
  totalResults: number
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
          default: { limit: 10 },
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
        const { after, limit = 10 } = input || {}
        const cursor = after ? { id: Number(after) } : undefined

        const totalResults = await prisma.post.count({
          where: { authorId: Number(id) },
        })

        const results = ((await prisma.post.findMany({
          cursor,
          skip: cursor ? 1 : 0,
          take: limit === null ? undefined : limit,
          where: { authorId: Number(id) },
        })) as unknown) as PostType[]

        return { results, totalResults }
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
