import z from "zod";
import { buildJsonSchemas } from "fastify-zod";

const movieInput = {
  title: z.string(),
  posterUrl: z.string(),
  synopsis: z.string(),
  rating: z.number({}),
  releaseDate: z.date(),
  content: z.string().optional(),
};

const movieGenerated = {
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
};

const createMovieSchema = z.object({
  ...movieInput,
});

const movieResponseSchema = z.object({
  ...movieInput,
  ...movieGenerated,
});

const moviesResponseSchema = z.array(movieResponseSchema);

export type CreateMovieInput = z.infer<typeof createMovieSchema>;

export const { schemas: movieSchemas, $ref } = buildJsonSchemas(
  {
    createMovieSchema,
    movieResponseSchema,
    moviesResponseSchema,
  },
  { $id: "moviesSchema" }
);
