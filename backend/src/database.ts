import { PrismaClient } from '@prisma/client';

/**
 * @file database.ts
 * @description This file manages the connection to the PostgreSQL database.
 */

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
});

export default prisma; 