import { Router, Request, Response } from 'express';
import pool from '../database';

const router = Router();

// GET /api/campaigns - Get all campaigns
router.get('/', async (req: Request, res: Response) => {
    try {
        const { rows } = await pool.query('SELECT * FROM campaigns');
        res.json(rows);
    } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/campaigns/:id - Get a single campaign
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM campaigns WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(`Failed to fetch campaign with id ${id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/campaigns - Create a new campaign
router.post('/', async (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Campaign name is required' });
    }
    try {
        const { rows } = await pool.query(
            'INSERT INTO campaigns (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Failed to create campaign:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/campaigns/:id - Update a campaign
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, viewport_x, viewport_y, viewport_zoom } = req.body;

    try {
        const { rows } = await pool.query(
            'UPDATE campaigns SET name = $1, description = $2, viewport_x = $3, viewport_y = $4, viewport_zoom = $5 WHERE id = $6 RETURNING *',
            [name, description, viewport_x, viewport_y, viewport_zoom, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(`Failed to update campaign with id ${id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/campaigns/:id/map - Get map data for a campaign
router.get('/:id/map', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const nodesResult = await pool.query('SELECT * FROM elements WHERE campaign_id = $1', [id]);
        const edgesResult = await pool.query('SELECT * FROM edges WHERE campaign_id = $1', [id]);
        res.json({ nodes: nodesResult.rows, edges: edgesResult.rows });
    } catch (err) {
        console.error(`Failed to fetch map data for campaign with id ${id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/campaigns/:id/map - Save map data for a campaign
router.put('/:id/map', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nodes, edges } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query('DELETE FROM edges WHERE campaign_id = $1', [id]);
        await client.query('DELETE FROM elements WHERE campaign_id = $1', [id]);

        if (nodes && nodes.length > 0) {
            for (const node of nodes) {
                await client.query(
                    'INSERT INTO elements (id, campaign_id, type, data, position) VALUES ($1, $2, $3, $4, $5)',
                    [node.id, id, node.type, JSON.stringify(node.data), JSON.stringify(node.position)]
                );
            }
        }

        if (edges && edges.length > 0) {
            for (const edge of edges) {
                await client.query(
                    'INSERT INTO edges (id, campaign_id, source, target, sourceHandle, targetHandle) VALUES ($1, $2, $3, $4, $5, $6)',
                    [edge.id, id, edge.source, edge.target, edge.sourceHandle, edge.targetHandle]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Map saved successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Failed to save map data for campaign with id ${id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

export default router; 