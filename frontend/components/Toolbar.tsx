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

/* ================= CONFIG ================= */

const TOOLS: { id: Tool; icon: any; label: string }[] = [
  { id: "pencil", icon: Pencil, label: "Pencil (P)" },
  { id: "highlighter", icon: Highlighter, label: "Highlighter" },
  { id: "eraser", icon: Eraser, label: "Eraser (E)" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "arrow", icon: ArrowRight, label: "Arrow" },
  { id: "rectangle", icon: Square, label: "Rectangle (R)" },
  { id: "circle", icon: Circle, label: "Circle (C)" },
  { id: "text", icon: Type, label: "Text (Coming soon)" },
];

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
  const colorRef = useRef<HTMLInputElement>(null);

  const baseBg = darkMode
    ? "bg-neutral-900/90 border-white/10 text-neutral-100"
    : "bg-white/90 border-gray-200 text-gray-800";

  const hoverBg = darkMode ? "hover:bg-white/10" : "hover:bg-gray-100";

  const activeBg = "bg-blue-500 text-white shadow-md shadow-blue-500/30";

  const handleClear = () => {
    if (confirm("Clear the board for everyone?")) onClear();
  };

  return (
    <div className="pointer-events-none absolute left-4 top-1/2 z-50 -translate-y-1/2">
      <div
        className={`
          pointer-events-auto flex flex-col items-center gap-3
          rounded-2xl border px-3 py-4 shadow-2xl backdrop-blur-xl
          transition-colors ${baseBg}
        `}
      >
        {/* Connection */}
        {!isConnected && (
          <WifiOff className="h-4 w-4 text-rose-500" title="Disconnected" />
        )}

        <Divider dark={darkMode} />

        {/* Tools */}
        <div className="grid grid-cols-2 gap-2">
          {TOOLS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              title={label}
              onClick={() => onToolChange(id)}
              className={`
                rounded-xl p-3 transition-all
                ${
                  currentTool === id
                    ? activeBg
                    : `${hoverBg} active:scale-95`
                }
              `}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <Divider dark={darkMode} />

        {/* Color Picker */}
        <input
          ref={colorRef}
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="hidden"
        />
        <IconButton
          icon={Palette}
          title="Pick color"
          onClick={() => colorRef.current?.click()}
          style={{ color }}
          dark={darkMode}
        />

        <Divider dark={darkMode} />

        {/* Sliders */}
        <VerticalSlider
          label="W"
          value={strokeWidth}
          min={1}
          max={30}
          onChange={onStrokeWidthChange}
          dark={darkMode}
        />
        <VerticalSlider
          label="Op"
          value={Math.round(opacity * 100)}
          min={0}
          max={100}
          onChange={(v) => onOpacityChange(v / 100)}
          suffix="%"
          dark={darkMode}
        />

        {/* Stroke style */}
        <div
          className={`flex gap-1 rounded-lg border p-1 ${
            darkMode ? "border-white/15" : "border-gray-200"
          }`}
        >
          {(["solid", "dashed"] as StrokeStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => onStrokeStyleChange(s)}
              className={`rounded px-2 py-1 text-xs transition ${
                strokeStyle === s
                  ? darkMode
                    ? "bg-white/20"
                    : "bg-gray-200"
                  : hoverBg
              }`}
            >
              {s === "solid" ? "—" : "--"}
            </button>
          ))}
        </div>

        <Divider dark={darkMode} />

        {/* Actions */}
        <IconButton icon={Undo2} title="Undo" onClick={onUndo} disabled={!canUndo} dark={darkMode} />
        <IconButton icon={Redo2} title="Redo" onClick={onRedo} disabled={!canRedo} dark={darkMode} />

        <Divider dark={darkMode} />

        <IconButton icon={Download} title="Export PNG" onClick={onExportPNG} dark={darkMode} />
        <IconButton icon={Trash2} title="Clear board" onClick={handleClear} danger dark={darkMode} />

        <Divider dark={darkMode} />

        {/* Dark mode */}
        <IconButton
          icon={darkMode ? Sun : Moon}
          title="Toggle theme"
          onClick={onToggleDark}
          dark={darkMode}
        />
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Divider({ dark }: { dark: boolean }) {
  return <div className={`h-px w-10 ${dark ? "bg-white/15" : "bg-gray-200"}`} />;
}

function IconButton({
  icon: Icon,
  onClick,
  title,
  disabled,
  danger,
  dark,
  style,
}: {
  icon: any;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
  dark: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`
        rounded-xl p-3 transition-all
        ${
          disabled
            ? "opacity-40 cursor-not-allowed"
            : danger
            ? "text-rose-500 hover:bg-rose-500/15"
            : dark
            ? "hover:bg-white/10"
            : "hover:bg-gray-100"
        }
      `}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function VerticalSlider({
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
    <div className="flex flex-col items-center gap-1">
      <span className={`text-[10px] tabular-nums ${dark ? "text-neutral-400" : "text-gray-500"}`}>
        {label} {value}
        {suffix}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`
          h-1 w-12 appearance-none rounded-full cursor-pointer
          ${dark ? "bg-white/20" : "bg-gray-200"}
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:shadow
          ${dark ? "[&::-webkit-slider-thumb]:bg-white" : "[&::-webkit-slider-thumb]:bg-gray-700"}
        `}
      />
    </div>
  );
}
