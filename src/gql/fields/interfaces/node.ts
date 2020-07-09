import { interfaceType } from "@nexus/schema";

export interface NodeType {
  id: string;
}

export const Node = interfaceType({
  name: "Node",
  definition: (t) => {
    t.id("id", {
      resolve: ({ id }: NodeType) => id,
    });

    t.resolveType(() => null);
  },
});
