import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { IGraphQLContext } from './GraphQLContext.js';
import { UUIDType } from './uuid.js';
import {
  IUserInput,
  UserType,
  CreateUserInputType,
  ChangeUserInputType,
} from './user.js';
import {
  IProfileInput,
  ProfileType,
  CreateProfileInputType,
  ChangeProfileInputType,
} from './profile.js';
import {
  IPostInput,
  PostType,
  CreatePostInputType,
  ChangePostInputType,
} from './post.js';

export const Mutations = new GraphQLObjectType({
  name: 'Mutations',
  fields: {
    createUser: {
      type: UserType,
      args: { dto: { type: CreateUserInputType } },
      resolve: async (_source, args: { dto: IUserInput }, context: IGraphQLContext) => {
        const { dto } = args;
        return await context.prisma.user.create({ data: dto });
      },
    },
    deleteUser: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, args: { id: string }, context: IGraphQLContext) => {
        const { id } = args;
        await context.prisma.user.delete({ where: { id } });
        return 'User deleted';
      },
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInputType) },
      },
      resolve: async (
        _source,
        args: { id: string; dto: IUserInput },
        context: IGraphQLContext,
      ) => {
        const { id, dto } = args;
        return await context.prisma.user.update({ where: { id }, data: dto });
      },
    },
    createProfile: {
      type: ProfileType,
      args: { dto: { type: new GraphQLNonNull(CreateProfileInputType) } },
      resolve: async (
        _source,
        args: { dto: IProfileInput },
        context: IGraphQLContext,
      ) => {
        const { dto } = args;
        return await context.prisma.profile.create({ data: dto });
      },
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
      },
      resolve: async (
        _source,
        args: { id: string; dto: IProfileInput },
        context: IGraphQLContext,
      ) => {
        const { id, dto } = args;
        return await context.prisma.profile.update({ where: { id }, data: dto });
      },
    },
    createPost: {
      type: PostType,
      args: { dto: { type: new GraphQLNonNull(CreatePostInputType) } },
      resolve: async (_source, args: { dto: IPostInput }, context: IGraphQLContext) => {
        const { dto } = args;
        return await context.prisma.post.create({ data: dto });
      },
    },
    changePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInputType) },
      },
      resolve: async (
        _source,
        args: { id: string; dto: IPostInput },
        context: IGraphQLContext,
      ) => {
        const { id, dto } = args;
        return await context.prisma.post.update({ where: { id }, data: dto });
      },
    },
    deletePost: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, args: { id: string }, context: IGraphQLContext) => {
        const { id } = args;
        await context.prisma.post.delete({ where: { id } });
        return 'Post deleted';
      },
    },

    deleteProfile: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, args: { id: string }, context: IGraphQLContext) => {
        const { id } = args;
        await context.prisma.profile.delete({ where: { id } });
        return 'Profile deleted';
      },
    },
    subscribeTo: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _source,
        args: { userId: string; authorId: string },
        context: IGraphQLContext,
      ) => {
        const { userId, authorId } = args;

        const userExists = await context.prisma.user.findUnique({
          where: { id: userId },
        });
        const authorExists = await context.prisma.user.findUnique({
          where: { id: authorId },
        });

        if (!userExists || !authorExists) {
          throw new Error('User or author not found');
        }

        await context.prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId: authorId,
          },
        });
      },
    },
    unsubscribeFrom: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _source,
        args: { userId: string; authorId: string },
        context: IGraphQLContext,
      ) => {
        const { userId, authorId } = args;

        const result = await context.prisma.subscribersOnAuthors.deleteMany({
          where: {
            subscriberId: userId,
            authorId: authorId,
          },
        });

        if (result.count === 0) {
          throw new Error('Subscription not found');
        }
      },
    },
  },
});
