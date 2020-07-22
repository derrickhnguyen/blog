import { arg, objectType, queryField, inputObjectType } from '@nexus/schema'
import {
  RegularUserType,
  UserErrorType,
  UserError,
  RegularUser,
} from '../fields'
import { ContextType } from '../../contextTypes'
import { ErrorCodeEnumType } from '../enums'

const getRegularUserById = async (
  parent: Record<string, unknown>,
  { input }: { input: GetRegularUserByIdInputType },
  context: ContextType,
): Promise<GetRegularUserByIdPayloadType> => {
  const { userId } = input
  const { prisma } = context

  const regularUser = await prisma.user.findOne({ where: { id: userId } })

  const isRegularUser = (user: any): user is RegularUserType =>
    !!user && 'id' in user

  if (!isRegularUser(regularUser)) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.NotFound,
      message: `Cannot find user ${userId}.`,
    }

    return { successful: false, userErrors: [userError] }
  }

  return { regularUser, successful: true }
}

interface GetRegularUserByIdPayloadType {
  regularUser?: RegularUserType
  successful: boolean
  userErrors?: UserErrorType[]
}

const GetRegularUserByIdPayload = objectType({
  name: 'GetRegularUserByIdPayload',
  definition: t => {
    t.field('regularUser', { type: RegularUser, nullable: true })

    t.boolean('successful', {
      nullable: false,
      resolve: root => {
        const containsSuccessful = (
          root: any,
        ): root is GetRegularUserByIdPayloadType => !!('successful' in root)

        return containsSuccessful(root) ? root.successful : false
      },
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

interface GetRegularUserByIdInputType {
  userId: string
}

const GetRegularUserByIdInput = inputObjectType({
  name: 'GetRegularUserByIdInput',
  definition: t => {
    t.string('userId', { nullable: false })
  },
})

export const getRegularUserByIdQueryField = queryField('getRegularUserById', {
  args: {
    input: arg({ type: GetRegularUserByIdInput, nullable: false }),
  },
  resolve: getRegularUserById,
  type: GetRegularUserByIdPayload,
})
