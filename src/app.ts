import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import userRoutes from "./modules/user/user.route";
import fjwt from "@fastify/jwt";
import { userSchemas } from "./modules/user/user.schema";
import { movieSchemas } from "./modules/movie/movie.schema";
import movieRoutes from "./modules/movie/movie.route";
import reviewRoutes from "./modules/review/review.route";

export const server = Fastify();
import cors from "@fastify/cors";

declare module "fastify" {
  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      email: string;
      name: string;
      id: number;
    };
  }
}

server.register(cors, {
  origin: process.env.FRONTEND_DOMAIN, // Specifica l'origine autorizzata
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Metodi permessi
  allowedHeaders: ["Content-Type", "Authorization"], // Headers permessi
});

server.register(fjwt, {
  secret: "secret",
});

server.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      return reply.send(error);
    }
  }
);
server.get("/healthcheck", async () => {
  return { status: "OK" };
});

async function main() {
  for (const schema of [...userSchemas, ...movieSchemas]) {
    server.addSchema(schema);
  }

  server.register(userRoutes, {
    prefix: "api/users",
  });
  server.register(movieRoutes, {
    prefix: "api/movies",
  });
  server.register(reviewRoutes, {
    prefix: "api/reviews",
  });

  try {
    await server.listen({ port: 4444, host: "0.0.0.0" });
    console.log("Server ready");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
