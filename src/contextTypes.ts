import { PrismaClient } from "@prisma/client";
import { ContextParameters } from "graphql-yoga/dist/types";
import { CurrentUserType } from "./gql/fields";

export interface ContextType extends ContextParameters {
  prisma: PrismaClient;
  request: any;
}
