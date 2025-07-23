import { memo } from 'react';
import {
  BaseEdge,
  getStraightPath,
  type EdgeProps,
} from 'reactflow';

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
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
    </>
  );
}

export default memo(CustomEdge); 