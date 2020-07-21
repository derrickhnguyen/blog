import { ApolloError } from 'apollo-server'
import { objectType, mutationField } from '@nexus/schema'
import { ErrorCodeEnumType } from '../enums'
import { Post, PostType, UserError, UserErrorType } from '../fields'
import { ContextType } from '../../contextTypes'

const createCurrentUserPost = async (
  parent: Record<string, unknown>,
  args: Record<string, unknown>,
  context: ContextType,
): Promise<CreateCurrentUserPostPayloadType> => {
  const { prisma, request } = context
  const { sub } = request.user

  const newPost = await prisma.post.create({
    data: { author: { connect: { id: sub } } },
  })

  const isNewPost = (post: unknown): post is PostType =>
    post && typeof post === 'object' && !!('id' in post)

  if (!isNewPost(newPost)) {
    throw new ApolloError(
      'Unable to create new user post',
      ErrorCodeEnumType.InternalServer,
    )
  }

  return { post: newPost, successful: true }
}

interface CreateCurrentUserPostPayloadType {
  post?: PostType
  userErrors?: UserErrorType[]
  successful: boolean
}

const CreateCurrentUserPostPayload = objectType({
  name: 'CreateCurrentUserPostPayload',
  definition: t => {
    t.field('post', { type: Post, nullable: true })

    t.boolean('successful', {
      nullable: false,
      resolve: root => {
        const containsSuccessful = (
          root: any,
        ): root is CreateCurrentUserPostPayloadType => !!('successful' in root)

        return containsSuccessful(root) ? root.successful : false
      },
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

export const createCurrentUserPostMutationField = mutationField(
  'createCurrentUserPost',
  {
    resolve: createCurrentUserPost,
    type: CreateCurrentUserPostPayload,
  },
)
