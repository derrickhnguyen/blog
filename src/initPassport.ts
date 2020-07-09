import passport from 'passport'
import FacebookTokenStrategy, {
  StrategyOptionsWithRequest,
} from 'passport-facebook-token'
import { PrismaClient, User } from '@prisma/client'

const initPassport = ({
  fbClientId,
  fbClientSecret,
  prisma,
}: {
  fbClientId: string
  fbClientSecret: string
  prisma: PrismaClient
}): void => {
  const facebookOptions: StrategyOptionsWithRequest = {
    clientID: fbClientId,
    clientSecret: fbClientSecret,
    passReqToCallback: true,
    profileFields: ['id', 'email', 'first_name', 'last_name'],
  }

  passport.use(
    new FacebookTokenStrategy(
      facebookOptions,
      async (request, accessToken, refreshToken, userProfile, done) => {
        const { emails, id, name } = userProfile
        const user = await prisma.user.findOne({ where: { facebookId: id } })

        if (user) {
          return done(null, user)
        }

        const [{ value: primaryEmail }] = emails
        const { familyName, givenName } = name

        if (!givenName || !familyName || !primaryEmail) {
          return done(
            new Error(
              'Facebook first name, last name, and/or email are missing.',
            ),
            false,
          )
        }

        const newUser = await prisma.user.create({
          data: {
            facebookId: id,
            firstName: givenName,
            lastName: familyName,
            email: primaryEmail,
          },
        })

        await prisma.profile.create({
          data: {
            bio: {},
            user: { connect: { id: newUser.id } },
          },
        })

        return done(null, newUser)
      },
    ),
  )

  passport.serializeUser<User, number>((user, done) => done(null, user.id))

  passport.deserializeUser<User, number>(async (id, done) => {
    const matchingUser = await prisma.user.findOne({
      where: {
        id,
      },
    })

    if (!matchingUser) {
      return done(new Error(`User does not exist with id ${id}`))
    }

    return done(null, matchingUser)
  })
}

export default initPassport
