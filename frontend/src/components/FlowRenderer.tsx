
import React, { useCallback, useEffect, useState } from 'react';
import { type Node, useReactFlow, type Viewport } from 'reactflow';
import useMapStore from '../store/mapStore';
import { api } from '../api/api';
import Flow from './Flow';
import { useGlobalMapFunctions } from '@/hooks/map/useGlobalMapFunctions';

export const FlowRenderer = ({ campaignId, onNodeDoubleClick }: { campaignId: string, onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void }) => {
    const {
        onEdgeUpdate,
        onEdgeUpdateStart,
        onEdgeUpdateEnd,
        setMenu,
        setViewportDirty,
    } = useMapStore();
    const [savedViewport, _setSavedViewport] = useState<Viewport | null>(null);
    const { getViewport, setViewport } = useReactFlow();

    const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
        event.preventDefault();
        const pane = (event.target as HTMLElement).closest('.react-flow__pane');
        if (!pane) return;
        const paneRect = pane.getBoundingClientRect();
        setMenu({
            x: event.clientX - paneRect.left,
            y: event.clientY - paneRect.top,
            node,
        });
    }, [setMenu]);

    useGlobalMapFunctions(campaignId);

    return (
        <div className="h-full w-full" onClick={() => setMenu(null)}>
            <Flow
                onNodeContextMenu={onNodeContextMenu}
                onNodeDoubleClick={onNodeDoubleClick}
                getViewport={getViewport}
                setViewport={setViewport}
                savedViewport={savedViewport}
                onEdgeUpdate={onEdgeUpdate}
                onEdgeUpdateStart={onEdgeUpdateStart}
                onEdgeUpdateEnd={onEdgeUpdateEnd}
                onViewportChange={() => setViewportDirty(true)}
            />
        </div>
    );
} 