import { FastifyInstance } from "fastify";
import {
  createMovieHandler,
  getCategories,
  getMovieDetailsHandler,
  getMoviesByCategoryHandler,
  getMoviesHandler,
  searchMoviesHandler,
} from "./movie.controller";
import { $ref } from "./movie.schema";

async function movieRoutes(server: FastifyInstance) {
  server.post(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        body: $ref("createMovieSchema"),
        response: {
          201: $ref("movieResponseSchema"),
        },
      },
    },
    createMovieHandler
  );

  server.get(
    "/",
    {
      schema: {
        response: {
          200: $ref("moviesResponseSchema"),
        },
      },
    },
    getMoviesHandler
  );
  server.get("/search", {}, searchMoviesHandler);
  server.get("/:movieId", {}, getMovieDetailsHandler);
  server.get("/category/:categoryId", {}, getMoviesByCategoryHandler);
  server.get("/categories", {}, getCategories);
}

export default movieRoutes;
