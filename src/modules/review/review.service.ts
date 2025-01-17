import { z } from "zod";
import prisma from "../../utils/prisma";
import { CreateReviewInput, EditReviewInput } from "./review.schema";

export async function createReview(
  data: CreateReviewInput & { userId: number; movieId: number }
) {
  if (!data.userId || !data.movieId) {
  }
  let authorName: string;
  const author = await prisma.user.findUnique({
    where: {
      id: data.userId,
    },
    select: {
      name: true,
    },
  });

  if (!author || !author.name) {
    authorName = "User";
  } else {
    authorName = author.name;
  }

  const review = await prisma.review.create({
    data: {
      title: data.title,
      content: data.content,
      rating: data.rating,
      userId: data.userId,
      movieId: data.movieId,
      authorName,
    },
  });

  return review;
}

export async function getReviews({ movieId }: { movieId: number }) {
  const reviews = await prisma.review.findMany({
    where: { movieId },
  });

  return reviews;
}

export async function getReview({ reviewId }: { reviewId: number }) {
  const review = await prisma.review.findFirst({
    where: { id: reviewId },
  });

  return review;
}

export async function getReviewsByUserId(
  { userId }: { userId: number },
  { skip, limit }: { skip?: number; limit?: number }
) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId: Number(userId) },
      skip: Number(skip),
      take: Number(limit),
    }),
    prisma.review.count({ where: { userId: Number(userId) } }),
  ]);

  return { reviews, total };
}

export async function deleteReviewById({ reviewId }: { reviewId: number }) {
  const review = await prisma.review.delete({
    where: { id: reviewId },
  });

  return review;
}

export async function editReviewById({
  reviewId,
  newReviewData,
}: {
  reviewId: number;
  newReviewData: EditReviewInput;
}) {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...newReviewData,
    },
  });

  return review;
}
