// import ky from "ky";
// import ky from "ky";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
const seedCategories = async () => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/genre/movie/list?language=en",
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.MOVIE_DB_TOKEN}`,
        },
      }
    );

    const json = response.data;

    await prisma.category.deleteMany();
    json.genres.forEach(async (genre: any) => {
      await prisma.category.create({
        data: genre,
      });
    });
  } catch (error) {
    console.log("FAILED TO SEED CATEGORIES");
    console.log(error);
  }
};

const seedMovies = async () => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc",
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.MOVIE_DB_TOKEN}`,
        },
      }
    );

    const json = response.data;

    await prisma.movie.deleteMany();
    console.log(json);
    json.results.forEach(async (movie: any) => {
      await prisma.movie.create({
        data: {
          id: movie.id,
          posterUrl: movie.poster_path,
          backdropUrl: movie.backdrop_path,
          releaseDate: new Date(movie.release_date),
          title: movie.title,
          synopsis: movie.overview,
          categories: {
            create: movie.genre_ids.map((categoryId: any) => ({
              category: { connect: { id: categoryId } },
            })),
          },
        },
      });
    });
  } catch (error) {
    console.log("FAILED TO SEED Movies");
    console.log(error);
  }
};

seedCategories().then(() => {
  seedMovies();
});
