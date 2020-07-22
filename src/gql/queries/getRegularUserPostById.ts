import { arg, objectType, inputObjectType, queryField } from '@nexus/schema'
import {
  RegularUserType,
  UserErrorType,
  Post,
  UserError,
  PostType,
} from '../fields'
import { ContextType } from '../../contextTypes'
import { ErrorCodeEnumType } from '../enums'

const getRegularUserPostById = async (
  parent: Record<string, unknown>,
  { input }: { input: GetRegularUserPostByIdInputType },
  context: ContextType,
): Promise<GetRegularUserPostByIdPayloadType> => {
  const { postId, userId } = input
  const { prisma } = context

  const post = await prisma.post.findOne({
    where: { authorId: userId, id: postId },
  })

  const isPost = (post: unknown): post is PostType =>
    post && typeof post === 'object' && !!('id' in post)

  if (!isPost(post)) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.NotFound,
      message: `Cannot find post ${postId} for user ${userId}.`,
    }

    return { successful: false, userErrors: [userError] }
  }

  return { successful: true }
}

interface GetRegularUserPostByIdPayloadType {
  user?: RegularUserType
  successful: boolean
  userErrors?: UserErrorType[]
}

const GetRegularUserPostByIdPayload = objectType({
  name: 'GetRegularUserPostByIdPayload',
  definition: t => {
    t.field('post', { type: Post, nullable: true })

    t.boolean('successful', {
      nullable: false,
      resolve: root => {
        const containsSuccessful = (
          root: any,
        ): root is GetRegularUserPostByIdPayloadType => !!('successful' in root)

        return containsSuccessful(root) ? root.successful : false
      },
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

interface GetRegularUserPostByIdInputType {
  userId: string
  postId: string
}

const GetRegularUserPostByIdInput = inputObjectType({
  name: 'GetRegularUserPostByIdInput',
  definition: t => {
    t.string('userId', { nullable: false })

    t.string('postId', { nullable: false })
  },
})

export const getRegularUserPostByIdQueryField = queryField(
  'getRegularUserPostById',
  {
    args: {
      input: arg({ type: GetRegularUserPostByIdInput, nullable: false }),
    },
    resolve: getRegularUserPostById,
    type: GetRegularUserPostByIdPayload,
  },
)
