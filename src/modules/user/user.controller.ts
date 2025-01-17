import { FastifyReply, FastifyRequest } from "fastify";
import { createUser, findUserByEmail, findUsers } from "./user.service";
import { CreateUserInput, EditPasswordInput, LoginInput } from "./user.schema";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { server } from "../../app";
import prisma from "../../utils/prisma";

export async function registerUserHandler(
  req: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) {
  const body = req.body;
  try {
    // Controlla se l'email esiste già
    const existingUser = await findUserByEmail(body.email);
    if (existingUser) {
      return reply.code(409).send({ message: "Email already exists." }); // 409: Conflict
    }

    const user = await createUser(body);
    if (user) {
      const { password, salt, createdAt, updatedAt, ...rest } = user;

      return { accessToken: server.jwt.sign({ ...rest }), ...rest };
    }
    return reply.code(201).send(user);
  } catch (error) {
    console.log(error);
    return reply.code(500).send(error);
  }
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  const body = request.body;

  // Find the user by email
  const user = await findUserByEmail(body.email);

  if (!user)
    return reply.code(401).send({ message: "Invalid email or password" });
  // verify password
  const correctPassword = verifyPassword(
    body.password,
    user.salt,
    user.password
  );
  // Generate token
  if (correctPassword) {
    const { password, salt, ...rest } = user;

    return { accessToken: server.jwt.sign(rest) };
  }
  // Respond
  return reply.code(401).send({ message: "Invalid email or password" });
}
export async function getUsersHandler() {
  const users = await findUsers();
  return users;
}

export async function updatePasswordHandler(
  request: FastifyRequest<{ Body: EditPasswordInput }>,
  reply: FastifyReply
) {
  const body = request.body;

  const loggedUser = await request.jwtVerify();
  // @ts-ignore
  const loggedUserId = loggedUser.id;
  const newPassword = body.password;
  if (!loggedUserId) {
    reply.code(409).send({ message: "Unauthorized." });
  }
  if (!newPassword) {
    reply
      .code(400)
      .send({ message: "Provide a new password to update profile name." });
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: loggedUserId },
  });

  if (!existingUser) {
    reply.code(409).send({ message: "Unauthorized." });
  }

  const { hash, salt } = hashPassword(newPassword);
  const newUserInfo = await prisma.user.update({
    where: { id: loggedUserId },
    data: {
      password: hash,
      salt,
    },
  });

  return newUserInfo;

  return reply.code(401).send({ message: "Invalid email or password" });
}
