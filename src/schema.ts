import { makeSchema } from "@nexus/schema";
import * as queriesAndMutations from "./gql";

export const schema = makeSchema({ types: Object.values(queriesAndMutations) });
