import { Router, Request, Response } from 'express';
import pool from '../database';

// Define the types required by the backend, avoiding a frontend dependency.
interface Node {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: any;
  parentNode?: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

const router = Router();

// GET /api/campaigns/:campaignId/elements - Get all map elements and links for a campaign
router.get('/campaigns/:campaignId/elements', async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  try {
    const nodesRes = await pool.query('SELECT * FROM MapElements WHERE campaign_id = $1', [campaignId]);
    const linksRes = await pool.query('SELECT * FROM MapLinks WHERE campaign_id = $1', [campaignId]);
    res.json({
      nodes: nodesRes.rows,
      links: linksRes.rows
    });
  } catch (err) {
    console.error('Failed to get map elements:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/campaigns/:campaignId/elements - Synchronize all map elements for a campaign
router.post('/campaigns/:campaignId/elements', async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { nodes, edges } = req.body as { nodes: Node[], edges: Edge[] };

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // For simplicity, we'll delete all existing elements and links for this campaign and re-insert them.
    // A more advanced implementation would perform a diff to update, insert, or delete.
    await client.query('DELETE FROM MapLinks WHERE campaign_id = $1', [campaignId]);
    await client.query('DELETE FROM MapElements WHERE campaign_id = $1', [campaignId]);

    // Insert all nodes
    for (const node of nodes) {
      const { id, type, position, data, parentNode } = node;
      await client.query(
        `INSERT INTO MapElements (element_id, campaign_id, type, position_x, position_y, data, parent_element_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, campaignId, type, position.x, position.y, data, parentNode]
      );
    }
    
    // Insert all edges (links)
    for (const edge of edges) {
      const { id, source, target } = edge;
      await client.query(
        `INSERT INTO MapLinks (link_id, campaign_id, source_element_id, target_element_id)
         VALUES ($1, $2, $3, $4)`,
        [id, campaignId, source, target]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Map state synchronized successfully.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to synchronize map state:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT /api/elements/:elementId - Update a specific map element
router.put('/elements/:elementId', async (req: Request, res: Response) => {
  const { elementId } = req.params;
  const { data } = req.body; // Assuming the body contains the new data for the element

  if (!data) {
    return res.status(400).json({ error: 'No data provided for update.' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE MapElements SET data = $1, updated_at = NOW() WHERE element_id = $2 RETURNING *',
      [data, elementId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Element not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(`Failed to update element ${elementId}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 