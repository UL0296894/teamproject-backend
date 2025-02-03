// import ky from "ky";
// import ky from "ky";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import chance from "chance";
import { hashPassword } from "./hash";
const REVIEWS = [
  {
    title: "Exciting Adventure",
    content: "Thrilling ride from start to finish, with stunning action.",
    rating: 4.5,
  },
  {
    title: "Vivid Emotions",
    content: "Beautifully shot, capturing raw feelings in every frame.",
    rating: 4.2,
  },
  {
    title: "Memorable Drama",
    content: "Powerful storytelling that lingers long after it ends.",
    rating: 4.8,
  },
  {
    title: "Comedy Blast",
    content: "Hilarious moments make this a real crowd-pleaser.",
    rating: 4.0,
  },
  {
    title: "Intense Conflict",
    content: "Well-choreographed fight scenes in a tight narrative.",
    rating: 4.3,
  },
  {
    title: "Friendship & Hope",
    content: "Heartwarming tale of loyalty and second chances.",
    rating: 4.6,
  },
  {
    title: "Eerie Atmosphere",
    content: "Haunting mood throughout, truly chilling at times.",
    rating: 4.0,
  },
  {
    title: "Touch of Wit",
    content: "Wonderful balance of humor and poignant moments.",
    rating: 4.1,
  },
  {
    title: "Mysterious Clues",
    content: "Keeps you guessing until the very last reveal.",
    rating: 4.2,
  },
  {
    title: "Visual Feast",
    content: "Breathtaking scenes with imaginative set designs.",
    rating: 4.7,
  },
  {
    title: "Raw Emotions",
    content: "Gut-wrenching performances leave a lasting impact.",
    rating: 4.5,
  },
  {
    title: "Nonstop Thrills",
    content: "Relentless pace that refuses to slow down.",
    rating: 4.3,
  },
  {
    title: "Tense Twists",
    content: "Spine-tingling suspense and unexpected turns.",
    rating: 4.4,
  },
  {
    title: "Groovy Soundtrack",
    content: "Clever dialogue matched by a fun musical score.",
    rating: 4.0,
  },
  {
    title: "Sci-Fi Spectacle",
    content: "Spectacular effects elevate this beyond mere hype.",
    rating: 4.5,
  },
  {
    title: "Stirring Direction",
    content: "Brings true depth to a deeply moving storyline.",
    rating: 4.6,
  },
  {
    title: "Unforgettable Voyage",
    content: "A journey filled with a cast that truly shines.",
    rating: 4.7,
  },
  {
    title: "Romantic Sparks",
    content: "A witty rom-com brimming with fresh banter.",
    rating: 3.9,
  },
  {
    title: "Dark Undertones",
    content: "Brooding vibes lend an unsettling air throughout.",
    rating: 4.1,
  },
  {
    title: "Action Fusion",
    content: "Masterful blend of stunts and drama, never dull.",
    rating: 4.4,
  },

  // RECENSIONI CON GIUDIZI PIÙ BASSI O NEGATIVI
  {
    title: "Chaotic Screenplay",
    content: "Disjointed plot and underdeveloped characters.",
    rating: 2.2,
  },
  {
    title: "Flat Comedy",
    content: "Few jokes land, making this comedy feel bland.",
    rating: 2.8,
  },
  {
    title: "Overhyped Visuals",
    content: "Despite flashy effects, it lacks real substance.",
    rating: 2.5,
  },
  {
    title: "Dragging Pace",
    content: "Stretched-out scenes and slow development.",
    rating: 2.0,
  },
  {
    title: "Generic Plot",
    content: "Predictable story with no emotional punch.",
    rating: 2.7,
  },

  // TORNANO ALCUNE PIÙ POSITIVE/MEDIE
  {
    title: "Nostalgic Fun",
    content: "Upbeat adventure that sparks classic memories.",
    rating: 3.8,
  },
  {
    title: "Uplifting Message",
    content: "Jaw-dropping visuals and a heartfelt payoff.",
    rating: 4.2,
  },
  {
    title: "Bold Exploration",
    content: "Challenges viewers with deeper moral questions.",
    rating: 4.1,
  },
  {
    title: "Surprise Finale",
    content: "Twists and turns that stick the landing.",
    rating: 4.3,
  },
  {
    title: "Modern Fairy Tale",
    content: "Charming vibe with a sprinkle of contemporary humor.",
    rating: 4.0,
  },
  {
    title: "Undeniable Chemistry",
    content: "Lead actors shine even in a simple premise.",
    rating: 3.7,
  },
  {
    title: "Perfect Timing",
    content: "Sharp pacing hooks you from the very first scene.",
    rating: 4.5,
  },
  {
    title: "Grit & Hope",
    content: "Exploration of humanity's struggles and triumphs.",
    rating: 4.3,
  },
  {
    title: "Haunting Notes",
    content: "Soundtrack weaves seamlessly into every emotion.",
    rating: 4.0,
  },
  {
    title: "Twisted Logic",
    content: "Mind-bending plot that dares you to keep up.",
    rating: 3.9,
  },
  {
    title: "Stylish Noir",
    content: "A moody setting delivers unforgettable tension.",
    rating: 4.1,
  },
  {
    title: "Loose Threads",
    content: "Attempts at big reveals but leaves questions open.",
    rating: 2.9,
  },
  {
    title: "Grand Finale",
    content: "Epic in scale, capped off with heartfelt moments.",
    rating: 4.2,
  },
];

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
    // console.log(json);
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

const userIds: number[] = [];

export const seedUsers = async () => {
  await prisma.user.deleteMany();

  // Create test user
  const testUserPassword = "password";
  const { hash, salt } = hashPassword(testUserPassword);
  await prisma.user.create({
    data: {
      email: "mario@gmail.com",
      password: hash,
      salt,
      name: "Mario Rossi",
    },
  });

  // Seed users
  for (let i = 0; i < 100; i++) {
    const plainPassword = chance().word({ length: 8 });
    const { hash, salt } = hashPassword(plainPassword);

    const user = await prisma.user.create({
      data: {
        email: chance().email(),
        name: chance().name(),
        password: hash,
        salt,
      },
    });

    userIds.push(user.id);
  }
};

const seedReviews = async () => {
  await prisma.review.deleteMany();

  const movies = await prisma.movie.findMany({
    select: { id: true },
  });

  const users = await prisma.user.findMany();

  for (const movie of movies) {
    const numberOfReviews = Math.floor(Math.random() * 4) + 1;

    const reviewPromises = [];

    for (let i = 0; i < numberOfReviews; i++) {
      const randomUserIndex = Math.floor(Math.random() * users.length);
      const randomUser = users[randomUserIndex];

      const randomReviewIndex = Math.floor(Math.random() * REVIEWS.length);
      const randomReview = REVIEWS[randomReviewIndex];

      reviewPromises.push(
        prisma.review.create({
          data: {
            authorName: randomUser.name!,
            content: randomReview.content,
            rating: randomReview.rating,
            title: randomReview.title,
            movieId: movie.id,
            userId: randomUser.id,
          },
        })
      );
    }

    await Promise.all(reviewPromises);
  }

  movies.forEach(async (movie) => {
    const averageRating = await prisma.review.aggregate({
      where: { movieId: movie.id },
      _avg: { rating: true },
    });

    await prisma.movie.update({
      where: { id: movie.id },
      data: {
        rating: parseFloat(averageRating._avg.rating?.toFixed(1)!) || 0,
      },
    });
  });
};

seedCategories().then(() => {
  seedMovies().then(() => {
    seedUsers().then(async () => {
      await seedReviews();
    });
  });
});
