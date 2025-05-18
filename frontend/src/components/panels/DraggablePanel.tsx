// src/components/panels/DraggablePanel.tsx
import React, { forwardRef, useRef, useState, useEffect } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { DraggablePanelProps } from '../../types/panels';
import { 
    MIN_PANEL_WIDTH, 
    MIN_PANEL_HEIGHT, 
    MAX_PANEL_WIDTH, 
    MAX_PANEL_HEIGHT,
    DEFAULT_PANEL_WIDTH,
    DEFAULT_PANEL_HEIGHT,
    getPanelColor
} from '../../constants/panelConstants';
import { snapToEdgesAndGrid } from '../../utils/panelUtils';

// DraggablePanel 컴포넌트
export const DraggablePanel = forwardRef<HTMLDivElement, DraggablePanelProps>((
    { id, panelData, handleDragStop, handleResizeStop, children, zIndex, bringToFront }, 
    ref
) => {
    // useRef로 변경하여 리사이즈 도중의 상태를 안정적으로 관리
    const sizeRef = useRef({ 
        width: panelData.width || DEFAULT_PANEL_WIDTH, 
        height: panelData.height || DEFAULT_PANEL_HEIGHT 
    });
    const [position, setPosition] = useState({ 
        x: panelData.x || 0, 
        y: panelData.y || 0 
    });
    
    const panelRef = useRef<HTMLDivElement | null>(null);
    const isDragging = useRef<boolean>(false);
    const isResizing = useRef<boolean>(false);

    // 패널 데이터가 변경되면 상태 업데이트
    useEffect(() => {
        sizeRef.current = { 
            width: panelData.width || DEFAULT_PANEL_WIDTH, 
            height: panelData.height || DEFAULT_PANEL_HEIGHT 
        };
        setPosition({ 
            x: panelData.x || 0, 
            y: panelData.y || 0 
        });
    }, [panelData]);

    // 드래그 중 이벤트 처리
    const onDrag = (e: DraggableEvent, data: DraggableData) => {
        if (!isResizing.current) {
            isDragging.current = true;
            setPosition({ x: data.x, y: data.y });
        }
    };

    // 드래그 시작 이벤트 처리
    const onDragStart = () => {
        isDragging.current = true;
        bringToFront(id);
    };

    // 리사이즈 중 이벤트 처리
    const onResize = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
        if (!isDragging.current) {
            isResizing.current = true;
            // 리사이즈 중에는 ref 값만 업데이트하고 리렌더링하지 않음
            sizeRef.current = data.size;
        }
    };

    // 리사이즈 종료 이벤트 처리
    const onResizeStop = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
        isResizing.current = false;
        const snapped = snapToEdgesAndGrid(position.x, position.y, data.size.width, data.size.height);
        setPosition(snapped);
        // 최종 크기를 부모 컴포넌트에 전달
        handleResizeStop(id, data.size, snapped);
    };

    // 드래그 종료 이벤트 처리
    const onDragStop = (e: DraggableEvent, data: DraggableData) => {
        isDragging.current = false;
        const snapped = snapToEdgesAndGrid(data.x, data.y, sizeRef.current.width, sizeRef.current.height);
        setPosition(snapped);
        handleDragStop(e, { x: snapped.x, y: snapped.y } as DraggableData, id, sizeRef.current);
    };

    return (
        <Draggable
            key={id}
            position={position}
            onStop={onDragStop}
            onStart={onDragStart}
            nodeRef={panelRef}
            bounds="#panel-container"
            onDrag={onDrag}
            handle=".drag-handle" // 핸들로만 드래그 가능
        >
            <div
                className={`panel ${getPanelColor(id)} transition-transform duration-200 ease-in-out rounded-2xl shadow-md border border-gray-500 p-0`}
                style={{
                    position: 'absolute',
                    outline: '3px solid #FFD700',
                    top: position.y,
                    left: position.x,
                    zIndex: zIndex,
                    width: `${sizeRef.current.width}px`, // 직접 너비 지정
                    height: `${sizeRef.current.height + 30}px` // 헤더 높이 고려하여 조정
                }}
                ref={panelRef}
                onClick={() => bringToFront(id)}
            >
                <div className="drag-handle cursor-move bg-gray-700 text-white px-3 py-1 rounded-t-2xl border-b border-gray-600 flex justify-between items-center">
                    <span>{id.toUpperCase()}</span>
                </div>
                <ResizableBox
                    width={sizeRef.current.width}
                    height={sizeRef.current.height}
                    minConstraints={[MIN_PANEL_WIDTH, MIN_PANEL_HEIGHT]}
                    maxConstraints={[MAX_PANEL_WIDTH, MAX_PANEL_HEIGHT]}
                    axis="both"
                    onResize={onResize}
                    onResizeStop={onResizeStop}
                    resizeHandles={['se']}
                    className="bg-black text-white overflow-hidden border border-gray-600"
                    style={{ width: '100%', height: '100%' }}
                    handle={
                        <span
                            className="react-resizable-handle"
                            style={{
                                position: 'absolute',
                                width: 20,
                                height: 20,
                                bottom: 0,
                                right: 0,
                                background: 'rgba(255,255,255,0.5)',
                                cursor: 'se-resize',
                                zIndex: 10,
                                borderRadius: 4,
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                bringToFront(id);
                                isResizing.current = true;
                            }}
                        />
                    }
                >
                    <div className="p-2" style={{ width: '100%', height: '100%' }}>
                        {children}
                    </div>
                </ResizableBox>
            </div>
        </Draggable>
    );
});

export default DraggablePanel;