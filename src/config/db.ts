import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if(!databaseUrl){
  throw new Error ("DATABASE_URL is not defined")
}

const pool =new Pool({
  connectionString:databaseUrl
})
const adapter = new PrismaPg(pool);
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