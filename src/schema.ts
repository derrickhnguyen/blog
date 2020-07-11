import path from 'path'
import { makeSchema } from '@nexus/schema'
import appRoot from 'app-root-path'
import * as queriesAndMutations from './gql'

export const schema = makeSchema({
  types: Object.values(queriesAndMutations),
  shouldGenerateArtifacts: true,
  outputs: {
    schema: path.join(appRoot.path, 'generated/schema.gen.graphql'),
    typegen: path.join(appRoot.path, 'generated/nexusTypes.gen.ts'),
  },
})
