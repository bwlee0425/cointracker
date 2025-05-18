// 패널 초기 위치 설정 - 패널 간격 수정
useEffect(() => {
    // 패널 상태에 visible 패널이 없거나 초기화 필요한지 확인
    const needsInit = visiblePanels.some((id) => 
        !panelState[id] || (panelState[id] && (panelState[id].x === undefined || panelState[id].y === undefined))
    );
    
    if (!needsInit) {
        // zIndex 초기화 (패널 순서에 따라)
        const newZIndexes: {[key: string]: number} = {};
        panelOrder.forEach((id, idx) => {
            if (visiblePanels.includes(id)) {
                newZIndexes[id] = idx + 1;
            }
        });
        setZIndexes(newZIndexes);
        return;
    }

    console.log("패널 초기 위치 설정 필요");
    
    const newState = { ...panelState };
    const W = DEFAULT_PANEL_WIDTH;
    const H = DEFAULT_PANEL_HEIGHT; 
    // 패널 간격 완전히 제거 (간격 0으로 설정)
    const GAP_X = 0;
    const GAP_Y = 0;
    const COLS = 3;
    const newZIndexes: {[key: string]: number} = {};

    visiblePanels.forEach((id, i) => {
        if (newState[id]?.x !== undefined && newState[id]?.y !== undefined) {
            newZIndexes[id] = i + 1;
            return;
        }
        
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        
        // 패널을 정확히 붙이기 위해 위치 계산 방식 수정
        newState[id] = { 
            x: col * W, 
            y: 30 + row * H, 
            width: W, 
            height: H 
        };
        
        newZIndexes[id] = i + 1;
        console.log(`패널 초기 위치 설정 - ${id}:`, newState[id]);
    });

    setPanelState(newState);
    setZIndexes(newZIndexes);
    
    if (panelOrder.length === 0 || visiblePanels.some(id => !panelOrder.includes(id))) {
        setPanelOrder([...visiblePanels]);
    }
}, [visiblePanels]); // 의존성에서 panelState와 panelOrder 제거

// 리사이즈 관련 코드 수정 - DraggablePanel 컴포넌트 내부
const DraggablePanel = forwardRef<HTMLDivElement, DraggablePanelProps>((
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

// localStorage 관련 오류 방지를 위한 수정
// 로컬 스토리지에 패널 상태 저장 함수 개선
const savePanelStateToLocalStorage = (panelState: any, panelOrder: string[]) => {
    try {
        // 저장 전 유효성 검사
        if (panelState && typeof panelState === 'object' && Object.keys(panelState).length > 0) {
            localStorage.setItem('panelState', JSON.stringify(panelState));
        }
        
        if (Array.isArray(panelOrder) && panelOrder.length > 0) {
            localStorage.setItem('panelOrder', JSON.stringify(panelOrder));
        }
    } catch (error) {
        console.error("Error saving panel state to localStorage:", error);
    }
};

// localStorage에 패널 상태 저장 - 에러 처리 추가
useEffect(() => {
    try {
        if (Object.keys(panelState).length > 0 && panelOrder.length > 0) {
            savePanelStateToLocalStorage(panelState, panelOrder);
        }
    } catch (error) {
        console.error("Failed to save panel state:", error);
    }
}, [panelState, panelOrder]);

// 핸들러 함수 업데이트 - 패널 리사이즈 종료
const handleResizeStop = (
    id: string, 
    newSize: { width: number; height: number }, 
    currentPosition: { x: number; y: number }
) => {
    setPanelState((prevState) => {
        // 이전 상태가 없는 경우 기본값 사용
        if (!prevState || !prevState[id]) {
            return {
                ...prevState,
                [id]: {
                    x: currentPosition.x,
                    y: currentPosition.y,
                    width: newSize.width,
                    height: newSize.height,
                }
            };
        }
        
        // 충돌 검사
        const currentRect: Rect = {
            left: currentPosition.x,
            top: currentPosition.y,
            right: currentPosition.x + newSize.width,
            bottom: currentPosition.y + newSize.height
        };
        
        let collision = false;
        const otherPanels = visiblePanels.filter(panelId => panelId !== id);
        
        otherPanels.forEach(otherId => {
            const otherData = prevState[otherId];
            if (!otherData) return;
            
            const otherRect: Rect = {
                left: otherData.x,
                top: otherData.y,
                right: otherData.x + otherData.width,
                bottom: otherData.y + otherData.height
            };
            
            if (checkCollision(currentRect, otherRect)) {
                collision = true;
            }
        });
        
        // 새 크기 적용, 충돌이 있어도 사이즈 변경 허용
        return {
            ...prevState,
            [id]: {
                ...prevState[id],
                width: newSize.width,
                height: newSize.height,
                x: currentPosition.x,
                y: currentPosition.y,
            },
        };
    });
    
    // 패널을 최상위로 가져오기
    bringToFront(id);
};