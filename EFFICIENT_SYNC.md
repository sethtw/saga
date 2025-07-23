# Efficient Map Synchronization System

## Overview

The map synchronization system has been improved to track changes and only update what has actually changed, rather than clearing and re-inserting all database records every time.

## Key Improvements

### 1. Change Tracking in Frontend Store

The `mapStore.ts` now includes:
- **Original State Tracking**: Stores the initial state loaded from the database
- **Change Detection**: Tracks added, updated, and deleted nodes/edges
- **Efficient Comparison**: Only syncs elements that have actually changed

### 2. New Backend Endpoint

**Endpoint**: `POST /api/campaigns/:campaignId/sync`

**Purpose**: Efficiently synchronize only changed elements instead of full replacement

**Request Body**:
```typescript
{
  addedNodes: Node[],
  updatedNodes: Node[],
  deletedNodeIds: string[],
  addedEdges: Edge[],
  updatedEdges: Edge[],
  deletedEdgeIds: string[]
}
```

### 3. Enhanced Auto-Save

The auto-save system now:
- Checks if there are actual changes before making API calls
- Uses the new sync endpoint for efficient updates
- Clears change tracking after successful sync

## Benefits

1. **Performance**: Significantly reduced database operations
2. **Efficiency**: Only updates what has changed
3. **Reliability**: Maintains data integrity with transaction-based updates
4. **Scalability**: Better performance with large maps

## How It Works

### Frontend Change Tracking

1. **Load Original State**: When map data is loaded, the original state is stored
2. **Track Changes**: All user actions (add, update, delete) are tracked
3. **Detect Changes**: Compare current state with original state
4. **Sync Changes**: Only send changed elements to the backend

### Backend Processing

1. **Delete Removed Elements**: Remove deleted nodes and edges
2. **Update Existing Elements**: Update modified nodes and edges
3. **Add New Elements**: Insert new nodes and edges
4. **Transaction Safety**: All operations wrapped in database transaction

## Migration from Old System

The old `saveElements` endpoint is still available for backward compatibility, but the new `syncChanges` endpoint is recommended for better performance.

## Usage

The system automatically uses efficient synchronization when:
- Auto-save is triggered
- Manual save is performed
- Elements are created, updated, or deleted

No changes are required in the UI - the system works transparently in the background. 