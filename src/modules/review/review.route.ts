import { FastifyInstance } from "fastify";
import {
  createReviewHandler,
  deleteReviewHandler,
  editReviewHandler,
  getMyReviewsHandler,
  getReviewHandler,
  getReviewsHandler,
} from "./review.controller";

async function reviewRoutes(server: FastifyInstance) {
  server.post(
    "/movie/:movieId",
    {
      preHandler: [server.authenticate],
    },
    createReviewHandler
  );

  server.get(
    "/movies/:movieId",

    getReviewsHandler
  );

  server.get(
    "/:reviewId",

    getReviewHandler
  );

  server.get(
    "/user/:userId",
    { preHandler: [server.authenticate] },
    getMyReviewsHandler
  );

  server.delete(
    "/:reviewId",
    { preHandler: [server.authenticate] },
    deleteReviewHandler
  );

  server.put(
    "/:reviewId",
    { preHandler: [server.authenticate] },
    editReviewHandler
  );
}

export default reviewRoutes;
