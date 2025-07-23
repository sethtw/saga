import { PrismaClient } from '@prisma/client';

/**
 * @file database.ts
 * @description This file manages the connection to the PostgreSQL database.
 */

const prisma = new PrismaClient();

export default prisma; 