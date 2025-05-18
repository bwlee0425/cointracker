import React from 'react';
import { Rnd } from 'react-rnd';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
}

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  defaultPosition = { x: 10, y: 10 },
  defaultSize = { width: 280, height: 180 },
}) => {
  return (
    <Rnd
      default={{
        x: defaultPosition.x,
        y: defaultPosition.y,
        width: defaultSize.width,
        height: defaultSize.height,
      }}
      bounds="window"
      dragHandleClassName="panel-title"
      minWidth={200}
      minHeight={100}
      draggable={false}
      resizable={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      style={{ userSelect: 'none', pointerEvents: 'none' }} // draggable, resizable = {false} 가 안먹힘. 부모컴포때문인가?
    >
      <div className="rounded-lg shadow-lg bg-gray-800 border border-gray-700 flex flex-col h-full">
        <div className="panel-title cursor-move p-2 bg-gray-900 text-white font-bold rounded-t-md">
          {title}
        </div>
        <div className="flex-1 p-3 overflow-auto">
          {children}
        </div>
      </div>
    </Rnd>
  );
};
