import { scalarType } from "@nexus/schema";
import { Kind } from "graphql/language/kinds";
import validator from "validator";

const isEmail = (value = "") => validator.isEmail(value);

export const Email = scalarType({
  name: "Email",
  parseValue: (value) => {
    if (isEmail(value)) {
      return value;
    }

    return null;
  },
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING && ast.value && isEmail(ast.value)) {
      return ast.value;
    }

    return null;
  },
  serialize: (value) => value,
});
