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
  Moon,
  Sun,
} from "lucide-react";
import { useRef } from "react";
import type { Tool, StrokeStyle } from "@/types";

/* ================= PROPS ================= */

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
  darkMode: boolean;
  onToggleDark: () => void;
}

/* ================= COMPONENT ================= */

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
  darkMode,
  onToggleDark,
}: ToolbarProps) {
  const colorPickerRef = useRef<HTMLInputElement>(null);

  const tools: { id: Tool; icon: any; label: string }[] = [
    { id: "pencil", icon: Pencil, label: "Pencil (P)" },
    { id: "highlighter", icon: Highlighter, label: "Highlighter" },
    { id: "eraser", icon: Eraser, label: "Eraser (E)" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "arrow", icon: ArrowRight, label: "Arrow" },
    { id: "rectangle", icon: Square, label: "Rectangle (R)" },
    { id: "circle", icon: Circle, label: "Circle (C)" },
    { id: "text", icon: Type, label: "Text (Coming soon)" },
  ];

  const handleClear = () => {
    if (confirm("Clear the board for everyone?")) onClear();
  };

  /* ================= UI ================= */

  return (
    <div className="pointer-events-none absolute top-4 left-1/2 z-50 -translate-x-1/2">
      <div
        className={`
          pointer-events-auto flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 shadow-xl
          backdrop-blur-md transition-colors
          ${darkMode
            ? "border-neutral-700 bg-neutral-900/80 text-neutral-100"
            : "border-gray-200 bg-white/80 text-gray-800"}
        `}
      >
        {/* Connection */}
        <div
          title={isConnected ? "Connected" : "Disconnected"}
          className="flex items-center px-1"
        >
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
        </div>

        <Divider dark={darkMode} />

        {/* Tools */}
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => onToolChange(id)}
            className={`
              rounded-lg p-2 transition-all
              ${
                currentTool === id
                  ? darkMode
                    ? "bg-blue-600 text-white shadow"
                    : "bg-blue-500 text-white shadow"
                  : darkMode
                  ? "hover:bg-neutral-700"
                  : "hover:bg-gray-100"
              }
            `}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}

        <Divider dark={darkMode} />

        {/* Color Picker */}
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
          className={`rounded-lg p-2 transition-colors ${
            darkMode ? "hover:bg-neutral-700" : "hover:bg-gray-100"
          }`}
        >
          <Palette className="h-5 w-5" style={{ color }} />
        </button>

        <Divider dark={darkMode} />

        {/* Stroke Width */}
        <RangeControl
          label="W"
          value={strokeWidth}
          min={1}
          max={30}
          onChange={(v) => onStrokeWidthChange(v)}
          dark={darkMode}
        />

        {/* Opacity */}
        <RangeControl
          label="Op"
          value={Math.round(opacity * 100)}
          min={0}
          max={100}
          onChange={(v) => onOpacityChange(v / 100)}
          suffix="%"
          dark={darkMode}
        />

        {/* Stroke Style */}
        <div
          className={`flex items-center rounded-lg border p-0.5 ${
            darkMode ? "border-neutral-700" : "border-gray-200"
          }`}
        >
          {(["solid", "dashed"] as StrokeStyle[]).map((style) => (
            <button
              key={style}
              title={style}
              onClick={() => onStrokeStyleChange(style)}
              className={`rounded px-2 py-1 text-xs transition ${
                strokeStyle === style
                  ? darkMode
                    ? "bg-neutral-700 font-medium"
                    : "bg-gray-200 font-medium"
                  : darkMode
                  ? "hover:bg-neutral-800"
                  : "hover:bg-gray-100"
              }`}
            >
              {style === "solid" ? "—" : "- -"}
            </button>
          ))}
        </div>

        <Divider dark={darkMode} />

        {/* Undo / Redo */}
        <IconButton
          icon={Undo2}
          title="Undo (Ctrl+Z)"
          onClick={onUndo}
          disabled={!canUndo}
          dark={darkMode}
        />
        <IconButton
          icon={Redo2}
          title="Redo (Ctrl+Y)"
          onClick={onRedo}
          disabled={!canRedo}
          dark={darkMode}
        />

        <Divider dark={darkMode} />

        {/* Export */}
        <IconButton
          icon={Download}
          title="Export as PNG"
          onClick={onExportPNG}
          dark={darkMode}
        />

        {/* Clear */}
        <IconButton
          icon={Trash2}
          title="Clear board"
          onClick={handleClear}
          danger
          dark={darkMode}
        />

        <Divider dark={darkMode} />

        {/* Dark Mode Toggle */}
        <IconButton
          icon={darkMode ? Sun : Moon}
          title="Toggle dark mode"
          onClick={onToggleDark}
          dark={darkMode}
        />
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Divider({ dark }: { dark: boolean }) {
  return (
    <div
      className={`h-6 w-px ${dark ? "bg-neutral-700" : "bg-gray-300"}`}
    />
  );
}

function IconButton({
  icon: Icon,
  onClick,
  title,
  disabled,
  danger,
  dark,
}: {
  icon: any;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
  dark: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-lg p-2 transition
        ${
          disabled
            ? "cursor-not-allowed opacity-40"
            : danger
            ? "text-red-500 hover:bg-red-500/10"
            : dark
            ? "hover:bg-neutral-700"
            : "hover:bg-gray-100"
        }
      `}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
  dark,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
  dark: boolean;
}) {
  return (
    <div className="flex items-center gap-1 px-1">
      <span className={`text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16"
      />
      <span
        className={`w-8 text-xs text-right ${
          dark ? "text-neutral-400" : "text-gray-600"
        }`}
      >
        {value}
        {suffix}
      </span>
    </div>
  );
}
