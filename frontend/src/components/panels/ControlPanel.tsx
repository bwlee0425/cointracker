// src/components/panels/ControlPanel.tsx
import React from 'react';
import { ControlPanelProps } from '../../types/panels';

export const ControlPanel: React.FC<ControlPanelProps> = ({
    presets,
    savePreset,
    loadPreset,
    resetSettings
}) => {
    return (
        <div className="absolute top-0 left-0 right-0 bg-gray-900 p-2 flex items-center gap-4 z-50">
            {/* Save Preset Button */}
            <button
                onClick={savePreset}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl"
            >
                Save Preset
            </button>

            {/* Load Presets Dropdown */}
            <div className="px-4 py-2 bg-gray-800 rounded-xl flex items-center">
                <span className="text-white mr-2">Load Preset:</span>
                <select 
                    onChange={(e) => loadPreset(e.target.value)} 
                    className="bg-gray-700 text-white p-1 rounded"
                    value="" // 항상 "Select preset"이 기본 선택되도록
                >
                    <option value="">Select preset</option>
                    {presets.map((preset) => (
                        <option key={preset.name} value={preset.name}>
                            {preset.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Reset Settings Button */}
            <button
                onClick={resetSettings}
                className="px-4 py-2 bg-red-600 text-white rounded-xl"
            >
                Reset Layout
            </button>
        </div>
    );
};

export default ControlPanel;