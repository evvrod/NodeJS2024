import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import { IGraphQLContext } from './GraphQLContext.js';

import { UUIDType } from './uuid.js';
import { ProfileType, IProfile } from './profile.js';
import { PostType, IPost } from './post.js';

export interface IUser {
  id: string;
  name: string;
  balance: number;
  profile?: IProfile;
  posts?: IPost[];
  userSubscribedTo?: IUser[];
  subscribedToUser?: IUser[];
}

export type IUserInput = Pick<IUser, 'id' | 'name' | 'balance'>;

export const UserType: GraphQLObjectType<IUser, IGraphQLContext> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: async (user, _args, context) => {
        return context.prisma.profile.findUnique({
          where: { userId: user.id },
          include: {
            memberType: true,
          },
        });
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (user, _args, context) => {
        return context.prisma.post.findMany({
          where: { authorId: user.id },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (user, _args, context: IGraphQLContext) => {
        return await context.prisma.subscribersOnAuthors
          .findMany({
            where: { subscriberId: user.id },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  subscribedToUser: {
                    select: {
                      subscriber: {
                        select: { id: true },
                      },
                    },
                  },
                },
              },
            },
          })
          .then((subs) => subs.map((sub) => sub.author));
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (user, _args, context: IGraphQLContext) => {
        return await context.prisma.subscribersOnAuthors
          .findMany({
            where: { authorId: user.id },
            include: {
              subscriber: {
                select: {
                  id: true,
                  name: true,
                  userSubscribedTo: {
                    select: {
                      author: {
                        select: { id: true },
                      },
                    },
                  },
                },
              },
            },
          })
          .then((subs) => subs.map((sub) => sub.subscriber));
      },
    },
  }),
});

export const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

export const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});
