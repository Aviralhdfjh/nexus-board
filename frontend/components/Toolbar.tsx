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
  HelpCircle,
  X,
} from "lucide-react";
import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import type { Tool, StrokeStyle } from "@/types";

/* ================= HOOKS ================= */

// Custom hook for color history
function useColorHistory() {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("recentColors");
    if (saved) {
      try {
        setColors(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load color history", e);
      }
    }
  }, []);

  const addColor = useCallback((color: string) => {
    setColors((prev) => {
      const filtered = prev.filter((c) => c !== color);
      const updated = [color, ...filtered].slice(0, 6);
      localStorage.setItem("recentColors", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { colors, addColor };
}

// Keyboard shortcut types
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

// Custom hook for keyboard shortcuts
function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      for (const shortcut of shortcuts) {
        // Check if ctrl/meta key requirement is met
        const ctrlMatch = !shortcut.ctrl || (e.ctrlKey || e.metaKey);
        // Check if shift key requirement is met
        const shiftMatch = !shortcut.shift || e.shiftKey;
        // Check if alt key requirement is met
        const altMatch = !shortcut.alt || e.altKey;
        
        if (
          key === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          e.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

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
  fillShapes?: boolean;
  onFillToggle?: () => void;
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

const STROKE_STYLES: StrokeStyle[] = ["solid", "dashed"];

const PRESET_COLORS = [
  "#000000", // Black
  "#FFFFFF", // White
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#10B981", // Green
  "#FBBF24", // Yellow
  "#F97316", // Orange
  "#A855F7", // Purple
  "#EC4899", // Pink
  "#78716C", // Brown
  "#6B7280", // Gray
  "#06B6D4", // Cyan
];

const BRUSH_SIZES = [
  { label: "XS", value: 2 },
  { label: "S", value: 5 },
  { label: "M", value: 10 },
  { label: "L", value: 18 },
  { label: "XL", value: 28 },
];

/* ================= MAIN COMPONENT ================= */

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
  fillShapes = false,
  onFillToggle = () => {},
}: ToolbarProps) {
  const colorRef = useRef<HTMLInputElement>(null);
  const { colors: recentColors, addColor } = useColorHistory();

  // UI State for panels
  const [colorPaletteOpen, setColorPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Keyboard shortcuts setup
  const shortcuts: KeyboardShortcut[] = useMemo(
    () => [
      {
        key: "p",
        callback: () => onToolChange("pencil"),
        description: "Pencil",
      },
      {
        key: "e",
        callback: () => onToolChange("eraser"),
        description: "Eraser",
      },
      {
        key: "r",
        callback: () => onToolChange("rectangle"),
        description: "Rectangle",
      },
      {
        key: "c",
        callback: () => onToolChange("circle"),
        description: "Circle",
      },
      {
        key: "?",
        callback: () => setShortcutsOpen(true),
        description: "Show shortcuts",
      },
      {
        key: "d",
        ctrl: true,
        callback: () => {
          onToggleDark();
        },
        description: "Toggle dark mode",
      },
      {
        key: "z",
        ctrl: true,
        callback: onUndo,
        description: "Undo",
      },
      {
        key: "y",
        ctrl: true,
        callback: onRedo,
        description: "Redo",
      },
    ],
    [onToolChange, onToggleDark, onUndo, onRedo]
  );

  // Enable keyboard shortcuts
  useKeyboardShortcuts(shortcuts);

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      base: darkMode
        ? "bg-neutral-900/90 border-white/10 text-neutral-100"
        : "bg-white/90 border-gray-200 text-gray-800",
      hover: darkMode ? "hover:bg-white/10" : "hover:bg-gray-100",
      active: "bg-blue-500 text-white shadow-md shadow-blue-500/30",
      divider: darkMode ? "bg-white/15" : "bg-gray-200",
      border: darkMode ? "border-white/15" : "border-gray-200",
      label: darkMode ? "text-neutral-400" : "text-gray-500",
      slider: darkMode ? "bg-white/20" : "bg-gray-200",
      sliderThumb: darkMode ? "bg-white" : "bg-gray-700",
    }),
    [darkMode]
  );

  // Memoize handlers
  const handleClear = useCallback(() => {
    if (window.confirm("Clear the board for everyone?")) {
      onClear();
    }
  }, [onClear]);

  const handleOpacityChange = useCallback(
    (v: number) => {
      onOpacityChange(v / 100);
    },
    [onOpacityChange]
  );

  const handleColorPick = useCallback(() => {
    colorRef.current?.click();
  }, []);

  const handleColorSelect = useCallback(
    (selectedColor: string) => {
      onColorChange(selectedColor);
      addColor(selectedColor);
      setColorPaletteOpen(false);
    },
    [onColorChange, addColor]
  );

  const opacityValue = useMemo(() => Math.round(opacity * 100), [opacity]);

  const isShapeTool = useMemo(
    () => ["rectangle", "circle", "line", "arrow"].includes(currentTool),
    [currentTool]
  );

  return (
    <div className="pointer-events-none absolute left-4 top-1/2 z-50 -translate-y-1/2">
      <div
        className={`
          pointer-events-auto flex flex-col items-center gap-2
          rounded-xl border px-2 py-3 shadow-2xl backdrop-blur-xl
          transition-colors ${themeClasses.base}
        `}
      >
        {/* Connection Status */}
        {!isConnected && (
          <div
            title="Disconnected"
            className="rounded-full bg-rose-500/10 p-1"
            role="status"
            aria-live="polite"
          >
            <WifiOff className="h-3 w-3 text-rose-500" />
          </div>
        )}

        {!isConnected && <Divider className={themeClasses.divider} />}

        {/* Tools Grid */}
        <div className="grid grid-cols-2 gap-1" role="toolbar" aria-label="Drawing tools">
          {TOOLS.map(({ id, icon: Icon, label }) => (
            <ToolButton
              key={id}
              isActive={currentTool === id}
              onClick={() => onToolChange(id)}
              title={label}
              icon={Icon}
              hoverClass={themeClasses.hover}
              activeClass={themeClasses.active}
            />
          ))}
        </div>

        <Divider className={themeClasses.divider} />

        {/* Color Picker */}
        <input
          ref={colorRef}
          type="color"
          value={color}
          onChange={(e) => {
            onColorChange(e.target.value);
            addColor(e.target.value);
          }}
          className="hidden"
          aria-label="Color picker"
        />
        <div className="relative">
          <IconButton
            icon={Palette}
            title="Color palette"
            onClick={() => setColorPaletteOpen(!colorPaletteOpen)}
            style={{ color }}
            dark={darkMode}
            aria-label={`Current color: ${color}`}
          />

          {/* Color Palette Panel */}
          {colorPaletteOpen && (
            <ColorPalette
              currentColor={color}
              recentColors={recentColors}
              onColorSelect={handleColorSelect}
              onCustomPick={handleColorPick}
              onClose={() => setColorPaletteOpen(false)}
              darkMode={darkMode}
            />
          )}
        </div>

        <Divider className={themeClasses.divider} />

        {/* Brush Size Presets */}
        <div className="flex flex-col items-center gap-2">
          <span className={`text-[10px] font-medium ${themeClasses.label}`}>Size</span>
          <BrushSizePresets
            currentSize={strokeWidth}
            onSizeSelect={onStrokeWidthChange}
            darkMode={darkMode}
          />
        </div>

        <Divider className={themeClasses.divider} />

        {/* Sliders */}
        <VerticalSlider
          label="W"
          value={strokeWidth}
          min={1}
          max={30}
          onChange={onStrokeWidthChange}
          themeClasses={themeClasses}
          aria-label="Stroke width"
        />
        <VerticalSlider
          label="Op"
          value={opacityValue}
          min={0}
          max={100}
          onChange={handleOpacityChange}
          suffix="%"
          themeClasses={themeClasses}
          aria-label="Opacity"
        />

        {/* Stroke Style Toggle */}
        <div
          className={`flex gap-1 rounded-lg border p-1 ${themeClasses.border}`}
          role="radiogroup"
          aria-label="Stroke style"
        >
          {STROKE_STYLES.map((s) => (
            <StrokeStyleButton
              key={s}
              style={s}
              isActive={strokeStyle === s}
              onClick={() => onStrokeStyleChange(s)}
              hoverClass={themeClasses.hover}
              darkMode={darkMode}
            />
          ))}
        </div>

        {/* Fill Toggle for Shapes */}
        {isShapeTool && (
          <>
            <Divider className={themeClasses.divider} />
            <div
              className={`flex gap-1 rounded-lg border p-1 ${themeClasses.border}`}
              role="group"
              aria-label="Fill style"
            >
              <button
                type="button"
                onClick={onFillToggle}
                title={fillShapes ? "Filled shapes" : "Outlined shapes"}
                className={`rounded px-2 py-1 text-xs transition active:scale-95 ${
                  fillShapes
                    ? darkMode
                      ? "bg-white/20"
                      : "bg-gray-200"
                    : themeClasses.hover
                }`}
              >
                <Square className="h-3 w-3" fill={fillShapes ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={onFillToggle}
                title={fillShapes ? "Switch to outline" : "Switch to fill"}
                className={`rounded px-2 py-1 text-xs transition active:scale-95 ${
                  !fillShapes
                    ? darkMode
                      ? "bg-white/20"
                      : "bg-gray-200"
                    : themeClasses.hover
                }`}
              >
                <Square className="h-3 w-3" />
              </button>
            </div>
          </>
        )}

        <Divider className={themeClasses.divider} />

        {/* History Actions */}
        <IconButton
          icon={Undo2}
          title="Undo (Ctrl+Z)"
          onClick={onUndo}
          disabled={!canUndo}
          dark={darkMode}
          aria-label="Undo"
        />
        <IconButton
          icon={Redo2}
          title="Redo (Ctrl+Y)"
          onClick={onRedo}
          disabled={!canRedo}
          dark={darkMode}
          aria-label="Redo"
        />

        <Divider className={themeClasses.divider} />

        {/* Export & Clear */}
        <IconButton
          icon={Download}
          title="Export PNG"
          onClick={onExportPNG}
          dark={darkMode}
          aria-label="Export as PNG"
        />
        <IconButton
          icon={Trash2}
          title="Clear board"
          onClick={handleClear}
          danger
          dark={darkMode}
          aria-label="Clear board"
        />

        <Divider className={themeClasses.divider} />

        {/* Theme Toggle & Help */}
        <IconButton
          icon={darkMode ? Sun : Moon}
          title={`Switch to ${darkMode ? "light" : "dark"} mode (Ctrl+D)`}
          onClick={onToggleDark}
          dark={darkMode}
          aria-label={`Toggle ${darkMode ? "light" : "dark"} mode`}
        />
        <IconButton
          icon={HelpCircle}
          title="Keyboard shortcuts (or press ?)"
          onClick={() => setShortcutsOpen(true)}
          dark={darkMode}
          aria-label="Show keyboard shortcuts"
        />
      </div>

      {/* Keyboard Shortcuts Modal */}
      {shortcutsOpen && (
        <KeyboardShortcutsModal
          onClose={() => setShortcutsOpen(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

/* ================= SUB-COMPONENTS ================= */

const Divider = ({ className }: { className: string }) => (
  <div className={`h-px w-8 ${className}`} role="separator" />
);

const ToolButton = ({
  isActive,
  onClick,
  title,
  icon: Icon,
  hoverClass,
  activeClass,
}: {
  isActive: boolean;
  onClick: () => void;
  title: string;
  icon: any;
  hoverClass: string;
  activeClass: string;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    aria-pressed={isActive}
    className={`
      rounded-lg p-2 transition-all
      ${isActive ? activeClass : `${hoverClass} active:scale-95`}
    `}
  >
    <Icon className="h-3 w-3" />
  </button>
);

const IconButton = ({
  icon: Icon,
  onClick,
  title,
  disabled = false,
  danger = false,
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
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    style={style}
    aria-disabled={disabled}
    className={`
      rounded-lg p-2 transition-all
      ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : danger
          ? "text-rose-500 hover:bg-rose-500/15 active:scale-95"
          : dark
          ? "hover:bg-white/10 active:scale-95"
          : "hover:bg-gray-100 active:scale-95"
      }
    `}
  >
    <Icon className="h-3 w-3" />
  </button>
);

const StrokeStyleButton = ({
  style,
  isActive,
  onClick,
  hoverClass,
  darkMode,
}: {
  style: StrokeStyle;
  isActive: boolean;
  onClick: () => void;
  hoverClass: string;
  darkMode: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    role="radio"
    aria-checked={isActive}
    aria-label={`${style} stroke`}
    className={`rounded px-2 py-1 text-xs transition active:scale-95 ${
      isActive ? (darkMode ? "bg-white/20" : "bg-gray-200") : hoverClass
    }`}
  >
    {style === "solid" ? "—" : "- -"}
  </button>
);

const VerticalSlider = ({
  label,
  value,
  min,
  max,
  onChange,
  suffix = "",
  themeClasses,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
  themeClasses: {
    label: string;
    slider: string;
    sliderThumb: string;
  };
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <label htmlFor={`slider-${label}`} className={`text-[10px] tabular-nums ${themeClasses.label}`}>
        {label} {value}
        {suffix}
      </label>
      <input
        id={`slider-${label}`}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className={`
          h-1 w-12 appearance-none rounded-full cursor-pointer
          ${themeClasses.slider}
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:shadow
          [&::-webkit-slider-thumb]:${themeClasses.sliderThumb}
          [&::-moz-range-thumb]:h-3
          [&::-moz-range-thumb]:w-3
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow
          [&::-moz-range-thumb]:${themeClasses.sliderThumb}
        `}
      />
    </div>
  );
};

const BrushSizePresets = ({
  currentSize,
  onSizeSelect,
  darkMode,
}: {
  currentSize: number;
  onSizeSelect: (size: number) => void;
  darkMode: boolean;
}) => {
  return (
    <div className="flex gap-1">
      {BRUSH_SIZES.map(({ label, value }) => {
        const isActive = currentSize === value;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSizeSelect(value)}
            title={`${label} (${value}px)`}
            className={`
              flex h-7 w-7 items-center justify-center rounded-lg
              text-[10px] font-medium transition-all active:scale-95
              ${
                isActive
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                  : darkMode
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-gray-100 hover:bg-gray-200"
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

const ColorPalette = ({
  currentColor,
  recentColors,
  onColorSelect,
  onCustomPick,
  onClose,
  darkMode,
}: {
  currentColor: string;
  recentColors: string[];
  onColorSelect: (color: string) => void;
  onCustomPick: () => void;
  onClose: () => void;
  darkMode: boolean;
}) => {
  const paletteRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={paletteRef}
      className={`
        absolute left-full ml-2 top-0 z-50 w-48 rounded-lg border p-3 shadow-2xl backdrop-blur-xl
        ${darkMode ? "bg-neutral-900/95 border-white/10" : "bg-white/95 border-gray-200"}
      `}
    >
      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div className="mb-3">
          <span className={`mb-2 block text-[10px] font-medium ${darkMode ? "text-neutral-400" : "text-gray-500"}`}>
            Recent
          </span>
          <div className="grid grid-cols-6 gap-1">
            {recentColors.map((col) => (
              <ColorSwatch
                key={col}
                color={col}
                isActive={col === currentColor}
                onClick={() => onColorSelect(col)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preset Colors */}
      <div>
        <span className={`mb-2 block text-[10px] font-medium ${darkMode ? "text-neutral-400" : "text-gray-500"}`}>
          Presets
        </span>
        <div className="grid grid-cols-4 gap-1">
          {PRESET_COLORS.map((col) => (
            <ColorSwatch
              key={col}
              color={col}
              isActive={col === currentColor}
              onClick={() => onColorSelect(col)}
            />
          ))}
        </div>
      </div>

      {/* Custom Color */}
      <button
        type="button"
        onClick={onCustomPick}
        className={`
          mt-3 w-full rounded-lg border px-3 py-2 text-xs font-medium
          transition-colors active:scale-95
          ${
            darkMode
              ? "border-white/10 bg-white/5 hover:bg-white/10"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100"
          }
        `}
      >
        Custom Color
      </button>
    </div>
  );
};

const ColorSwatch = ({
  color,
  isActive,
  onClick,
}: {
  color: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      h-7 w-7 rounded-lg transition-all active:scale-95
      ${isActive ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-900" : ""}
    `}
    style={{
      backgroundColor: color,
      border: color === "#FFFFFF" ? "1px solid #e5e7eb" : "none",
    }}
    title={color}
    aria-label={`Select color ${color}`}
  />
);

const KeyboardShortcutsModal = ({
  onClose,
  darkMode,
}: {
  onClose: () => void;
  darkMode: boolean;
}) => {
  // Close on ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const shortcuts = [
    { category: "Tools", items: [
      { keys: ["P"], description: "Pencil" },
      { keys: ["E"], description: "Eraser" },
      { keys: ["R"], description: "Rectangle" },
      { keys: ["C"], description: "Circle" },
    ]},
    { category: "Actions", items: [
      { keys: ["Ctrl", "Z"], description: "Undo" },
      { keys: ["Ctrl", "Y"], description: "Redo" },
      { keys: ["Delete"], description: "Delete selected" },
    ]},
    { category: "Other", items: [
      { keys: ["?"], description: "Toggle shortcuts" },
      { keys: ["Ctrl", "D"], description: "Toggle dark mode" },
      { keys: ["ESC"], description: "Close panels" },
    ]},
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`
          relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl
          ${darkMode ? "bg-neutral-900 border-white/10" : "bg-white border-gray-200"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 transition-colors ${
              darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts */}
        <div className="space-y-6">
          {shortcuts.map(({ category, items }) => (
            <div key={category}>
              <h3 className={`mb-3 text-sm font-semibold ${darkMode ? "text-neutral-400" : "text-gray-500"}`}>
                {category}
              </h3>
              <div className="space-y-2">
                {items.map(({ keys, description }) => (
                  <div key={description} className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? "text-neutral-300" : "text-gray-700"}`}>
                      {description}
                    </span>
                    <div className="flex gap-1">
                      {keys.map((key, i) => (
                        <kbd
                          key={i}
                          className={`
                            rounded px-2 py-1 text-xs font-mono font-medium
                            ${
                              darkMode
                                ? "bg-white/10 text-white border border-white/20"
                                : "bg-gray-100 text-gray-800 border border-gray-300"
                            }
                          `}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`mt-6 pt-4 border-t text-center text-xs ${
          darkMode ? "border-white/10 text-neutral-500" : "border-gray-200 text-gray-500"
        }`}>
          Press <kbd className="px-1 font-mono">?</kbd> or <kbd className="px-1 font-mono">ESC</kbd> to close
        </div>
      </div>
    </div>
  );
};