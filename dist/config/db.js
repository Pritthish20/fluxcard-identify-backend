"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log("PostgreSQL connected (Prisma)");
    }
    catch (error) {
        console.log({ err: error }, "Failed to connect PostgreSQL");
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
exports.default = prisma;
