export interface Player {
    id: string;
    name: string;
    x: number;
    y: number;
    directionX: number;
    directionY: number;
    isCurrent?: boolean;
    textureIndex: number;
    dbId: string;
    isActive: boolean;
}