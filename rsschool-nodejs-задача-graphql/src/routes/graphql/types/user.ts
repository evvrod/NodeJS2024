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
  userSubscribedTo?: SubscribedToUser[];
  subscribedToUser?: UserSubscribedTo[];
}

export type IUserInput = Pick<IUser, 'id' | 'name' | 'balance'>;

interface SubscribedToUser {
  author?: IUser;
  authorId: string;
}

interface UserSubscribedTo {
  subscriber?: IUser;
  subscriberId: string;
}

export interface UserSubscriptions {
  subscribedToUser: SubscribedToUser[];
  userSubscribedTo: UserSubscribedTo[];
}

export const UserType: GraphQLObjectType<IUser, IGraphQLContext> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: async (user, _args, context) => {
        const profile = await context.loaders.profileLoader.load(user.id);

        if (profile) {
          const memberType = await context.loaders.memberTypeLoader.load(profile.id);
          if (memberType) profile.memberType = memberType;
        }

        return profile;
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (user, _args, context) => {
        const posts = await context.loaders.postsLoader.load(user.id);
        return posts;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (user, _args, context: IGraphQLContext) => {
        if (user.userSubscribedTo) {
          return user.userSubscribedTo;
        }
        const data = await context.loaders.userSubscriptionLoader.load(user.id);
        return data.userSubscribedTo || [];
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (user, _args, context: IGraphQLContext) => {
        if (user.subscribedToUser) {
          return user.subscribedToUser;
        }
        const data = await context.loaders.userSubscriptionLoader.load(user.id);
        return data.subscribedToUser || [];
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
