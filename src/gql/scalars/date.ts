import { Kind } from "graphql/language/kinds";
import validator from "validator";
import { scalarType } from "@nexus/schema";

const isISO8601 = (date: string) => validator.isISO8601(date);

export const Date = scalarType({
  name: "Date",
  asNexusMethod: "date",
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING && ast.value && isISO8601(ast.value)) {
      return ast.value;
    }
    return null;
  },
  parseValue(value) {
    if (!value || !isISO8601(value)) {
      return null;
    }
    return value;
  },
  serialize(value) {
    return value;
  },
});
