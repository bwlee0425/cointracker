// src/types/panels.ts

// 직사각형 타입 정의
export interface Rect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

// 패널 데이터 타입 정의
export interface PanelData {
    x: number;
    y: number;
    width: number;
    height: number;
}

// 패널 상태 타입 정의
export interface PanelState {
    [key: string]: PanelData;
}

// 프리셋 타입 정의
export interface Preset {
    name: string;
    state: PanelState;
    order: string[];
}

// DraggablePanel Props 타입 정의
export interface DraggablePanelProps {
    id: string;
    panelData: PanelData;
    handleDragStop: (
        e: React.MouseEvent | TouchEvent | PointerEvent, 
        data: { x: number; y: number }, 
        panelId: string, 
        size: { width: number; height: number }
    ) => void;
    handleResizeStop: (
        id: string, 
        newSize: { width: number; height: number }, 
        currentPosition: { x: number; y: number }
    ) => void;
    children: React.ReactNode;
    zIndex: number;
    bringToFront: (id: string) => void;
}

// ControlPanel Props 타입 정의
export interface ControlPanelProps {
    presets: Preset[];
    savePreset: () => void;
    loadPreset: (presetName: string) => void;
    resetSettings: () => void;
}

// PresetManager Props 타입 정의
export interface PresetManagerProps {
    presets: Preset[];
    loadPreset: (presetName: string) => void;
    deletePreset: (presetName: string) => void;
}