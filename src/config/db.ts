import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected (Prisma)");
  } catch (error) {
    console.log({ err: error }, "Failed to connect PostgreSQL");
    throw error;
  }
};

export default prisma;