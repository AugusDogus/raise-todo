import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const todoRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.todo.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        todo: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.create({
        data: {
          text: input.todo,
          userId: ctx.session.user.id,
          completed: false,
        },
      });
      return todo;
    }),
  toggle: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!todo) {
        throw new Error('Todo not found');
      }

      if (todo.userId !== ctx.session.user.id) {
        throw new Error('Not authorized');
      }

      const updatedTodo = await ctx.prisma.todo.update({
        where: {
          id: input.id,
        },
        data: {
          completed: !todo.completed,
        },
      });

      return updatedTodo;
    }),
  deleteCompleted: protectedProcedure.mutation(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        userId: ctx.session.user.id,
        completed: true,
      },
    });

    await ctx.prisma.todo.deleteMany({
      where: {
        id: {
          in: todos.map((todo) => todo.id),
        },
      },
    });

    return todos;
  }),
});
