"use client";

import React, { useRef, useMemo, useState, memo } from "react";
import {
  Pencil, Eraser, Square, Circle, Minus, ArrowRight,
  Palette, Trash2, WifiOff, Undo2, Redo2, Moon, Sun,
  HelpCircle, X, Grid3X3, Map, Clipboard
} from "lucide-react";
import type { Tool, StrokeStyle } from "@/types";

/* ================= MEMOIZED COMPONENTS ================= */

const ToolGroup = ({ children, label }: { children: React.ReactNode; label?: string }) => (
  <div className="flex flex-col items-center gap-1 w-full">
    {label && <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter select-none">{label}</span>}
    <div className="grid grid-cols-2 gap-1">{children}</div>
  </div>
);

const ActionButton = memo(({ icon: Icon, onClick, isActive, title, danger, darkMode, disabled }: any) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    aria-pressed={!!isActive}
    onClick={onClick}
    disabled={disabled}
    className={`relative rounded-xl p-2.5 transition-all duration-200 active:scale-90 disabled:opacity-20 ${
      isActive 
        ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/40" 
        : danger 
          ? "text-rose-500 hover:bg-rose-500/10" 
          : darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-600 hover:text-black"
    }`}
  >
    <Icon className="h-4 w-4" />
    {/* CSS-based Active Indicator */}
    {isActive && (
      <div className="absolute inset-0 rounded-xl bg-indigo-400/20 blur-md -z-10 animate-pulse" />
    )}
  </button>
));

/* ================= MAIN COMPONENT ================= */

export default function OptimizedToolbar({
  currentTool, color, onToolChange, onColorChange,
  onClear, onUndo, onRedo, onExportPNG, onCopyToClipboard,
  canUndo, canRedo, isConnected,
  darkMode, onToggleDark, onGridModeChange, onToggleMinimap
}: {
  currentTool: Tool;
  color: string;
  onToolChange: (t: Tool) => void;
  onColorChange: (c: string) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExportPNG?: () => void;
  onCopyToClipboard?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isConnected: boolean;
  darkMode: boolean;
  onToggleDark: () => void;
  onGridModeChange?: () => void;
  onToggleMinimap?: () => void;
}) {
  
  const [panels, setPanels] = useState({ color: false, shortcuts: false });

  const toolCategories = useMemo(() => ({
    draw: [
      { id: "pencil", icon: Pencil, label: "Draw" },
      { id: "eraser", icon: Eraser, label: "Erase" },
    ],
    shapes: [
      { id: "rectangle", icon: Square, label: "Box" },
      { id: "circle", icon: Circle, label: "Circle" },
      { id: "line", icon: Minus, label: "Line" },
      { id: "arrow", icon: ArrowRight, label: "Arrow" },
    ]
  }), []);

  const themeBase = darkMode 
    ? "bg-slate-900/80 border-white/10 text-white shadow-2xl" 
    : "bg-white/80 border-slate-200 text-slate-900 shadow-xl";

  return (
    <div className="pointer-events-none fixed left-6 top-1/2 z-50 -translate-y-1/2 flex flex-col items-center gap-4">
      
      {/* Connection Badge */}
      <div
        className={`pointer-events-auto flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-xl ${themeBase}`}
        aria-label={isConnected ? "Connection status: live" : "Connection status: offline"}
      >
        <div className={`h-2 w-2 rounded-full transition-colors duration-500 ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
          {isConnected ? "Live" : "Offline"}
        </span>
      </div>

      {/* Main Toolbar Body */}
      <div className={`pointer-events-auto flex flex-col items-center gap-4 rounded-3xl border p-2.5 backdrop-blur-2xl ${themeBase}`}>
        
        <ToolGroup label="Base">
          {toolCategories.draw.map(t => (
            <ActionButton key={t.id} {...t} isActive={currentTool === t.id} onClick={() => onToolChange(t.id)} darkMode={darkMode} />
          ))}
        </ToolGroup>

        <hr className="w-8 opacity-10" />

        <ToolGroup label="Shapes">
          {toolCategories.shapes.map(t => (
            <ActionButton key={t.id} {...t} isActive={currentTool === t.id} onClick={() => onToolChange(t.id)} darkMode={darkMode} />
          ))}
        </ToolGroup>

        <hr className="w-8 opacity-10" />

        {/* Color Toggle */}
        <div className="relative">
          <button 
            onClick={() => setPanels(p => ({ ...p, color: !p.color }))}
            className={`h-10 w-10 rounded-2xl border-4 border-white/10 shadow-lg transition-all hover:scale-110 active:scale-95 ${panels.color ? "ring-2 ring-indigo-500" : ""}`}
            style={{ backgroundColor: color }}
          />
          {/* CSS-only transition via conditional rendering and opacity classes */}
          <div className={`absolute left-full top-0 ml-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-3xl transition-all duration-200 transform ${panels.color ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-2 scale-95 pointer-events-none"} ${themeBase}`}>
            <input 
              type="color" value={color} 
              onChange={(e) => onColorChange(e.target.value)}
              className="h-12 w-24 cursor-pointer rounded-lg bg-transparent border-0"
            />
          </div>
        </div>

        <hr className="w-8 opacity-10" />

        <ToolGroup label="Edit">
          <ActionButton icon={Undo2} title="Undo" onClick={onUndo} disabled={!canUndo} darkMode={darkMode} />
          <ActionButton icon={Redo2} title="Redo" onClick={onRedo} disabled={!canRedo} darkMode={darkMode} />
          <ActionButton icon={Trash2} title="Clear" onClick={onClear} danger darkMode={darkMode} />
          <ActionButton icon={HelpCircle} title="Help" onClick={() => setPanels(p => ({ ...p, shortcuts: true }))} darkMode={darkMode} />
        </ToolGroup>

        <hr className="w-8 opacity-10" />

        <ToolGroup>
          <ActionButton icon={darkMode ? Sun : Moon} title="Toggle dark mode" onClick={onToggleDark} darkMode={darkMode} />
          <ActionButton icon={Grid3X3} title="Toggle grid" onClick={onGridModeChange} darkMode={darkMode} />
        </ToolGroup>

        <ToolGroup label="Export">
          <ActionButton
            icon={Clipboard}
            title="Copy to clipboard"
            onClick={onCopyToClipboard}
            darkMode={darkMode}
          />
          <ActionButton
            icon={Minus}
            title="Export PNG"
            onClick={onExportPNG}
            darkMode={darkMode}
          />
        </ToolGroup>
      </div>

      {/* Shortcut Modal with CSS Transitions */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${panels.shortcuts ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setPanels(p => ({ ...p, shortcuts: false }))}
      >
        <div 
          className={`w-80 rounded-2xl border p-6 shadow-2xl transition-transform duration-300 transform ${panels.shortcuts ? "scale-100 translate-y-0" : "scale-95 translate-y-4"} ${darkMode ? "bg-neutral-900 border-white/10 text-white" : "bg-white text-gray-800"}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between mb-4 font-bold text-lg">
            <span>Shortcuts</span>
            <X className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setPanels(p => ({ ...p, shortcuts: false }))} />
          </div>
          <div className="space-y-2 text-sm opacity-80">
            <div className="flex justify-between"><span>Pencil</span> <kbd className="bg-slate-500/10 px-1.5 rounded">P</kbd></div>
            <div className="flex justify-between"><span>Undo</span> <kbd className="bg-slate-500/10 px-1.5 rounded">Ctrl + Z</kbd></div>
          </div>
        </div>
      </div>
    </div>
  );
}