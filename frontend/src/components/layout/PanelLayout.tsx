import React, { useEffect, useState, forwardRef } from 'react';
import { useRecoilValue } from 'recoil';
import { visiblePanelsAtom } from '@/store/atoms';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';
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

// 로컬 스토리지에서 패널 상태 가져오기
const getPanelStateFromLocalStorage = () => {
    const savedState = localStorage.getItem('panelState');
    return savedState ? JSON.parse(savedState) : {};
};

// 로컬 스토리지에서 패널 순서 가져오기
const getPanelOrderFromLocalStorage = () => {
    const savedOrder = localStorage.getItem('panelOrder');
    return savedOrder ? JSON.parse(savedOrder) : [];
};

// 패널 상태를 로컬 스토리지에 저장하기
const savePanelStateToLocalStorage = (panelState: any, panelOrder: string[]) => {
    localStorage.setItem('panelState', JSON.stringify(panelState));
    localStorage.setItem('panelOrder', JSON.stringify(panelOrder));
};

const getPanelColor = (id: string) => {
    switch (id) {
        case 'fundingRate':
            return 'bg-fundingRate';
        case 'orderBook':
            return 'bg-orderBook';
        case 'tradeVolume':
            return 'bg-tradeVolume';
        case 'liquidation':
            return 'bg-liquidation';
        case 'symbolSelector':
            return 'bg-symbolSelector';
        default:
            return 'bg-gray-800';
    }
};

const DraggablePanel = forwardRef(({ id, panelData, handleDragStop, handleResizeStop, children }: any, ref: any) => {
    const [size, setSize] = useState({ width: panelData.width || 300, height: panelData.height || 200 });

    const onResize = (e: any, data: any) => {
        setSize(data.size);
    };

    const onResizeStop = (e: any, data: any) => {
        handleResizeStop(id, data.size);
    };

    return (
        <Draggable
            key={id}
            position={{ x: panelData.x || 0, y: panelData.y || 0 }}
            onStop={(e, data) => handleDragStop(e, data, id)}
            nodeRef={ref}
            handle=".drag-handle"
        >
            <div
                ref={ref}
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
    const [panelState, setPanelState] = useState(getPanelStateFromLocalStorage);
    const [panelOrder, setPanelOrder] = useState(getPanelOrderFromLocalStorage);

    // 로컬 스토리지에서 패널 상태와 순서가 없으면 기본값 설정
    useEffect(() => {
        if (panelOrder.length === 0 && visiblePanels.length > 0) {
            setPanelOrder(visiblePanels);
        }
    }, [visiblePanels, panelOrder]);

    // 패널 상태와 순서가 변경되면 로컬 스토리지에 저장
    useEffect(() => {
        savePanelStateToLocalStorage(panelState, panelOrder);
    }, [panelState, panelOrder]);

    // 패널 드래그 종료 후 상태 업데이트
    const handleDragStop = (e: any, data: any, panelId: string) => {
        setPanelState((prevState: any) => ({
            ...prevState,
            [panelId]: {
                ...prevState[panelId],
                x: data.x,
                y: data.y,
            },
        }));
    };

    // 패널 크기 조정 후 상태 업데이트
    const handleResizeStop = (id: string, newSize: any) => {
        setPanelState((prevState: any) => ({
            ...prevState,
            [id]: {
                ...prevState[id],
                width: newSize.width,
                height: newSize.height,
            },
        }));
    };

    // 패널 순서 변경 후 상태 업데이트
    const handlePanelOrderChange = (newOrder: string[]) => {
        setPanelOrder(newOrder);
    };

    return (
        <div className="w-full h-screen relative overflow-visible bg-[#121212]">
            {panelOrder.map((id) => {
                const panelData = panelState[id] || {};
                return (
                    <DraggablePanel
                        key={id}
                        id={id}
                        panelData={panelData}
                        handleDragStop={handleDragStop}
                        handleResizeStop={handleResizeStop}
                        ref={React.createRef()}
                    >
                        {PANEL_COMPONENTS[id]}
                    </DraggablePanel>
                );
            })}
        </div>
    );
};
