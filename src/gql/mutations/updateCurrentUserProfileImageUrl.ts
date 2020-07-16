import { arg, inputObjectType, objectType, mutationField } from '@nexus/schema'
import {
  CurrentUser,
  CurrentUserType,
  UserErrorType,
  UserError,
} from '../fields'
import { ContextType } from '../../contextTypes'
import { ErrorCodeEnumType } from '../enums'
import { ApolloError } from 'apollo-server'

const updateCurrentUserProfileImageUrl = async (
  parent: Record<string, unknown>,
  { input }: { input: UpdateCurrentUserProfileImageUrlInputType },
  context: ContextType,
): Promise<UpdateCurrentUserProfileImageUrlPayload> => {
  const { profileImageUrl } = input
  const { cloudinary, prisma, request } = context
  const { currentUser } = request

  if (!currentUser) {
    const userError: UserErrorType = {
      code: ErrorCodeEnumType.Forbidden,
      message: 'User is not logged in.',
    }

    return { successful: false, userErrors: [userError] }
  }

  const profile = await prisma.profile.findOne({
    where: { userId: Number(currentUser.id) },
  })

  if (profile?.profileImageUrl) {
    const urlPaths = profile.profileImageUrl.split('/')
    const publicId = urlPaths[urlPaths.length - 1].split('.')[0]

    const { result } = await cloudinary.uploader.destroy(`blogr/${publicId}`)

    if (result !== 'ok') {
      throw new ApolloError(
        'Unable to destroy current user profile image.',
        ErrorCodeEnumType.InternalServer,
      )
    }
  }

  const updatedProfile = await prisma.profile.update({
    where: { userId: Number(currentUser.id) },
    data: { profileImageUrl },
    include: { user: true },
  })

  const isCurrentUser = (user: unknown): user is CurrentUserType =>
    user && typeof user === 'object' && !!('id' in user)

  if (!isCurrentUser(updatedProfile.user)) {
    throw new ApolloError(
      'Unable to update current user profile image url.',
      ErrorCodeEnumType.InternalServer,
    )
  }

  return { user: updatedProfile.user, successful: true }
}

interface UpdateCurrentUserProfileImageUrlPayload {
  user?: CurrentUserType
  successful: boolean
  userErrors?: UserErrorType[]
}

const UpdateCurrentUserProfileImageUrlPayload = objectType({
  name: 'UpdateCurrentUserProfileImageUrlPayload',
  definition: t => {
    t.field('user', { type: CurrentUser, nullable: true })

    t.boolean('successful', {
      nullable: false,
      resolve: root => {
        const containsSuccessful = (
          root: any,
        ): root is UpdateCurrentUserProfileImageUrlPayload =>
          !!('successful' in root)

        return containsSuccessful(root) ? root.successful : false
      },
    })

    t.list.field('userErrors', { type: UserError, nullable: true })
  },
})

interface UpdateCurrentUserProfileImageUrlInputType {
  profileImageUrl: string
}

const UpdateCurrentUserProfileImageUrlInput = inputObjectType({
  name: 'UpdateCurrentUserProfileImageUrlInput',
  definition: t => {
    t.string('profileImageUrl', { nullable: false })
  },
})

export const updateCurrentUserProfileImageUrlMutationField = mutationField(
  'updateCurrentUserProfileImageUrl',
  {
    args: {
      input: arg({
        type: UpdateCurrentUserProfileImageUrlInput,
        nullable: false,
      }),
    },
    resolve: updateCurrentUserProfileImageUrl,
    type: UpdateCurrentUserProfileImageUrlPayload,
  },
)
