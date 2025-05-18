import React, { useEffect, useState, useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { visiblePanelsAtom } from '@/store/atoms';
import { DraggablePanel } from '../panels/DraggablePanel';
import { ControlPanel } from '../panels/ControlPanel';
import { PanelState, Preset, PanelData } from '@/types/panels';
import { 
  DEFAULT_PANEL_WIDTH, 
  DEFAULT_PANEL_HEIGHT, 
  PANEL_COMPONENTS 
} from '@/constants/panelConstants';
import { 
  checkCollision, 
  snapToEdgesAndGrid, 
  findNearestSnapPoints, 
  findNonCollidingPosition,
  Rect 
} from '@/utils/panelUtils';
import { 
  getPanelStateFromLocalStorage, 
  getPanelOrderFromLocalStorage, 
  savePanelStateToLocalStorage 
} from '@/utils/storageUtils';
import { DraggableData, DraggableEvent } from 'react-draggable';

// 메인 패널 레이아웃 컴포넌트
export const PanelLayout: React.FC = () => {
  const visiblePanels = useRecoilValue(visiblePanelsAtom);
  const setVisiblePanels = useSetRecoilState(visiblePanelsAtom);
  const [panelState, setPanelState] = useState<PanelState>(getPanelStateFromLocalStorage);
  const [panelOrder, setPanelOrder] = useState<string[]>(getPanelOrderFromLocalStorage);
  const [presets, setPresets] = useState<Preset[]>(() => {
    const savedPresets = localStorage.getItem('presets');
    return savedPresets ? JSON.parse(savedPresets) : [];
  });
  const [zIndexes, setZIndexes] = useState<{[key: string]: number}>({});

  // 패널을 맨 앞으로 가져오는 함수
  const bringToFront = useCallback((id: string) => {
    setZIndexes(prev => {
      const maxZ = Math.max(0, ...Object.values(prev));
      return { ...prev, [id]: maxZ + 1 };
    });
  }, []);

  // 패널 초기 위치 설정
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
    const W = DEFAULT_PANEL_WIDTH, H = DEFAULT_PANEL_HEIGHT;
    const COLS = 3;
    const newZIndexes: {[key: string]: number} = {};

    visiblePanels.forEach((id, i) => {
      if (newState[id]?.x !== undefined && newState[id]?.y !== undefined) {
        newZIndexes[id] = i + 1;
        return;
      }
      
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      
      // 패널을 정확히 붙이기 위해 위치 계산
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

  // localStorage에 프리셋 저장
  useEffect(() => {
    localStorage.setItem('presets', JSON.stringify(presets));
  }, [presets]);

  // 매그네틱 효과 적용
  const applyMagneticEffect = (currentRect: Rect, snapPoint: { x?: number; y?: number }) => {
    const newPosition = { left: currentRect.left, top: currentRect.top };
    if (snapPoint?.x !== undefined) newPosition.left = snapPoint.x;
    if (snapPoint?.y !== undefined) newPosition.top = snapPoint.y;
    return newPosition;
  };

  // 드래그 종료 처리
  const handleDragStop = (
    e: DraggableEvent, 
    data: DraggableData, 
    panelId: string, 
    size: { width: number; height: number }
  ) => {
    // 그리드에 맞추고 화면 가장자리에 스냅
    const snapped = snapToEdgesAndGrid(data.x, data.y, size.width, size.height);
    
    // 현재 패널의 영역 계산
    const currentRect: Rect = { 
      left: snapped.x, 
      top: snapped.y, 
      right: snapped.x + size.width, 
      bottom: snapped.y + size.height 
    };
    
    // 다른 패널들의 목록
    const otherPanels = visiblePanels.filter((id) => id !== panelId);
    
    // 매그네틱 효과를 위한 가장 가까운 스냅 포인트 찾기
    const snapPoint = findNearestSnapPoints(currentRect, otherPanels, panelState);
    let finalPosition = { left: snapped.x, top: snapped.y };

    // 매그네틱 효과 적용
    if (snapPoint) {
      finalPosition = applyMagneticEffect(currentRect, snapPoint);
    }

    // 최종 위치에서 충돌 검사
    let collision = false;
    const finalRect: Rect = { 
      left: finalPosition.left, 
      top: finalPosition.top, 
      right: finalPosition.left + size.width, 
      bottom: finalPosition.top + size.height 
    };
    
    otherPanels.forEach((otherId) => {
      const otherPanelData = panelState[otherId];
      if (otherPanelData) {
        const otherRect: Rect = { 
          left: otherPanelData.x, 
          top: otherPanelData.y, 
          right: otherPanelData.x + otherPanelData.width, 
          bottom: otherPanelData.y + otherPanelData.height 
        };
        
        if (checkCollision(finalRect, otherRect)) {
          collision = true;
        }
      }
    });

    // 상태 업데이트
    setPanelState((prevState) => {
      let newPosition = { x: finalPosition.left, y: finalPosition.top };
      
      // 충돌이 발생한 경우 충돌하지 않는 위치 찾기
      if (collision) {
        newPosition = findNonCollidingPosition(
          panelId,
          { x: finalPosition.left, y: finalPosition.top },
          size,
          visiblePanels,
          prevState
        );
      }
      
      const updatedState = {
        ...prevState,
        [panelId]: {
          ...prevState[panelId],
          x: newPosition.x,
          y: newPosition.y,
          width: size.width,
          height: size.height,
        },
      };
      
      console.log(`패널 드래그 종료 - ${panelId}:`, updatedState[panelId]);
      return updatedState;
    });
  };

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

  // 프리셋 저장
  const savePreset = () => {
    const presetName = prompt('Enter preset name:');
    if (!presetName) return;
    
    console.log("프리셋 저장:", presetName);
    
    const newPreset: Preset = { 
      name: presetName, 
      state: panelState, 
      order: panelOrder 
    };
    
    setPresets(prevPresets => [...prevPresets, newPreset]);
  };

  // 프리셋 로드
  const loadPreset = (presetName: string) => {
    if (!presetName) return; // 빈 값 선택 시 무시
    
    console.log("프리셋 로드:", presetName);
    const preset = presets.find(p => p.name === presetName);
    
    if (preset) {
      console.log("로드된 프리셋:", preset.state, preset.order);
      setPanelState(preset.state);
      setPanelOrder(preset.order);
      
      // Recoil 상태 업데이트 (visible 패널 설정)
      const newVisiblePanels = [...preset.order].filter(id => 
        preset.state[id] && 
        (preset.state[id].x !== undefined || preset.state[id].y !== undefined)
      );
      
      if (newVisiblePanels.length > 0) {
        setVisiblePanels(newVisiblePanels);
      }
      
      // zIndex 초기화
      const newZIndexes: {[key: string]: number} = {};
      preset.order.forEach((id, idx) => {
        if (newVisiblePanels.includes(id)) {
          newZIndexes[id] = idx + 1;
        }
      });
      setZIndexes(newZIndexes);
    }
  };

  // 프리셋 삭제
  const deletePreset = (presetName: string) => {
    console.log("프리셋 삭제:", presetName);
    setPresets(prevPresets => prevPresets.filter(p => p.name !== presetName));
  };

  // 설정 초기화
  const resetSettings = useCallback(() => {
    console.log('설정 초기화');
    
    // 기본 패널 설정 생성
    const initialPanelState: PanelState = {};
    const initialPanelOrder: string[] = [...visiblePanels];
    const newZIndexes: {[key: string]: number} = {};

    const W = DEFAULT_PANEL_WIDTH;
    const H = DEFAULT_PANEL_HEIGHT;
    const COLS = 3;
    
    visiblePanels.forEach((id, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      
      initialPanelState[id] = { 
        x: col * W, 
        y: 30 + row * H, 
        width: W, 
        height: H 
      };
      
      newZIndexes[id] = i + 1;
    });

    // 상태 업데이트
    setPanelState(initialPanelState);
    setPanelOrder(initialPanelOrder);
    setZIndexes(newZIndexes);

    // localStorage 초기화
    localStorage.removeItem('panelState');
    localStorage.removeItem('panelOrder');
    localStorage.removeItem('presets');
    setPresets([]);
    
    console.log("상태 초기화 및 localStorage 제거 완료");
  }, [visiblePanels, setVisiblePanels]);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#121212]" id="panel-container">
      {/* 컨트롤 패널 */}
      <ControlPanel 
        presets={presets}
        savePreset={savePreset}
        loadPreset={loadPreset}
        resetSettings={resetSettings}
        deletePreset={deletePreset}
      />

      {/* 드래그 가능한 패널들 */}
      {panelOrder
        .filter(id => visiblePanels.includes(id))
        .map((id) => {
          const panelData: PanelData = panelState[id] || { 
            x: 0, 
            y: 0, 
            width: DEFAULT_PANEL_WIDTH, 
            height: DEFAULT_PANEL_HEIGHT 
          };
          
          return (
            <DraggablePanel
              key={id}
              id={id}
              panelData={panelData}
              handleDragStop={handleDragStop}
              handleResizeStop={handleResizeStop}
              zIndex={zIndexes[id] || 1}
              bringToFront={bringToFront}
            >
              {PANEL_COMPONENTS[id]}
            </DraggablePanel>
          );
        })}
    </div>
  );
};