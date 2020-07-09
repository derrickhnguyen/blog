import { objectType } from '@nexus/schema'
import { InputJsonValue } from '@prisma/client'
import { UserInputError } from 'apollo-server'
import { ContextType } from '../../contextTypes'
import { Node, NodeType } from './interfaces'
import { RegularUser, RegularUserType } from './regularUser'
import { Date, JSON } from '../scalars'

export interface PostType extends NodeType {
  content: InputJsonValue
  createdAt: string
  published: boolean
  title: string
  updatedAt?: string
  author: RegularUserType
}

export const Post = objectType({
  name: 'Post',
  definition: t => {
    t.implements(Node)

    t.field('content', {
      nullable: true,
      resolve: ({ content = {} }: PostType): PostType['content'] => content,
      type: JSON,
    })

    t.field('createdAt', {
      type: Date,
      nullable: false,
      resolve: ({ createdAt }: PostType): PostType['createdAt'] => createdAt,
    })

    t.boolean('published', {
      nullable: false,
      resolve: ({ published }: PostType): PostType['published'] => published,
    })

    t.string('title', {
      nullable: false,
      resolve: ({ title }: PostType): PostType['title'] => title,
    })

    t.field('updatedAt', {
      nullable: true,
      resolve: ({ updatedAt }: PostType): PostType['updatedAt'] => updatedAt,
      type: Date,
    })

    t.field('author', {
      type: RegularUser,
      nullable: false,
      resolve: async (
        { id = '' },
        args: Record<string, unknown>,
        context: ContextType,
      ): Promise<PostType['author']> => {
        const { prisma } = context

        const post = await prisma.post.findOne({
          where: {
            id,
          },
          include: {
            author: true,
          },
        })

        const author = post?.author

        const isPostAuthor = (author: unknown): author is RegularUserType =>
          author && typeof author === 'object' && !!('id' in author)

        if (!isPostAuthor(author)) {
          throw new UserInputError(
            'Invalid post id. Unable to find author of post',
            {
              invalidPostId: id,
            },
          )
        }

        return author
      },
    })
  },
})
