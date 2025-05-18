
// src/utils/storageUtils.ts
import { PanelState, Preset } from '../types/panels';

// 로컬 스토리지에서 패널 상태 불러오기
export const getPanelStateFromLocalStorage = (): PanelState => {
    const savedState = localStorage.getItem('panelState');
    try {
        return savedState ? JSON.parse(savedState) : {};
    } catch (error) {
        console.error("Error parsing panelState from localStorage:", error);
        return {};
    }
};

// 로컬 스토리지에서 패널 순서 불러오기
export const getPanelOrderFromLocalStorage = (): string[] => {
    const savedOrder = localStorage.getItem('panelOrder');
    try {
        return savedOrder ? JSON.parse(savedOrder) : [];
    } catch (error) {
        console.error("Error parsing panelOrder from localStorage:", error);
        return [];
    }
};

// 패널 상태와 순서를 로컬 스토리지에 저장
export const savePanelStateToLocalStorage = (panelState: PanelState, panelOrder: string[]): void => {
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

// 프리셋 관련 로컬 스토리지 함수들
export const savePresetToLocalStorage = (presetName: string, panelState: PanelState, panelOrder: string[]): void => {
    try {
        const presets = JSON.parse(localStorage.getItem('presets') || '[]');
        presets.push({ name: presetName, state: panelState, order: panelOrder });
        localStorage.setItem('presets', JSON.stringify(presets));
    } catch (error) {
        console.error("Error saving preset to localStorage:", error);
    }
};

export const loadPresetFromLocalStorage = (presetName: string): Preset | null => {
    try {
        const presets = JSON.parse(localStorage.getItem('presets') || '[]');
        const preset = presets.find((p: Preset) => p.name === presetName);
        return preset || null;
    } catch (error) {
        console.error("Error loading preset from localStorage:", error);
        return null;
    }
};

export const deletePresetFromLocalStorage = (presetName: string): void => {
    try {
        const presets = JSON.parse(localStorage.getItem('presets') || '[]');
        const updatedPresets = presets.filter((p: Preset) => p.name !== presetName);
        localStorage.setItem('presets', JSON.stringify(updatedPresets));
    } catch (error) {
        console.error("Error deleting preset from localStorage:", error);
    }
};

export const getPresetsFromLocalStorage = (): Preset[] => {
    try {
        return JSON.parse(localStorage.getItem('presets') || '[]');
    } catch (error) {
        console.error("Error getting presets from localStorage:", error);
        return [];
    }
};