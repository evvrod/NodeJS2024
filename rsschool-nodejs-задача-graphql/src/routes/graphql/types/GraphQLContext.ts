import { PrismaClient } from '@prisma/client';
import {
  createUserSubscriptionLoader,
  createProfileLoader,
  createPostsLoader,
  createMemberTypeLoader,
} from '../loader.js';

export interface IGraphQLContext {
  prisma: PrismaClient;
  loaders: {
    userSubscriptionLoader: ReturnType<typeof createUserSubscriptionLoader>;
    profileLoader: ReturnType<typeof createProfileLoader>;
    postsLoader: ReturnType<typeof createPostsLoader>;
    memberTypeLoader: ReturnType<typeof createMemberTypeLoader>;
  };
}
