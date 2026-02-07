export type Tool =
  | 'pencil'
  | 'eraser'
  | 'rectangle'
  | 'circle'
  | 'highlighter'
  | 'line'
  | 'arrow'
  | 'text'

export type StrokeStyle = 'solid' | 'dashed'

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

