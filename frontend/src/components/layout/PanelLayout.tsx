import React, { useEffect, useState, forwardRef, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { visiblePanelsAtom } from '@/store/atoms';
import { ResizableBox } from 'react-resizable';
import Draggable, { DraggableData } from 'react-draggable';
import { Liquidation } from '../widgets/Liquidation';
import { TradeVolume } from '../widgets/TradeVolume';
import { OrderBook } from '../widgets/OrderBook';
import { FundingRate } from '../widgets/FundingRate';
import { SymbolSelectorPanel } from '../widgets/SymbolSelectorPanel';

const PANEL_COMPONENTS: { [key: string]: React.ReactNode } = {
    liquidation: <Liquidation />,
    tradeVolume: <TradeVolume />,
    orderBook: <OrderBook />,
    symbolSelector: <SymbolSelectorPanel />,
    fundingRate: <FundingRate />,
};

const getPanelStateFromLocalStorage = () => {
    const savedState = localStorage.getItem('panelState');
    try {
        return savedState ? JSON.parse(savedState) : {};
    } catch (error) {
        console.error("Error parsing panelState from localStorage:", error);
        return {};
    }
};

const getPanelOrderFromLocalStorage = () => {
    const savedOrder = localStorage.getItem('panelOrder');
    try {
        return savedOrder ? JSON.parse(savedOrder) : [];
    } catch (error) {
        console.error("Error parsing panelOrder from localStorage:", error);
        return [];
    }
};

const savePanelStateToLocalStorage = (panelState: any, panelOrder: string[]) => {
    localStorage.setItem('panelState', JSON.stringify(panelState));
    localStorage.setItem('panelOrder', JSON.stringify(panelOrder));
};

const savePresetToLocalStorage = (presetName: string, panelState: any, panelOrder: string[]) => {
    const presets = JSON.parse(localStorage.getItem('presets') || '[]');
    presets.push({ name: presetName, state: panelState, order: panelOrder });
    localStorage.setItem('presets', JSON.stringify(presets));
};

const loadPresetFromLocalStorage = (presetName: string) => {
    const presets = JSON.parse(localStorage.getItem('presets') || '[]');
    const preset = presets.find((p: any) => p.name === presetName);
    return preset || { state: {}, order: [] };
};

const deletePresetFromLocalStorage = (presetName: string) => {
    const presets = JSON.parse(localStorage.getItem('presets') || '[]');
    const updatedPresets = presets.filter((p: any) => p.name !== presetName);
    localStorage.setItem('presets', JSON.stringify(updatedPresets));
};

const GRID_SIZE = 10; // Grid size (20px)
const MAGNETIC_THRESHOLD = 20; // 마그네틱 효과 발동 거리 (px)

const getPanelColor = (id: string) => {
    switch (id) {
        case 'fundingRate': return 'bg-fundingRate';
        case 'orderBook': return 'bg-orderBook';
        case 'tradeVolume': return 'bg-tradeVolume';
        case 'liquidation': return 'bg-liquidation';
        case 'symbolSelector': return 'bg-symbolSelector';
        default: return 'bg-gray-800';
    }
};

// ✅ Snap and Grid Alignment
const snapToEdgesAndGrid = (x: number, y: number, width: number, height: number) => {
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    let newX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    let newY = Math.round(y / GRID_SIZE) * GRID_SIZE;

    // Top-left corner
    if (Math.abs(newX) < 15) newX = 0;
    if (Math.abs(newY) < 15) newY = 0;

    // Bottom-right corner
    if (Math.abs(newX + width - winW) < 15) newX = winW - width;
    if (Math.abs(newY + height - winH) < 15) newY = winH - height;

    return { x: newX, y: newY };
};

// Define types for DraggablePanelProps
interface DraggablePanelProps {
    id: string;
    panelData: { width: number; height: number; x: number; y: number };
    handleDragStop: (e: any, data: DraggableData, panelId: string, size: { width: number; height: number }) => void;
    handleResizeStop: (id: string, newSize: any, currentPosition: { x: number; y: number }) => void;
    children: React.ReactNode;
}

// ✅ ForwardRef component with typed props
const DraggablePanel = forwardRef<HTMLDivElement, DraggablePanelProps>(({ id, panelData, handleDragStop, handleResizeStop, children }, ref) => {
    const [size, setSize] = useState({ width: panelData.width || 300, height: panelData.height || 200 });
    const panelRef = useRef<HTMLDivElement | null>(null);
    const currentPositionRef = useRef({ x: panelData.x || 0, y: panelData.y || 0 });

    const onDrag = (e: any, data: DraggableData) => {
        currentPositionRef.current = { x: data.x, y: data.y };
    };

    const onResize = (e: any, data: any) => {
        setSize(data.size);
    };

    const onResizeStop = (e: any, data: any) => {
        handleResizeStop(id, data.size, currentPositionRef.current);
    };

    return (
        <Draggable
            key={id}
            position={{ x: panelData.x || 0, y: panelData.y || 0 }}
            onStop={(e: any, data: DraggableData) => handleDragStop(e, data, id, size)}
            nodeRef={panelRef}
            bounds="#panel-container"
            onDrag={onDrag}
        >
            <div
                ref={panelRef}
                className={`panel ${getPanelColor(id)} transition-transform duration-300 ease-in-out rounded-2xl shadow-md border border-gray-500 p-0`}
                style={{ position: 'absolute', outline: '3px solid #FFD700' }}
            >
                <div className="drag-handle cursor-move bg-gray-700 text-white px-3 py-1 rounded-t-2xl border-b border-gray-600">
                    {id.toUpperCase()}
                </div>
                <ResizableBox
                    width={size.width}
                    height={size.height}
                    minConstraints={[150, 100]}
                    maxConstraints={[600, 400]}
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
                        />
                    }
                >
                    <div className="p-2" style={{ position: 'relative' }}>
                        {children}
                    </div>
                </ResizableBox>
            </div>
        </Draggable>
    );
});

