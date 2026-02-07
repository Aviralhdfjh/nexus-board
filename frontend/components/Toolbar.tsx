"use client";

import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Highlighter,
  Minus,
  ArrowRight,
  Type,
  Palette,
  Trash2,
  Wifi,
  WifiOff,
  Undo2,
  Redo2,
  Download,
} from "lucide-react";
import { useRef } from "react";
import type { Tool, StrokeStyle } from "@/types";

interface ToolbarProps {
  currentTool: Tool;
  color: string;
  strokeWidth: number;
  opacity: number;
  strokeStyle: StrokeStyle;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onOpacityChange: (opacity: number) => void;
  onStrokeStyleChange: (style: StrokeStyle) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExportPNG: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isConnected: boolean;
}

export default function Toolbar({
  currentTool,
  color,
  strokeWidth,
  opacity,
  strokeStyle,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onOpacityChange,
  onStrokeStyleChange,
  onClear,
  onUndo,
  onRedo,
  onExportPNG,
  canUndo,
  canRedo,
  isConnected,
}: ToolbarProps) {
  const colorPickerRef = useRef<HTMLInputElement>(null);

  const tools: { id: Tool; icon: typeof Pencil; label: string }[] = [
    { id: "pencil", icon: Pencil, label: "Pencil" },
    { id: "highlighter", icon: Highlighter, label: "Highlighter" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "arrow", icon: ArrowRight, label: "Arrow" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "text", icon: Type, label: "Text (placeholder)" },
  ];

  const handleClear = () => {
    if (confirm("Clear the board for everyone?")) {
      onClear();
    }
  };

  return (
    <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg max-w-[95vw]">
        {/* Connection */}
        <div
          title={isConnected ? "Connected" : "Disconnected"}
          className="flex items-center px-2"
        >
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="h-6 w-px bg-gray-300" />

        {/* Tools */}
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onToolChange(id)}
            title={label}
            className={`rounded p-2 transition-colors ${
              currentTool === id
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}

        <div className="h-6 w-px bg-gray-300" />

        {/* Color */}
        <input
          ref={colorPickerRef}
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="hidden"
        />
        <button
          type="button"
          title="Pick color"
          onClick={() => colorPickerRef.current?.click()}
          className="rounded p-2 transition-colors hover:bg-gray-100"
        >
          <Palette className="h-5 w-5" style={{ color }} />
        </button>

        <div className="h-6 w-px bg-gray-300" />

        {/* Stroke width */}
        <div className="flex items-center gap-1 px-1">
          <span className="text-xs text-gray-600">W</span>
          <input
            type="range"
            min={1}
            max={30}
            value={strokeWidth}
            aria-label="Stroke width"
            onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
            className="w-16"
          />
          <span className="w-5 text-xs text-gray-600">{strokeWidth}</span>
        </div>

        {/* Opacity */}
        <div className="flex items-center gap-1 px-1">
          <span className="text-xs text-gray-600">Op</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(opacity * 100)}
            aria-label="Opacity"
            onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
            className="w-16"
          />
          <span className="w-7 text-xs text-gray-600">
            {Math.round(opacity * 100)}%
          </span>
        </div>

        {/* Stroke style */}
        <div className="flex items-center gap-0.5 rounded border border-gray-200 p-0.5">
          <button
            type="button"
            title="Solid line"
            onClick={() => onStrokeStyleChange("solid")}
            className={`rounded px-2 py-1 text-xs ${
              strokeStyle === "solid" ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
            }`}
          >
            —
          </button>
          <button
            type="button"
            title="Dashed line"
            onClick={() => onStrokeStyleChange("dashed")}
            className={`rounded px-2 py-1 text-xs ${
              strokeStyle === "dashed" ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
            }`}
          >
            - -
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Undo / Redo */}
        <button
          type="button"
          title="Undo"
          onClick={onUndo}
          disabled={!canUndo}
          className={`rounded p-2 transition-colors ${
            canUndo ? "hover:bg-gray-100" : "cursor-not-allowed opacity-50"
          }`}
        >
          <Undo2 className="h-5 w-5" />
        </button>
        <button
          type="button"
          title="Redo"
          onClick={onRedo}
          disabled={!canRedo}
          className={`rounded p-2 transition-colors ${
            canRedo ? "hover:bg-gray-100" : "cursor-not-allowed opacity-50"
          }`}
        >
          <Redo2 className="h-5 w-5" />
        </button>

        <div className="h-6 w-px bg-gray-300" />

        {/* Export PNG */}
        <button
          type="button"
          title="Export as PNG"
          onClick={onExportPNG}
          className="rounded p-2 transition-colors hover:bg-gray-100"
        >
          <Download className="h-5 w-5" />
        </button>

        {/* Clear */}
        <button
          type="button"
          title="Clear board"
          onClick={handleClear}
          className="rounded p-2 text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
