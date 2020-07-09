import { scalarType } from '@nexus/schema'
import GraphQLJSON from 'graphql-type-json'

export const JSON = scalarType({
  ...GraphQLJSON,
  name: 'JSON',
})
