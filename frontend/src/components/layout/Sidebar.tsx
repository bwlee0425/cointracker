// src/components/layout/Sidebar.tsx
import React from 'react';
import { useRecoilState } from 'recoil';
import { visiblePanelsAtom } from '@/store/atoms';
import { panelConfig } from '@/config/panelConfig';
import { CheckSquare, Square } from 'lucide-react';

const Sidebar: React.FC = () => {
  const [visiblePanels, setVisiblePanels] = useRecoilState(visiblePanelsAtom);

  const togglePanel = (panelId: string) => {
    setVisiblePanels((prev) =>
      prev.includes(panelId) ? prev.filter((id) => id !== panelId) : [...prev, panelId]
    );
  };

  return (
    <aside className="w-64 h-screen bg-[#1f2937] border-r border-gray-700 p-4 flex flex-col shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-6 tracking-wide">🧩 Panel Selector</h3>
      <nav className="flex flex-col space-y-2">
        {panelConfig.map(({ id, label }) => {
          const isActive = visiblePanels.includes(id);
          return (
            <button
              key={id}
              onClick={() => togglePanel(id)}
              className={`flex items-center justify-between px-4 py-2 rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              <span className="font-medium">{label}</span>
              {isActive ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 border-t border-gray-700 text-sm text-gray-400">
        <p>Toggle the visibility of each panel.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
