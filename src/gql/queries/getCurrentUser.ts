import { objectType, queryField } from '@nexus/schema'
import { ErrorCodeEnumType } from '../enums'
import {
  CurrentUser,
  CurrentUserType,
  UserError,
  UserErrorType,
} from '../fields'
import { ContextType } from '../../contextTypes'

const getCurrentUser = async (
  parent: Record<string, unknown>,
  args: Record<string, unknown>,
  context: ContextType,
): Promise<GetCurrentUserPayloadType> => {
  const { currentUser } = context.request

  const isCurrentUserType = (user: unknown): user is CurrentUserType =>
    user && typeof user === 'object' && !!('id' in user)

  if (!isCurrentUserType(currentUser)) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.Forbidden,
      message: 'User is not logged in.',
    }

    return { successful: false, userErrors: [userError] }
  }

  return { currentUser, successful: true }
}

interface GetCurrentUserPayloadType {
  currentUser?: CurrentUserType
  userErrors?: UserErrorType[]
  successful: boolean
}

const GetCurrentUserPayload = objectType({
  name: 'GetCurrentUserPayload',
  definition: t => {
    t.field('currentUser', { type: CurrentUser, nullable: true })

    t.boolean('successful'),
      {
        nullable: false,
        resolve: ({ successful }: GetCurrentUserPayloadType) => !!successful,
      }

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

export const getCurrentUserQueryField = queryField('getCurrentUser', {
  resolve: getCurrentUser,
  type: GetCurrentUserPayload,
})
