import { mutationField, arg, inputObjectType, objectType } from '@nexus/schema'
import { Post, UserErrorType, PostType, UserError } from '../fields'
import { ContextType } from '../../contextTypes'
import { ErrorCodeEnumType } from '../enums'
import { ApolloError } from 'apollo-server'

const updateCurrentUserPostHeaderImageUrl = async (
  parent: Record<string, unknown>,
  { input }: { input: UpdateCurrentUserPostHeaderImageUrlInputType },
  context: ContextType,
): Promise<UpdateCurrentUserPostHeaderImagePayloadType> => {
  const { postId, headerImageUrl } = input
  const { prisma, request } = context
  const { currentUser } = request

  if (!currentUser) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.Forbidden,
      message: 'User is not logged in.',
    }

    return { successful: false, userErrors: [userError] }
  }

  const post = await prisma.post.findOne({ where: { id: postId } })

  if (!post) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.NotFound,
      message: `Cannot find post ${postId}.`,
    }

    return { successful: false, userErrors: [userError] }
  }

  const updatedPost = await prisma.post.update({
    data: { headerImageUrl },
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

interface UpdateCurrentUserPostHeaderImagePayloadType {
  post?: PostType
  successful: boolean
  userErrors?: UserErrorType[]
}

const UpdateCurrentUserPostHeaderImagePayload = objectType({
  name: 'UpdateCurrentUserPostHeaderImagePayload',
  definition: t => {
    t.field('post', { type: Post, nullable: true })

    t.boolean('successful', {
      nullable: false,
      resolve: root => {
        const containsSuccessful = (
          root: any,
        ): root is UpdateCurrentUserPostHeaderImagePayloadType =>
          !!('successful' in root)

        return containsSuccessful(root) ? root.successful : false
      },
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

interface UpdateCurrentUserPostHeaderImageUrlInputType {
  postId: string
  headerImageUrl: string
}

const UpdateCurrentUserPostHeaderImageUrlInput = inputObjectType({
  name: 'UpdateCurrentUserPostHeaderImageUrlInput',
  definition: t => {
    t.id('postId', { nullable: false })

    t.string('headerImageUrl', { nullable: false })
  },
})

export const updateCurrentUserPostHeaderImageUrlMutationField = mutationField(
  'updateCurrentUserPostHeaderImageUrl',
  {
    args: {
      input: arg({
        type: UpdateCurrentUserPostHeaderImageUrlInput,
        nullable: false,
      }),
    },
    resolve: updateCurrentUserPostHeaderImageUrl,
    type: UpdateCurrentUserPostHeaderImagePayload,
  },
)
