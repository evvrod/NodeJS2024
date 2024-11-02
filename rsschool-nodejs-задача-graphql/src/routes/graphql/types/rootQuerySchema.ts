import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLResolveInfo,
} from 'graphql';
import { IGraphQLContext } from './GraphQLContext.js';

import { IUser, UserType } from './user.js';
import { PostType } from './post.js';
import { ProfileType } from './profile.js';
import { MemberTypeType, MemberTypeIdEnum } from './member.js';
import { UUIDType } from './uuid.js';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

interface ParsedInfo {
  fieldsByTypeName: {
    User?: {
      userSubscribedTo?: boolean;
      subscribedToUser?: boolean;
    };
  };
}

export const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    users: {
      type: new GraphQLList(new GraphQLNonNull(UserType)),
      resolve: async (
        _source,
        _args,
        context: IGraphQLContext,
        info: GraphQLResolveInfo,
      ) => {
        const parsedInfo: ParsedInfo | null = parseResolveInfo(info) as ParsedInfo | null;

        const includeUserSubscribedTo = Boolean(
          parsedInfo?.fieldsByTypeName?.User?.userSubscribedTo,
        );
        const includeSubscribedToUser = Boolean(
          parsedInfo?.fieldsByTypeName?.User?.subscribedToUser,
        );

        const users: IUser[] = await context.prisma.user.findMany({
          include: {
            userSubscribedTo: includeUserSubscribedTo ? true : false,
            subscribedToUser: includeSubscribedToUser ? true : false,
          },
        });

        return users.map((user) => ({
          ...user,
          userSubscribedTo: user.userSubscribedTo?.map((sub) => sub.author) || [],
          subscribedToUser: user.subscribedToUser?.map((sub) => sub.subscriber) || [],
        }));
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
      resolve: async (_source, _args, context: IGraphQLContext) => {
        return await context.prisma.post.findMany();
      },
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
