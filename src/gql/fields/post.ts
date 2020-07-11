import { objectType } from '@nexus/schema'
import { ApolloError } from 'apollo-server'
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
      type: JSON,
    })

    t.field('createdAt', {
      type: Date,
      nullable: false,
      resolve: root => {
        const containsCreatedAt = (root: any): root is PostType =>
          !!('createdAt' in root)

        return containsCreatedAt(root) ? root.createdAt : ''
      },
    })

    t.boolean('published', {
      nullable: false,
      resolve: root => {
        const containsPublished = (root: any): root is PostType =>
          !!('published' in root)

        return containsPublished(root) ? root.published : false
      },
    })

    t.string('title', {
      nullable: false,
      resolve: root => {
        const containsTitle = (root: any): root is PostType =>
          !!('title' in root)

        return containsTitle(root) ? root.title : ''
      },
    })

    t.field('updatedAt', {
      nullable: true,
      type: Date,
    })

    t.field('author', {
      type: RegularUser,
      nullable: false,
      resolve: async (
        root,
        args: Record<string, unknown>,
        context: ContextType,
      ): Promise<PostType['author']> => {
        const containsId = (root: any): root is { id: string } =>
          !!('id' in root)

        if (!containsId(root)) {
          throw new ApolloError(
            'Unable to fetch post author. Post ID was not given.',
          )
        }

        const { id } = root
        const { prisma } = context

        const post = await prisma.post.findOne({
          where: {
            id: Number(id),
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
