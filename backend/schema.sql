-- Saga Weaver Database Schema
-- This schema is designed for a PostgreSQL database.

-- Campaigns Table: Stores high-level information about each campaign.
CREATE TABLE Campaigns (
    campaign_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, -- In a full system, this would be a foreign key to a Users table.
    name VARCHAR(255) NOT NULL,
    narrative_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contexts Table: Stores hierarchical location data (e.g., continents, regions, cities).
CREATE TABLE Contexts (
    context_id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL REFERENCES Campaigns(campaign_id) ON DELETE CASCADE,
    parent_context_id INT REFERENCES Contexts(context_id) ON DELETE SET NULL, -- Self-referencing for hierarchy
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MapElements Table: Stores all objects that appear on the map.
CREATE TABLE MapElements (
    element_id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL REFERENCES Campaigns(campaign_id) ON DELETE CASCADE,
    context_id INT REFERENCES Contexts(context_id) ON DELETE SET NULL, -- The location context of the element
    parent_element_id INT REFERENCES MapElements(element_id) ON DELETE SET NULL, -- For nested elements (e.g., character in a room)
    type VARCHAR(50) NOT NULL, -- e.g., 'room', 'character', 'item'
    position_x INT NOT NULL,
    position_y INT NOT NULL,
    data JSONB, -- Flexible field for descriptions, stats, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PromptTemplates Table: Stores user-editable templates for LLM generation.
CREATE TABLE PromptTemplates (
    template_id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL REFERENCES Campaigns(campaign_id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    template_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes to improve query performance
CREATE INDEX idx_contexts_campaign_id ON Contexts(campaign_id);
CREATE INDEX idx_mapelements_campaign_id ON MapElements(campaign_id);
CREATE INDEX idx_mapelements_type ON MapElements(type);
CREATE INDEX idx_prompttemplates_campaign_id ON PromptTemplates(campaign_id);

-- Optional: A function to automatically update the updated_at timestamp on row modification.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with an updated_at column
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON Campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contexts_updated_at BEFORE UPDATE ON Contexts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mapelements_updated_at BEFORE UPDATE ON MapElements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompttemplates_updated_at BEFORE UPDATE ON PromptTemplates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 