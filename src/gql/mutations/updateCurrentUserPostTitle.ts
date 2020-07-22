import { ApolloError } from 'apollo-server'
import { arg, inputObjectType, objectType, mutationField } from '@nexus/schema'
import { Post, PostType, UserErrorType, UserError } from '../fields'
import { ContextType } from '../../contextTypes'
import { ErrorCodeEnumType } from '../enums'

const updateCurrentUserPostTitle = async (
  parent: Record<string, unknown>,
  { input }: { input: UpdateCurrentUserPostTitleInputType },
  context: ContextType,
): Promise<UpdateCurrentUserPostTitlePayloadType> => {
  const { postId, postTitle } = input
  const { prisma, request } = context
  const { sub } = request.user || {}

  if (!sub) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.Forbidden,
      message: 'User is not logged in.',
    }

    return { successful: false, userErrors: [userError] }
  }

  const post = await prisma.post.findOne({
    where: { id: postId, authorId: sub },
  })

  if (!post) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.NotFound,
      message: `Cannot find post ${postId}.`,
    }

    return { successful: false, userErrors: [userError] }
  }

  const updatedPost = await prisma.post.update({
    data: { title: postTitle },
    where: { id: postId },
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

interface UpdateCurrentUserPostTitlePayloadType {
  post?: PostType
  successful: boolean
  userErrors?: UserErrorType[]
}

const UpdateCurrentUserPostTitlePayload = objectType({
  name: 'UpdateCurrentUserPostTitlePayload',
  definition: t => {
    t.field('post', { type: Post, nullable: true })

    t.boolean('successful', {
      nullable: false,
      resolve: root => {
        const containsSuccessful = (
          root: any,
        ): root is UpdateCurrentUserPostTitlePayloadType =>
          !!('successful' in root)

        return containsSuccessful(root) ? root.successful : false
      },
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

interface UpdateCurrentUserPostTitleInputType {
  postId: string
  postTitle: string
}

const UpdateCurrentUserPostTitleInput = inputObjectType({
  name: 'UpdateCurrentUserPostTitleInput',
  definition: t => {
    t.id('postId', { nullable: false })
    t.string('postTitle', { nullable: false })
  },
})

export const updateCurrentUserPostTitleMutationField = mutationField(
  'updateCurrentUserPostTitle',
  {
    args: {
      input: arg({ type: UpdateCurrentUserPostTitleInput, nullable: false }),
    },
    resolve: updateCurrentUserPostTitle,
    type: UpdateCurrentUserPostTitlePayload,
  },
)
