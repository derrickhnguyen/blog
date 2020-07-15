import { ApolloError } from 'apollo-server'
import { arg, inputObjectType, objectType, mutationField } from '@nexus/schema'
import { ErrorCodeEnumType } from '../enums'
import {
  CurrentUser,
  CurrentUserType,
  UserError,
  UserErrorType,
} from '../fields'
import { ContextType } from '../../contextTypes'

const updateCurrentUserInformation = async (
  parent: Record<string, unknown>,
  { input }: { input: UpdateCurrentUserInformationInputType },
  context: ContextType,
): Promise<UpdateCurrentUserInformationPayloadType> => {
  const { updatableCurrentUserInformation } = input
  const {
    firstName,
    lastName,
    bio,
    profileImageUrl,
  } = updatableCurrentUserInformation

  const { prisma, request } = context
  const { currentUser } = request

  if (!currentUser) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.Forbidden,
      message: 'User is not logged in.',
    }

    return { successful: false, userErrors: [userError] }
  }

  const [user] = await Promise.all([
    prisma.user.update({
      where: { id: currentUser.id },
      data: {
        firstName: firstName || currentUser.firstName,
        lastName: lastName || currentUser.lastName,
      },
    }),
    bio
      ? prisma.profile.update({
          where: { userId: currentUser.id },
          data: { bio },
        })
      : undefined,
    profileImageUrl
      ? prisma.profile.update({
          where: { userId: currentUser.id },
          data: { profileImageUrl },
        })
      : undefined,
  ])

  const isUser = (user: unknown): user is CurrentUserType =>
    user && typeof user === 'object' && !!('id' in user)

  if (!isUser(user)) {
    throw new ApolloError(
      'Unable to update user information',
      ErrorCodeEnumType.InternalServer,
    )
  }

  return { user, successful: true }
}

interface UpdateCurrentUserInformationPayloadType {
  user?: CurrentUserType
  successful: boolean
  userErrors?: UserErrorType[]
}

const UpdateCurrentUserInformationPayload = objectType({
  name: 'UpdateCurrentUserInformationPayload',
  definition: t => {
    t.field('user', { type: CurrentUser, nullable: true })

    t.boolean('successful', {
      nullable: false,
      resolve: root => {
        const containsSuccessful = (
          root: any,
        ): root is UpdateCurrentUserInformationPayloadType =>
          !!('successful' in root)

        return containsSuccessful(root) ? root.successful : false
      },
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

interface CurrentUserInformationType {
  firstName?: string | null
  lastName?: string | null
  bio?: string | null
  profileImageUrl?: string | null
}

const UpdatableCurrentUserInformationInput = inputObjectType({
  name: 'UpdatableCurrentUserInformationInput',
  definition: t => {
    t.string('firstName', { nullable: true })

    t.string('lastName', { nullable: true })

    t.string('bio', { nullable: true })

    t.string('profileImageUrl', { nullable: true })
  },
})

interface UpdateCurrentUserInformationInputType {
  updatableCurrentUserInformation: CurrentUserInformationType
}

const UpdateCurrentUserInformationInput = inputObjectType({
  name: 'UpdateCurrentUserInformationInput',
  definition: t => {
    t.field('updatableCurrentUserInformation', {
      type: UpdatableCurrentUserInformationInput,
      nullable: false,
    })
  },
})

export const updateCurrentUserInformationMutationField = mutationField(
  'updateCurrentUserInformation',
  {
    args: {
      input: arg({ type: UpdateCurrentUserInformationInput, nullable: false }),
    },
    resolve: updateCurrentUserInformation,
    type: UpdateCurrentUserInformationPayload,
  },
)