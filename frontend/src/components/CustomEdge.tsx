import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from 'reactflow';
import { Button } from './ui/button';
import { Cross1Icon } from '@radix-ui/react-icons';

interface CustomEdgeProps extends EdgeProps {
  data?: {
    deleteEdge: (edgeId: string) => void;
  };
}

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}: CustomEdgeProps) {
  const deleteEdge = data?.deleteEdge;
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {deleteEdge && (
            <Button
              className="h-6 w-6 rounded-full"
              size="icon"
              variant="outline"
              onClick={() => deleteEdge(id)}
            >
              <Cross1Icon className="h-3 w-3" />
            </Button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge); 