import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const createReviewSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10, "Reviews must be at least 10 characters long."),
  rating: z.number().min(1).max(5),
  userId: z.number(),
  movieId: z.number(),
});

const editReviewSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10, "Reviews must be at least 10 characters long."),
  rating: z.number().min(1).max(5),
});

const createReviewResponseSchema = z.object({
  id: z.number(), // Identificativo della recensione
  title: z.string(),
  content: z.string(),
  rating: z.number(),
  userId: z.number(),
  movieId: z.number(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type EditReviewInput = z.infer<typeof editReviewSchema>;

export const { schemas: reviews, $ref } = buildJsonSchemas(
  {
    createReviewSchema,
    createReviewResponseSchema,
  },
  { $id: "reviewsSchema" }
);
