"use client";

import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { on } from "events";

const PRESET_COLORS = [
  "#D91E1E",
  "#0C2340",
  "#22c55e",
  "#f59e0b",
  "#6366f1",
  "#000000",
  "#ffffff",
  "#ff5733",
  "#33ff57",
  "#3357ff",
  "#ff3357",
  "#fd00f17c",
];

interface MultiColorPickerProps {
  value?: string[];
  onChange?: (colors: string[]) => void;
  availableColors?: string[];
  limitSelection?: number;
}

export function MultiColorPicker({
  value = [],
  onChange,
  availableColors,
  limitSelection,
}: MultiColorPickerProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>(value);
  const [tempColor, setTempColor] = useState<string>("#000000");
  const [availableColorsToShow, setAvailableColorsToShow] = useState<string[]>(
    availableColors || PRESET_COLORS
  );
  const [limitValue, setLimitSelectionToShow] = useState<number>(
    limitSelection || 2
  );

  const updateColors = (newColors: string[]) => {
    setSelectedColors(newColors);
    onChange?.(newColors);
  };

  const handleTogglePreset = (color: string) => {
    if (selectedColors.includes(color)) {
      updateColors(selectedColors.filter((c) => c !== color)); // quitar
    } else if (selectedColors.length < limitValue) {
      updateColors([...selectedColors, color]); // agregar
    }
  };

  const handleAddCustomColor = () => {
    if (!selectedColors.includes(tempColor) && selectedColors.length < limitValue) {
      updateColors([...selectedColors, tempColor]);
    }
  };

  const handleClear = () => updateColors([]);

  return (
    <div className="space-y-4">
      {/* Preview de colores + botón limpiar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          {selectedColors.length > 0 ? (
            selectedColors.map((c, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border"
                style={{ backgroundColor: c }}
              />
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              Ningún color seleccionado
            </span>
          )}
        </div>

        {selectedColors.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80 hover:underline"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Popover */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="px-3 py-1 border border-border rounded-md shadow-sm text-sm bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Seleccionar colores
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="bg-popover text-popover-foreground border border-border p-3 rounded-xl shadow-xs w-56"
            sideOffset={5}
            collisionPadding={8}
          >
            {/* Presets (toggle) */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {availableColorsToShow.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-full border border-border hover:scale-110 transition ${
                    selectedColors.includes(c) ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => handleTogglePreset(c)}
                />
              ))}
            </div>

            {/* Custom color + agregar */}
            {!availableColors ? (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={tempColor}
                  onChange={(e) => setTempColor(e.target.value)}
                  className="w-12 h-10 border border-border rounded cursor-pointer bg-background"
                />
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  disabled={selectedColors.length >= 3}
                  className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded disabled:opacity-50 hover:bg-primary/90"
                >
                  Agregar
                </button>
              </div>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
