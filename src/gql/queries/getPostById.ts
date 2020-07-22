import { arg, objectType, inputObjectType, queryField } from '@nexus/schema'
import { PostType, UserErrorType, Post, UserError } from '../fields'
import { ContextType } from '../../contextTypes'
import { ErrorCodeEnumType } from '../enums'

const getPostById = async (
  parent: Record<string, unknown>,
  { input }: { input: GetPostByIdInputType },
  context: ContextType,
): Promise<GetPostByIdPayloadType> => {
  const { postId } = input
  const { prisma } = context

  const post = await prisma.post.findOne({
    where: { id: postId },
  })

  const isPost = (post: unknown): post is PostType =>
    post && typeof post === 'object' && !!('id' in post)

  if (!isPost(post)) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.NotFound,
      message: `Cannot find post ${postId}.`,
    }

    return { successful: false, userErrors: [userError] }
  }

  return { post, successful: true }
}

interface GetPostByIdPayloadType {
  post?: PostType
  successful: boolean
  userErrors?: UserErrorType[]
}

const GetPostByIdPayload = objectType({
  name: 'GetPostByIdPayload',
  definition: t => {
    t.field('post', { type: Post, nullable: true })

    t.boolean('successful', {
      nullable: false,
      resolve: root => {
        const containsSuccessful = (
          root: any,
        ): root is GetPostByIdPayloadType => !!('successful' in root)

        return containsSuccessful(root) ? root.successful : false
      },
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

interface GetPostByIdInputType {
  postId: string
}

const GetPostByIdInput = inputObjectType({
  name: 'GetPostByIdInput',
  definition: t => {
    t.string('postId', { nullable: false })
  },
})

export const getPostByIdQueryField = queryField('getPostById', {
  args: {
    input: arg({ type: GetPostByIdInput, nullable: false }),
  },
  resolve: getPostById,
  type: GetPostByIdPayload,
})
