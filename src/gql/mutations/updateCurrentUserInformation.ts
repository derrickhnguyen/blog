import { ApolloError } from 'apollo-server'
import { arg, inputObjectType, objectType, mutationField } from '@nexus/schema'
import { InputJsonValue } from '@prisma/client'
import { ErrorCodeEnumType } from '../enums'
import {
  UserError,
  UserErrorType,
  RegularUser,
  RegularUserType,
} from '../fields'
import { ContextType } from '../../contextTypes'
import { JSON } from '../scalars'

const updateCurrentUserInformation = async (
  parent: Record<string, unknown>,
  { input }: { input: UpdateCurrentUserInformationInputType },
  context: ContextType,
): Promise<UpdateCurrentUserInformationPayloadType> => {
  const { updatableCurrentUserInformation } = input
  const { firstName, lastName, bio } = updatableCurrentUserInformation
  const { prisma, request } = context
  const { currentUser } = request

  if (!currentUser) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.Forbidden,
      message: 'User is not logged in.',
    }

    return { successful: false, userErrors: [userError] }
  }

  if (bio && typeof bio === 'object') {
    await prisma.profile.update({
      where: { userId: currentUser.id },
      data: { bio: bio },
    })
  }

  const user = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      firstName: firstName || currentUser.firstName,
      lastName: lastName || currentUser.lastName,
    },
  })

  const isUser = (user: unknown): user is RegularUserType =>
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
  user?: RegularUserType
  successful: boolean
  userErrors?: UserErrorType[]
}

const UpdateCurrentUserInformationPayload = objectType({
  name: 'UpdateCurrentUserInformationPayload',
  definition: t => {
    t.field('user', { type: RegularUser, nullable: true })

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
  bio?: InputJsonValue
}

const UpdatableCurrentUserInformationInput = inputObjectType({
  name: 'UpdatableCurrentUserInformationInput',
  definition: t => {
    t.string('firstName', { nullable: true })

    t.string('lastName', { nullable: true })

    t.field('bio', { type: JSON, nullable: true })
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
