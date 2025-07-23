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

// GET /api/campaigns/:id - Get a single campaign
router.get('/campaigns/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM Campaigns WHERE campaign_id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(rows[0]);
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

// PUT /api/campaigns/:id/viewport - Update campaign viewport
router.put('/campaigns/:id/viewport', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { x, y, zoom } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE Campaigns SET viewport_x = $1, viewport_y = $2, viewport_zoom = $3, updated_at = NOW() WHERE campaign_id = $4 RETURNING *',
      [x, y, zoom, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 