export const PanelLayout: React.FC = () => {
    const visiblePanels = useRecoilValue(visiblePanelsAtom);
    const setVisiblePanels = useSetRecoilState(visiblePanelsAtom);
    const [panelState, setPanelState] = useState(getPanelStateFromLocalStorage);
    const [panelOrder, setPanelOrder] = useState(getPanelOrderFromLocalStorage);
    const [presets, setPresets] = useState(() => JSON.parse(localStorage.getItem('presets') || '[]'));

    useEffect(() => {
        console.log("PanelLayout Mount 또는 visiblePanels 변경됨:", visiblePanels);
        const needsInit = visiblePanels.some((id) => !panelState[id]?.x && !panelState[id]?.y);
        console.log("초기 위치 설정 필요:", needsInit);
        if (!needsInit) return;

        const newState = { ...panelState };
        const W = 300, H = 200, GAP_X = 20, GAP_Y = 20, COLS = 3;

        visiblePanels.forEach((id, i) => {
            if (newState[id]?.x || newState[id]?.y) return;
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            newState[id] = { x: 50 + col * (W + GAP_X), y: 50 + row * (H + GAP_Y), width: W, height: H };
            console.log(`초기 패널 위치 설정 - ${id}:`, newState[id]);
        });

        setPanelState(newState);
        if (panelOrder.length === 0) {
            setPanelOrder(visiblePanels);
            console.log("초기 패널 순서 설정:", visiblePanels);
        }
    }, [visiblePanels, panelState, panelOrder]);

    useEffect(() => {
        console.log("panelState 또는 panelOrder 변경됨:", panelState, panelOrder);
        savePanelStateToLocalStorage(panelState, panelOrder);
    }, [panelState, panelOrder]);

    useEffect(() => {
        localStorage.setItem('presets', JSON.stringify(presets));
    }, [presets]);

    const checkCollision = (rect1: { left: number; top: number; right: number; bottom: number }, rect2: { left: number; top: number; right: number; bottom: number }) => {
        return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
    };

    const findNearestSnapPoints = (currentRect: { left: number; top: number; right: number; bottom: number }, otherPanels: any) => {
        const snapPoints: { distance: number; x?: number; y?: number }[] = [];

        otherPanels.forEach((otherId) => {
            const otherPanelData = panelState[otherId];
            if (otherPanelData) {
                const otherRect = {
                    left: otherPanelData.x,
                    top: otherPanelData.y,
                    right: otherPanelData.x + otherPanelData.width,
                    bottom: otherPanelData.y + otherPanelData.height,
                };

                // 좌우 스냅 포인트
                let distance = Math.abs(currentRect.right - otherRect.left);
                if (distance < MAGNETIC_THRESHOLD) snapPoints.push({ distance, x: otherRect.left - (currentRect.right - currentRect.left) });
                distance = Math.abs(currentRect.left - otherRect.right);
                if (distance < MAGNETIC_THRESHOLD) snapPoints.push({ distance, x: otherRect.right });

                // 상하 스냅 포인트
                distance = Math.abs(currentRect.bottom - otherRect.top);
                if (distance < MAGNETIC_THRESHOLD) snapPoints.push({ distance, y: otherRect.top - (currentRect.bottom - currentRect.top) });
                distance = Math.abs(currentRect.top - otherRect.bottom);
                if (distance < MAGNETIC_THRESHOLD) snapPoints.push({ distance, y: otherRect.bottom });
            }
        });

        snapPoints.sort((a, b) => a.distance - b.distance);
        return snapPoints.length > 0 ? snapPoints[0] : null;
    };

    const applyMagneticEffect = (currentRect: { left: number; top: number }, snapPoint: { x?: number; y?: number }) => {
        const newPosition = { ...currentRect };
        if (snapPoint?.x !== undefined) newPosition.left = snapPoint.x;
        if (snapPoint?.y !== undefined) newPosition.top = snapPoint.y;
        return newPosition;
    };

    const handleDragStop = (e: any, data: any, panelId: string, size: { width: number; height: number }) => {
        const snapped = snapToEdgesAndGrid(data.x, data.y, size.width, size.height);
        const currentRect = { left: snapped.x, top: snapped.y, right: snapped.x + size.width, bottom: snapped.y + size.height };
        const otherPanels = visiblePanels.filter((id) => id !== panelId);
        const snapPoint = findNearestSnapPoints(currentRect, otherPanels);
        let finalPosition = { left: snapped.x, top: snapped.y };

        if (snapPoint) {
            finalPosition = applyMagneticEffect(currentRect, snapPoint);
        }

        // 최종 위치에서 겹침 검사
        let collision = false;
        const finalRect = { ...currentRect, left: finalPosition.left, top: finalPosition.top, right: finalPosition.left + size.width, bottom: finalPosition.top + size.height };
        otherPanels.forEach((otherId) => {
            const otherPanelData = panelState[otherId];
            if (otherPanelData && checkCollision(finalRect, { left: otherPanelData.x, top: otherPanelData.y, right: otherPanelData.x + otherPanelData.width, bottom: otherPanelData.y + otherPanelData.height })) {
                collision = true;
            }
        });

        setPanelState((prevState: any) => {
            const updatedState = {
                ...prevState,
                [panelId]: {
                    ...prevState[panelId],
                    x: collision ? prevState[panelId].x : finalPosition.left,
                    y: collision ? prevState[panelId].y : finalPosition.top,
                    width: size.width,
                    height: size.height,
                },
            };
            console.log(`패널 드래그 종료 - ${panelId}:`, updatedState[panelId]);
            return updatedState;
        });
    };

    const handleResizeStop = (id: string, newSize: any, currentPosition: { x: number; y: number }) => {
        const currentRect = { left: currentPosition.x, top: currentPosition.y, right: currentPosition.x + newSize.width, bottom: currentPosition.y + newSize.height };
        const otherPanels = visiblePanels.filter((otherId) => otherId !== id);
        let collision = false;

        otherPanels.forEach((otherId) => {
            const otherPanelData = panelState[otherId];
            if (otherPanelData && checkCollision(currentRect, { left: otherPanelData.x, top: otherPanelData.y, right: otherPanelData.x + otherPanelData.width, bottom: otherPanelData.y + otherPanelData.height })) {
                collision = true;
                return; // 하나라도 충돌하면 더 이상 검사할 필요 없음
            }
        });

        if (collision) {
            // 충돌 발생 시 이전 상태로 되돌림 (크기만)
            setPanelState((prevState: any) => ({
                ...prevState,
                [id]: {
                    ...prevState[id],
                    // 위치는 그대로 유지하고 크기만 되돌림
                    width: prevState[id].width,
                    height: prevState[id].height,
                },
            }));
            console.log(`패널 리사이즈 충돌 - ${id}: 이전 크기로 복원`);
        } else {
            // 충돌 없으면 새로운 크기 적용
            setPanelState((prevState: any) => ({
                ...prevState,
                [id]: {
                    ...prevState[id],
                    width: newSize.width,
                    height: newSize.height,
                },
            }));
            console.log(`패널 리사이즈 종료 - ${id}:`, { width: newSize.width, height: newSize.height });
        }
    };

    const savePreset = () => {
        const presetName = prompt('Enter preset name:');
        if (presetName) {
            console.log("프리셋 저장 시도:", presetName, panelState, panelOrder);
            const newPreset = { name: presetName, state: panelState, order: panelOrder };
            setPresets((prevPresets) => [...prevPresets, newPreset]);
            savePresetToLocalStorage(presetName, panelState, panelOrder); // localStorage에도 저장
        }
    };

    const loadPreset = (presetName: string) => {
        console.log("프리셋 로드 시도:", presetName);
        const preset = presets.find((p: any) => p.name === presetName);
        if (preset) {
            console.log("로드된 프리셋:", preset.state, preset.order);
            setPanelState(preset.state);
            setPanelOrder(preset.order);
        } else {
            // 로컬 스토리지에서 직접 로드
            const loadedPreset = loadPresetFromLocalStorage(presetName);
            if (loadedPreset) {
                setPanelState(loadedPreset.state);
                setPanelOrder(loadedPreset.order);
            }
        }
    };

    const deletePreset = (presetName: string) => {
        console.log("프리셋 삭제 시도:", presetName);
        setPresets((prevPresets) => prevPresets.filter((p: any) => p.name !== presetName));
        deletePresetFromLocalStorage(presetName);
    };

    const resetSettings = () => {
        console.log('Reset 버튼 클릭됨!');
        const initialPanelState: any = {};
        const initialPanelOrder: string[] = visiblePanels;

        const W = 300, H = 200, GAP_X = 20, GAP_Y = 20, COLS = 3;
        visiblePanels.forEach((id, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            initialPanelState[id] = { x: 50 + col * (W + GAP_X), y: 50 + row * (H + GAP_Y), width: W, height: H };
        });

        setPanelState(initialPanelState);
        setPanelOrder(initialPanelOrder);
        setVisiblePanels(visiblePanels);

        localStorage.removeItem('panelState');
        localStorage.removeItem('panelOrder');
        localStorage.removeItem('presets'); // Remove presets from local storage
        setPresets([]); // Clear the presets state
        console.log("상태 초기화 및 localStorage 제거됨");
    };

    return (
        <div className="w-full h-screen relative overflow-hidden bg-[#121212]" id="panel-container">
            {/* Save Preset Button */}
            <button
                onClick={savePreset}
                className="absolute top-5 px-4 py-2 bg-blue-600 text-white rounded-xl z-20"
                style={{ left: '10px', backgroundColor: 'white', color: 'black', padding: '10px' }}
            >
                Save Preset
            </button>

            {/* Load Presets Dropdown */}
            <div className="absolute top-5 px-4 py-2 rounded-xl z-10"
                style={{ left: '125px', backgroundColor: 'white', color: 'black', padding: '8px' }}
            >
                Load Presets:
                <select onChange={(e) => loadPreset(e.target.value)} className="ml-2">
                    <option value="">Select preset</option>
                    {presets.map((preset: any) => (
                        <option key={preset.name} value={preset.name}>
                            {preset.name}
                        </option>
                    ))}
                </select>
                {presets.length > 0 && (
                    <div className="mt-2">
                        {presets.map((preset: any) => (
                            <div key={preset.name} className="flex items-center justify-between py-1">
                                <span className="text-sm">{preset.name}</span>
                                <button
                                    onClick={() => deletePreset(preset.name)}
                                    className="ml-2 px-2 py-1 bg-red-500 text-white rounded-md text-xs"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reset Settings Button */}
            <button
                onClick={resetSettings}
                className="absolute top-5 px-4 py-2 bg-red-600 text-white rounded-xl z-20"
                style={{ left: '375px', backgroundColor: 'white', color: 'black', padding: '10px' }}
            >
                Reset Settings
            </button>

            {/* Draggable Panels */}
            {panelOrder.map((id) => (
                visiblePanels.includes(id) && (
                    <DraggablePanel
                        key={id}
                        id={id}
                        panelData={panelState[id]}
                        handleDragStop={handleDragStop}
                        handleResizeStop={handleResizeStop}
                    >
                        {PANEL_COMPONENTS[id]}
                    </DraggablePanel>
                )
            ))}
        </div>
    );
};
