import { FastifyReply, FastifyRequest } from "fastify";
import {
  createMovie,
  getMovieByTitle,
  getMovieDetails,
  getMovies,
  getMoviesByCategoryId,
} from "./movie.service";
import { CreateMovieInput } from "./movie.schema";
import prisma from "../../utils/prisma";

export async function createMovieHandler(
  request: FastifyRequest<{ Body: CreateMovieInput }>
) {
  const movie = await createMovie({
    ...request.body,
    ownerId: request.user.id,
  });

  return movie;
}

export async function getMoviesHandler() {
  const movies = await getMovies();

  return movies;
}

export async function searchMoviesHandler(
  req: FastifyRequest<{ Querystring: { title?: string } }>,
  reply: FastifyReply
) {
  const { title } = req.query; // Estrarre il titolo dalla query string

  // Verifica che il titolo sia stato passato
  if (!title) {
    const movies = await getMovies();
    return movies;
    // return reply.code(400).send({ error: "Title parameter is required" });
  }

  // Ricerca i film nel database che contengono la stringa del titolo
  const movies = await getMovieByTitle(title);

  // Restituisce i risultati della ricerca
  return movies;
}

export async function getMovieDetailsHandler(
  request: FastifyRequest<{
    Params: { movieId: string };
  }>,
  reply: FastifyReply
) {
  const movieId = +request.params.movieId;

  const movieExists = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movieExists) {
    return reply
      .status(404)
      .send({ error: `Movie with ID ${movieId} not found` });
  }

  const movieDetails = await getMovieDetails({ movieId });

  return movieDetails;
}

export async function getMoviesByCategoryHandler(
  request: FastifyRequest<{
    Params: { categoryId: string };
  }>,
  reply: FastifyReply
) {
  const categoryId = +request.params.categoryId;

  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!categoryExists) {
    return reply
      .status(404)
      .send({ error: `Category with ID ${categoryId} not found` });
  }

  const movies = await getMoviesByCategoryId({ categoryId });

  return movies;
}

export async function getCategories(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const categories = await prisma.category.findMany({});
  return categories;
}
