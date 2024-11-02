import { PrismaClient } from '@prisma/client';

export interface IGraphQLContext {
  prisma: PrismaClient;
}
