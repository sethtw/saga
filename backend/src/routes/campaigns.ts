import { Router, Request, Response } from 'express';
import pool from '../database';

const router = Router();

// GET /api/campaigns - Get all campaigns
router.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM Campaigns');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/campaigns - Create a new campaign
router.post('/campaigns', async (req: Request, res: Response) => {
  const { name, narrative_context, user_id } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO Campaigns (name, narrative_context, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, narrative_context, user_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 