import { arg, mutationField, inputObjectType, objectType } from '@nexus/schema'
import { ErrorCodeEnumType } from '../enums'
import {
  CurrentUserType,
  UserErrorType,
  CurrentUser,
  UserError,
} from '../fields'
import { ContextType } from '../../contextTypes'
import { ApolloError } from 'apollo-server'

const updateCurrentUserSocialMedia = async (
  parent: Record<string, unknown>,
  { input }: { input: UpdateCurrentUserSocialMediasInputType },
  context: ContextType,
): Promise<UpdateCurrentUserSocialMediasPayloadType> => {
  const { instagramUrl, twitterUrl, facebookUrl } = input
  const { prisma, request } = context
  const { currentUser } = request

  if (!currentUser) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.Forbidden,
      message: 'User is not logged in.',
    }

    return { successful: false, userErrors: [userError] }
  }

  const profile = await prisma.profile.update({
    where: { userId: Number(currentUser.id) },
    data: {
      instagramUrl: typeof instagramUrl === 'string' ? instagramUrl : undefined,
      twitterUrl: typeof twitterUrl === 'string' ? twitterUrl : undefined,
      facebookUrl: typeof facebookUrl === 'string' ? facebookUrl : undefined,
    },
    include: { user: true },
  })

  const isCurrentUser = (user: any): user is CurrentUserType =>
    user && typeof user === 'object' && !!('id' in user)

  if (!isCurrentUser(profile.user)) {
    throw new ApolloError(
      'Unable to update current user social medias.',
      ErrorCodeEnumType.InternalServer,
    )
  }

  return { user: profile.user, successful: true }
}

interface UpdateCurrentUserSocialMediasPayloadType {
  user?: CurrentUserType
  successful: boolean
  userErrors?: UserErrorType[]
}

const UpdateCurrentUserSocialMediasPayload = objectType({
  name: 'UpdateCurrentUserSocialMediasPayload',
  definition: t => {
    t.field('user', { type: CurrentUser, nullable: true })

    t.boolean('successful', {
      nullable: false,
      resolve: root => {
        const containsSuccessful = (
          root: any,
        ): root is UpdateCurrentUserSocialMediasPayloadType =>
          !!('successful' in root)

        return containsSuccessful(root) ? root.successful : false
      },
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

interface UpdateCurrentUserSocialMediasInputType {
  facebookUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
}

const UpdateCurrentUserSocialMediasInput = inputObjectType({
  name: 'UpdateCurrentUserSocialMediasInput',
  definition: t => {
    t.string('facebookUrl', { nullable: true })

    t.string('instagramUrl', { nullable: true })

    t.string('twitterUrl', { nullable: true })
  },
})

export const updateCurrentUserSocialMediasMutationField = mutationField(
  'updateCurrentUserSocialMedias',
  {
    args: {
      input: arg({
        type: UpdateCurrentUserSocialMediasInput,
        nullable: false,
      }),
    },
    resolve: updateCurrentUserSocialMedia,
    type: UpdateCurrentUserSocialMediasPayload,
  },
)
