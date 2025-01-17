import { FastifyReply, FastifyRequest } from "fastify";

import { CreateReviewInput, EditReviewInput } from "./review.schema";
import {
  createReview,
  deleteReviewById,
  editReviewById,
  getReview,
  getReviews,
  getReviewsByUserId,
} from "./review.service";
import prisma from "../../utils/prisma";

export async function createReviewHandler(
  request: FastifyRequest<{
    Params: { movieId: string };
    Body: CreateReviewInput;
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

  const existingReviewFromSameAuthor = await prisma.review.findFirst({
    where: {
      userId: request.user.id,
      movieId: movieId,
    },
  });

  if (existingReviewFromSameAuthor) {
    return reply.send({
      error: `You have already reviewed this film, please edit or delete your review.`,
    });
  }

  const review = await createReview({
    ...request.body,
    userId: request.user.id,
    movieId,
  });

  const averageRating = await prisma.review.aggregate({
    where: { movieId: movieId },
    _avg: { rating: true },
  });

  await prisma.movie.update({
    where: { id: movieId },
    data: {
      rating: parseFloat(averageRating._avg.rating?.toFixed(1)!) || 0,
    },
  });

  return review;
}

export async function getReviewsHandler(
  request: FastifyRequest<{
    Params: { movieId: string };
    Body: CreateReviewInput;
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

  const reviews = await getReviews({ movieId });

  return reviews;
}

export async function getReviewHandler(
  request: FastifyRequest<{
    Params: { reviewId: string };
  }>,
  reply: FastifyReply
) {
  const reviewId = +request.params.reviewId;

  const reviewExists = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!reviewExists) {
    return reply
      .status(404)
      .send({ error: `Review with ID ${reviewId} not found` });
  }

  const review = await getReview({ reviewId });

  return review;
}

export async function getMyReviewsHandler(
  request: FastifyRequest<{
    Params: { userId: string };
    Querystring: { page?: number; limit?: number };
  }>,
  reply: FastifyReply
) {
  const userId = +request.params.userId;
  const loggedUser = await request.jwtVerify();
  // @ts-ignore
  const loggedUserId = loggedUser.id;

  if (userId !== loggedUserId) {
    return reply.status(401).send({ error: `Unauthorized.` });
  }

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    return reply
      .status(404)
      .send({ error: `User with ID ${userId} not found` });
  }
  const { page = 1, limit = 4 } = request.query;

  const skip = (page - 1) * limit;
  const { reviews, total } = await getReviewsByUserId(
    { userId },
    { skip, limit }
  );

  return { reviews, total };
}

export async function deleteReviewHandler(
  request: FastifyRequest<{
    Params: { reviewId: string };
  }>,
  reply: FastifyReply
) {
  const reviewId = +request.params.reviewId;
  const loggedUser = await request.jwtVerify();
  // @ts-ignore
  const loggedUserId = loggedUser.id;

  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });
  const movieId = review?.movieId;
  if (!review) {
    return reply
      .status(404)
      .send({ error: `Review with ID ${reviewId} not found` });
  }

  if (review?.userId !== loggedUserId) {
    return reply.status(401).send({ error: `Unauthorized.` });
  }

  const response = await deleteReviewById({ reviewId });

  const averageRating = await prisma.review.aggregate({
    where: { movieId: movieId },
    _avg: { rating: true },
  });

  await prisma.movie.update({
    where: { id: movieId },
    data: {
      rating: parseFloat(averageRating._avg.rating?.toFixed(1)!) || 0,
    },
  });

  return response;
}

export async function editReviewHandler(
  request: FastifyRequest<{
    Params: { reviewId: string };
    Body: EditReviewInput;
  }>,
  reply: FastifyReply
) {
  const reviewId = +request.params.reviewId;
  const loggedUser = await request.jwtVerify();
  // @ts-ignore
  const loggedUserId = loggedUser.id;

  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });
  const movieId = review?.movieId;
  if (!review) {
    return reply
      .status(404)
      .send({ error: `Review with ID ${reviewId} not found` });
  }

  if (review?.userId !== loggedUserId) {
    return reply.status(401).send({ error: `Unauthorized.` });
  }

  const response = await editReviewById({
    reviewId,
    newReviewData: { ...request.body },
  });

  const averageRating = await prisma.review.aggregate({
    where: { movieId: movieId },
    _avg: { rating: true },
  });

  await prisma.movie.update({
    where: { id: movieId },
    data: {
      rating: parseFloat(averageRating._avg.rating?.toFixed(1)!) || 0,
    },
  });

  return response;
}
