import { objectType } from "@nexus/schema";
import { ErrorCodeEnum, ErrorCodeEnumType } from "../enums";

export interface UserErrorType {
  message: string;
  code: ErrorCodeEnumType;
}

export const UserError = objectType({
  name: "UserError",
  definition(t) {
    t.string("message");

    t.field("code", { type: ErrorCodeEnum });
  },
});
