export type Tool =
  | 'pencil'
  | 'eraser'
  | 'rectangle'
  | 'circle'
  | 'highlighter'
  | 'line'
  | 'arrow'
  | 'text'
  | 'hand'

export type StrokeStyle = 'solid' | 'dashed'

export type BrushSize = 'xs' | 's' | 'm' | 'l' | 'xl'

export type GridType = 'none' | 'dots' | 'lines' | 'grid'

export type GridSize = 10 | 20 | 50

export interface DrawEvent {
  x: number
  y: number
  prevX: number
  prevY: number
  color: string
  width: number
  tool?: Tool
  userId?: string
  opacity?: number
  strokeStyle?: StrokeStyle
}

export interface CursorEvent {
  x: number
  y: number
  userId: string
  color: string
}

export interface ToolbarFeatures {
  recentColors: string[]
  brushSize: BrushSize
  fillShapes: boolean
  gridType: GridType
  gridSize: GridSize
  gridSnap: boolean
}

