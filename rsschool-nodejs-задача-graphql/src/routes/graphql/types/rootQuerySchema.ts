import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import { IGraphQLContext } from './GraphQLContext.js';

import { UserType } from './user.js';
import { PostType } from './post.js';
import { ProfileType } from './profile.js';
import { MemberTypeType, MemberTypeIdEnum } from './member.js';
import { UUIDType } from './uuid.js';

export const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    users: {
      type: new GraphQLList(new GraphQLNonNull(UserType)),
      resolve: async (_source, _args, context: IGraphQLContext) => {
        return await context.prisma.user.findMany();
      },
    },
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, args: { id: string }, context: IGraphQLContext) => {
        return await context.prisma.user.findUnique({
          where: { id: args.id },
        });
      },
    },
    posts: {
      type: new GraphQLList(new GraphQLNonNull(PostType)),
      resolve: async (_source, _args, context: IGraphQLContext) =>
        await context.prisma.post.findMany(),
    },
    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, args: { id: string }, context: IGraphQLContext) => {
        const { id } = args;
        return await context.prisma.post.findUnique({ where: { id } });
      },
    },
    profiles: {
      type: new GraphQLList(new GraphQLNonNull(ProfileType)),
      resolve: async (_source, _args, context: IGraphQLContext) =>
        await context.prisma.profile.findMany(),
    },
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, args: { id: string }, context: IGraphQLContext) => {
        const { id } = args;
        return await context.prisma.profile.findUnique({ where: { id } });
      },
    },
    memberTypes: {
      type: new GraphQLList(new GraphQLNonNull(MemberTypeType)),
      resolve: async (_source, _args, context: IGraphQLContext) =>
        await context.prisma.memberType.findMany(),
    },
    memberType: {
      type: MemberTypeType,
      args: { id: { type: new GraphQLNonNull(MemberTypeIdEnum) } },
      resolve: async (_source, args: { id: string }, context: IGraphQLContext) => {
        const { id } = args;
        return await context.prisma.memberType.findUnique({ where: { id } });
      },
    },
  },
});
