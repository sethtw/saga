import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import campaignRouter from './routes/campaigns';
import generateRouter from './routes/generate';


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', (req, res, next) => {
  // This can be used for authentication, logging, etc.
  console.log(`API request to: ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api/health", (req: Request, res: Response) => {
  res.send("Saga Weaver API is running!");
});

// Use the campaign and generate routers
app.use('/api', campaignRouter);
app.use('/api', generateRouter);


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
