import React from 'react';
import { type NodeProps } from 'reactflow';

/**
 * @file MapElement.tsx
 * @description A Higher-Order Component (HOC) to wrap different types of map nodes.
 * It provides a consistent structure and styling for all elements on the map.
 */

// This is a placeholder for now. In the future, this HOC could add
// common functionality like a context menu, selection highlighting, etc.
const withMapElement = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const WithMapElement: React.FC<P & NodeProps> = (props) => {
    return (
      <div className="bg-gray-700 border-2 border-purple-500 rounded-md shadow-lg text-white">
        <WrappedComponent {...props} />
      </div>
    );
  };
  return WithMapElement;
};

export default withMapElement; 