DROP TABLE IF EXISTS campaigns, elements, edges CASCADE;

CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    viewport_x FLOAT,
    viewport_y FLOAT,
    viewport_zoom FLOAT
);

CREATE TABLE elements (
    id VARCHAR(255) PRIMARY KEY,
    campaign_id INTEGER NOT NULL,
    type VARCHAR(255) NOT NULL,
    data TEXT,
    position TEXT,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE TABLE edges (
    id VARCHAR(255) PRIMARY KEY,
    campaign_id INTEGER NOT NULL,
    source VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    sourceHandle VARCHAR(255),
    targetHandle VARCHAR(255),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (source) REFERENCES elements(id) ON DELETE CASCADE,
    FOREIGN KEY (target) REFERENCES elements(id) ON DELETE CASCADE
); 