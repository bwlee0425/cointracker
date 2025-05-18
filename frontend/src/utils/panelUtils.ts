// src/utils/panelUtils.ts
import { Rect, PanelState } from '../types/panels';
import { GRID_SIZE, MAGNETIC_THRESHOLD } from '../constants/panelConstants';

// 그리드에 맞추고 화면 가장자리에 스냅하는 함수
export const snapToEdgesAndGrid = (x: number, y: number, width: number, height: number): { x: number; y: number } => {
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // 그리드에 맞춤
    let newX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    let newY = Math.round(y / GRID_SIZE) * GRID_SIZE;

    // 화면 가장자리에 스냅
    if (Math.abs(newX) < 15) newX = 0;
    if (Math.abs(newY) < 15) newY = 0;
    if (Math.abs(newX + width - winW) < 15) newX = winW - width;
    if (Math.abs(newY + height - winH) < 15) newY = winH - height;

    return { x: newX, y: newY };
};

// 다른 패널과의 충돌을 검사하는 함수
export const checkCollision = (rect1: Rect, rect2: Rect): boolean => {
    return !(
        rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom
    );
};

// 가장 가까운 스냅 포인트를 찾는 함수
export const findNearestSnapPoints = (
    currentRect: Rect, 
    otherPanels: string[], 
    panelState: PanelState
): { distance: number; x?: number; y?: number } | null => {
    const snapPoints: { distance: number; x?: number; y?: number }[] = [];

    otherPanels.forEach((otherId: string) => {
        const otherPanelData = panelState[otherId];
        if (otherPanelData) {
            const otherRect: Rect = {
                left: otherPanelData.x,
                top: otherPanelData.y,
                right: otherPanelData.x + otherPanelData.width,
                bottom: otherPanelData.y + otherPanelData.height,
            };

            // 좌우 스냅 포인트
            let distance = Math.abs(currentRect.right - otherRect.left);
            if (distance < MAGNETIC_THRESHOLD) {
                snapPoints.push({ 
                    distance, 
                    x: otherRect.left - (currentRect.right - currentRect.left) 
                });
            }
            
            distance = Math.abs(currentRect.left - otherRect.right);
            if (distance < MAGNETIC_THRESHOLD) {
                snapPoints.push({ 
                    distance, 
                    x: otherRect.right 
                });
            }

            // 상하 스냅 포인트
            distance = Math.abs(currentRect.bottom - otherRect.top);
            if (distance < MAGNETIC_THRESHOLD) {
                snapPoints.push({ 
                    distance, 
                    y: otherRect.top - (currentRect.bottom - currentRect.top) 
                });
            }
            
            distance = Math.abs(currentRect.top - otherRect.bottom);
            if (distance < MAGNETIC_THRESHOLD) {
                snapPoints.push({ 
                    distance, 
                    y: otherRect.bottom 
                });
            }
        }
    });

    snapPoints.sort((a, b) => a.distance - b.distance);
    return snapPoints.length > 0 ? snapPoints[0] : null;
};

// 충돌을 피해 새 위치를 찾는 함수
export const findNonCollidingPosition = (
    panelId: string,
    initialPos: { x: number; y: number },
    size: { width: number; height: number },
    otherPanels: string[],
    panelState: PanelState
): { x: number; y: number } => {
    const positions = [
        { x: initialPos.x, y: initialPos.y },  // 원래 위치
        { x: initialPos.x + GRID_SIZE, y: initialPos.y },  // 오른쪽
        { x: initialPos.x - GRID_SIZE, y: initialPos.y },  // 왼쪽
        { x: initialPos.x, y: initialPos.y + GRID_SIZE },  // 아래
        { x: initialPos.x, y: initialPos.y - GRID_SIZE },  // 위
        { x: initialPos.x + GRID_SIZE, y: initialPos.y + GRID_SIZE },  // 오른쪽 아래
        { x: initialPos.x - GRID_SIZE, y: initialPos.y - GRID_SIZE },  // 왼쪽 위
        { x: initialPos.x + GRID_SIZE, y: initialPos.y - GRID_SIZE },  // 오른쪽 위
        { x: initialPos.x - GRID_SIZE, y: initialPos.y + GRID_SIZE },  // 왼쪽 아래
    ];

    // 가능한 위치들을 시도
    for (const pos of positions) {
        const testRect: Rect = {
            left: pos.x,
            top: pos.y,
            right: pos.x + size.width,
            bottom: pos.y + size.height
        };

        let hasCollision = false;
        for (const otherId of otherPanels) {
            if (otherId === panelId) continue;
            
            const otherPanelData = panelState[otherId];
            if (!otherPanelData) continue;
            
            const otherRect: Rect = {
                left: otherPanelData.x,
                top: otherPanelData.y,
                right: otherPanelData.x + otherPanelData.width,
                bottom: otherPanelData.y + otherPanelData.height
            };

            if (checkCollision(testRect, otherRect)) {
                hasCollision = true;
                break;
            }
        }

        if (!hasCollision) {
            return pos;
        }
    }

    // 아무 위치도 적합하지 않으면 원래 위치의 오른쪽 하단에 배치
    return { 
        x: initialPos.x + GRID_SIZE * 2, 
        y: initialPos.y + GRID_SIZE * 2 
    };
};

// 매그네틱 효과 적용
export const applyMagneticEffect = (currentRect: Rect, snapPoint: { x?: number; y?: number }) => {
    const newPosition = { left: currentRect.left, top: currentRect.top };
    if (snapPoint?.x !== undefined) newPosition.left = snapPoint.x;
    if (snapPoint?.y !== undefined) newPosition.top = snapPoint.y;
    return newPosition;
};