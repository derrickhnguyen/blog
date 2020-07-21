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
  const { firstName, lastName, bio } = updatableCurrentUserInformation
  const { prisma, request } = context
  const { sub } = request.user

  const [currentUser] = await Promise.all([
    prisma.user.update({
      where: { id: sub },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      },
    }),
    typeof bio === 'string'
      ? prisma.profile.update({
          where: { userId: sub },
          data: { bio },
        })
      : undefined,
  ])

  const isUser = (user: unknown): user is CurrentUserType =>
    user && typeof user === 'object' && !!('id' in user)

  if (!isUser(currentUser)) {
    throw new ApolloError(
      'Unable to update user information',
      ErrorCodeEnumType.InternalServer,
    )
  }

  return { user: currentUser, successful: true }
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
}

const UpdatableCurrentUserInformationInput = inputObjectType({
  name: 'UpdatableCurrentUserInformationInput',
  definition: t => {
    t.string('firstName', { nullable: true })

    t.string('lastName', { nullable: true })

    t.string('bio', { nullable: true })
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
