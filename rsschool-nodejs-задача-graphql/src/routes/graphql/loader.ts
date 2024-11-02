import DataLoader from 'dataloader';
import { IGraphQLContext } from './types/GraphQLContext.js';
import { IPost } from './types/post.js';

export const createUserSubscriptionLoader = (prisma: IGraphQLContext['prisma']) =>
  new DataLoader(async (userIds: readonly string[]) => {
    const userIdsArray = Array.from(userIds);
    const usersWithSubscriptions = await prisma.user.findMany({
      where: { id: { in: userIdsArray } },
      include: {
        userSubscribedTo: {
          select: {
            authorId: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subscribedToUser: {
          select: {
            subscriberId: true,
            subscriber: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const userSubscriptionsMap = userIds.map((id) => {
      const user = usersWithSubscriptions.find((u) => u.id === id);
      if (!user) {
        return {
          userSubscribedTo: [],
          subscribedToUser: [],
        };
      }

      return {
        userSubscribedTo: user.userSubscribedTo.map((sub) => sub.author) || [],
        subscribedToUser: user.subscribedToUser.map((sub) => sub.subscriber) || [],
      };
    });

    return userSubscriptionsMap;
  });

export const createProfileLoader = (prisma: IGraphQLContext['prisma']) =>
  new DataLoader(async (userIds: readonly string[]) => {
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: [...userIds] } },
      include: {
        memberType: true,
      },
    });

    const profileMap = new Map(profiles.map((profile) => [profile.userId, profile]));

    return userIds.map((id) => profileMap.get(id) || null);
  });

export const createPostsLoader = (prisma: IGraphQLContext['prisma']) =>
  new DataLoader(async (userIds: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: [...userIds] } },
    });

    const postsMap: Record<string, IPost[]> = userIds.reduce(
      (acc, userId) => {
        acc[userId] = [];
        return acc;
      },
      {} as Record<string, IPost[]>,
    );

    posts.forEach((post) => {
      postsMap[post.authorId].push(post);
    });

    return userIds.map((id) => postsMap[id] || []);
  });

export const createMemberTypeLoader = (prisma: IGraphQLContext['prisma']) =>
  new DataLoader(async (profileIds: readonly string[]) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: [...profileIds] } },
    });

    const memberTypeMap = new Map(
      memberTypes.map((memberType) => [memberType.id, memberType]),
    );

    const result = profileIds.map((id) => memberTypeMap.get(id) || null);
    return result;
  });
