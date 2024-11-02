import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql, GraphQLError, ValidationRule, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import {
  createUserSubscriptionLoader,
  createProfileLoader,
  createPostsLoader,
  createMemberTypeLoader,
} from './loader.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      const depthLimitCheck: ValidationRule = depthLimit(5) as ValidationRule;
      const validationErrors = validate(schema, parse(query), [
        depthLimitCheck,
      ]) as GraphQLError[];

      if (validationErrors.length > 0) {
        return { errors: validationErrors.map((error) => ({ message: error.message })) };
      }

      try {
        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: {
            prisma,
            loaders: {
              userSubscriptionLoader: createUserSubscriptionLoader(prisma),
              profileLoader: createProfileLoader(prisma),
              postsLoader: createPostsLoader(prisma),
              memberTypeLoader: createMemberTypeLoader(prisma),
            },
          },
        });
        return result;
      } catch (error) {
        return { errors: [error] };
      }
    },
  });
};

export default plugin;
