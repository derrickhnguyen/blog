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
  const { sub } = request.user

  const post = await prisma.post.findOne({
    where: { authorId: sub },
  })

  const isPost = (post: unknown): post is PostType =>
    post && typeof post === 'object' && !!('id' in post)

  if (!isPost(post)) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.NotFound,
      message: `Cannot find post ${postId} for user ${sub}.`,
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
      resolve: root => {
        const containsSuccessful = (
          root: any,
        ): root is GetCurrentUserPostPayloadType => !!('successful' in root)

        return containsSuccessful(root) ? root.successful : false
      },
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

export const getCurrentUserPostQueryField = queryField('getCurrentUserPost', {
  args: { input: arg({ type: GetCurrentUserPostInput, nullable: false }) },
  resolve: getCurrentUserPost,
  type: GetCurrentUserPostPayload,
})
