import { arg, inputObjectType, interfaceType, objectType } from '@nexus/schema'
import { Email } from '../../scalars'
import { Post, PostType } from '../post'
import { ContextType } from '../../../contextTypes'
import { NodeType } from './node'

export interface UserType extends NodeType {
  firstName: string
  lastName: string
  email: string
  posts: PostType[]
}

interface UserPostsInputType {
  limit?: number
  after?: string
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
      resolve: ({ results = [] }: UserPostsType) => results,
    })

    t.int('totalResults', {
      resolve: ({ totalResults }: UserPostsType) => totalResults || 0,
    })
  },
})

export const User = interfaceType({
  name: 'User',
  definition: t => {
    t.string('firstName', {
      resolve: ({ firstName = '' }: UserType) => firstName,
    })

    t.string('lastName', {
      resolve: ({ lastName = '' }: UserType) => lastName,
    })

    t.field('email', {
      type: Email,
      resolve: ({ email = '' }: UserType) => email,
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
        { id }: UserType,
        { input }: { input: UserPostsInputType },
        context: ContextType,
      ): Promise<UserPostsType> => {
        const { prisma } = context
        const { after, limit = 10 } = input
        const cursor = after ? { id: Number(after) } : undefined

        const totalResults = await prisma.post.count({
          where: { authorId: Number(id) },
        })

        const results = ((await prisma.post.findMany({
          cursor,
          skip: cursor ? 1 : 0,
          take: limit,
          where: { authorId: Number(id) },
        })) as unknown) as PostType[]

        return { results, totalResults }
      },
    })

    t.resolveType(() => null)
  },
})
