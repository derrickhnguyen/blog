import { ApolloError } from 'apollo-server'
import { InputJsonValue } from '@prisma/client'
import { arg, inputObjectType, objectType, mutationField } from '@nexus/schema'
import { Post, PostType, UserErrorType, UserError } from '../fields'
import { ContextType } from '../../contextTypes'
import { ErrorCodeEnumType } from '../enums'
import { JSON } from '../scalars'

const updateCurrentUserPostContent = async (
  parent: Record<string, unknown>,
  { input }: { input: UpdateCurrentUserPostContentInputType },
  context: ContextType,
): Promise<UpdateCurrentUserPostContentPayloadType> => {
  const { postId, postContent } = input
  const { prisma, request } = context
  const { currentUser } = request

  if (!currentUser) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.Forbidden,
      message: 'User is not logged in.',
    }

    return { successful: false, userErrors: [userError] }
  }

  const post = await prisma.post.findOne({ where: { id: Number(postId) } })

  if (!post) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.NotFound,
      message: `Cannot find post ${postId}.`,
    }

    return { successful: false, userErrors: [userError] }
  }

  const updatedPost = await prisma.post.update({
    data: { content: postContent, updatedAt: new Date().toISOString() },
    where: { id: Number(postId) },
  })

  const isPost = (post: unknown): post is PostType =>
    post && typeof post === 'object' && !!('id' in post)

  if (!isPost(updatedPost)) {
    throw new ApolloError(
      'Unable to create new user post',
      ErrorCodeEnumType.InternalServer,
    )
  }

  return { post: updatedPost, successful: true }
}

interface UpdateCurrentUserPostContentPayloadType {
  post?: PostType
  successful: boolean
  userErrors?: UserErrorType[]
}

const UpdateCurrentUserPostContentPayload = objectType({
  name: 'UpdateCurrentUserPostContentPayload',
  definition: t => {
    t.field('post', { type: Post, nullable: true })

    t.boolean('successful', {
      nullable: false,
      resolve: ({ successful }: UpdateCurrentUserPostContentPayloadType) =>
        !!successful,
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

interface UpdateCurrentUserPostContentInputType {
  postId: string
  postContent: InputJsonValue
}

const UpdateCurrentUserPostContentInput = inputObjectType({
  name: 'UpdateCurrentUserPostContentInput',
  definition: t => {
    t.id('postId', { nullable: false })

    t.field('postContent', { type: JSON, nullable: false })
  },
})

export const updateCurrentUserPostContentMutationField = mutationField(
  'updateCurrentUserPostContent',
  {
    args: {
      input: arg({ type: UpdateCurrentUserPostContentInput, nullable: false }),
    },
    resolve: updateCurrentUserPostContent,
    type: UpdateCurrentUserPostContentPayload,
  },
)
