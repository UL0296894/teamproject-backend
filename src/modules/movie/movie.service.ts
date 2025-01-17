import prisma from "../../utils/prisma";
import { CreateMovieInput } from "./movie.schema";

export async function createMovie(
  data: CreateMovieInput & { ownerId: number }
) {
  // return prisma.product.create({data})
}

export async function getMovies() {
  return await prisma.movie.findMany({
    include: {
      categories: {
        select: {
          category: true,
        },
      },
    },
  });
}

export async function getMovieByTitle(title: string) {
  const movies = await prisma.movie.findMany({
    where: {
      title: {
        contains: title, // Operazione di ricerca "contiene"
        mode: "insensitive", // Ignora maiuscole/minuscole
      },
    },
    include: {
      categories: {
        select: {
          category: true,
        },
      },
    },
  });
  return movies;
}

export async function getMovieDetails({ movieId }: { movieId: number }) {
  if (!movieId) {
    return;
  }

  const movieDetails = await prisma.movie.findFirst({
    where: { id: movieId },
    include: {
      categories: {
        select: {
          category: true,
        },
      },
    },
  });

  return movieDetails;
}

export async function getMoviesByCategoryId({
  categoryId,
}: {
  categoryId: number;
}) {
  if (!categoryId) {
    return;
  }

  const moviesInCategory = await prisma.movie.findMany({
    where: {
      categories: {
        some: {
          categoryId: categoryId,
        },
      },
    },
    include: {
      categories: {
        where: {
          categoryId: categoryId,
        },
        select: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return moviesInCategory;
}
