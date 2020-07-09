import { arg, inputObjectType, objectType, queryField } from '@nexus/schema'
import { UserError, UserErrorType, Post, PostType } from '../fields'
import { ContextType } from '../../contextTypes'
import { ErrorCodeEnumType } from '../enums'

const getCurrentUserPost = async (
  parent: Record<string, unknown>,
  { input }: { input: GetCurrentUserPostInputType },
  context: ContextType,
): Promise<GetCurrentUserPostPayloadType> => {
  const { postId } = input
  const { prisma, request } = context
  const { currentUser } = request

  if (!currentUser) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.Forbidden,
      message: 'User is not logged in.',
    }

    return { successful: false, userErrors: [userError] }
  }

  const post = await prisma.post.findOne({
    where: { authorId: Number(currentUser.id) },
  })

  const isPost = (post: unknown): post is PostType =>
    post && typeof post === 'object' && !!('id' in post)

  if (!isPost(post)) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.NotFound,
      message: `Cannot find post ${postId} for user ${currentUser.id}.`,
    }

    return { successful: false, userErrors: [userError] }
  }

  return { post, successful: true }
}

interface GetCurrentUserPostInputType {
  postId: string
}

const GetCurrentUserPostInput = inputObjectType({
  name: 'GetCurrentUserPostInput',
  definition: t => {
    t.id('postId', { nullable: false })
  },
})

interface GetCurrentUserPostPayloadType {
  post?: PostType
  successful: boolean
  userErrors?: UserErrorType[]
}

const GetCurrentUserPostPayload = objectType({
  name: 'GetCurrentUserPostPayload',
  definition: t => {
    t.field('post', { type: Post, nullable: true })

    t.boolean('successful', {
      nullable: false,
      resolve: ({ successful }: GetCurrentUserPostPayloadType) => !!successful,
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

export const getCurrentUserPostQueryField = queryField('getCurrentUserPost', {
  args: { input: arg({ type: GetCurrentUserPostInput, nullable: false }) },
  resolve: getCurrentUserPost,
  type: GetCurrentUserPostPayload,
})
