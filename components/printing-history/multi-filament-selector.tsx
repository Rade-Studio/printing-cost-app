"use client"

import * as React from "react"
import * as Popover from "@radix-ui/react-popover"
import * as Checkbox from "@radix-ui/react-checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filament, FilamentConsumption } from "@/lib/types"

interface Props {
    filaments: Filament[]
    value: FilamentConsumption[]                   // estado viene del padre
    onChange: (next: FilamentConsumption[]) => void // el hijo avisa cambios
    getDescription?: (f: Filament) => string       // opcional
    label?: string
}

export default function MultiFilamentSelector({
    filaments,
    value,
    onChange,
    getDescription,
    label = "Filamentos",
}: Props) {
    const isSelected = (id: string) => value.some(v => v.filamentId === id)
    const getGrams = (id: string) => value.find(v => v.filamentId === id)?.gramsUsed ?? 0

    const toggle = (id: string, checked: boolean) => {
        if (checked) {
            if (!isSelected(id)) onChange([...value, { filamentId: id, gramsUsed: 0 }])
        } else {
            onChange(value.filter(v => v.filamentId !== id))
        }
    }

    const updateGrams = (id: string, gramsStr: string) => {
        const grams = gramsStr === "" ? 0 : Number(gramsStr)
        onChange(
            value.map(v => (v.filamentId === id ? { ...v, gramsUsed: isNaN(grams) ? 0 : grams } : v))
        )
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>

            <Popover.Root>
                <Popover.Trigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        {value.length > 0
                            ? `${value.length} filamento(s) seleccionado(s)`
                            : "Selecciona filamentos"}
                    </Button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content className="bg-white border rounded-md p-3 shadow-md w-96">
                        <div className="space-y-2 max-h-72 overflow-auto pr-1">
                            {filaments.map((f) => {
                                const checked = isSelected(f.id!)
                                const grams = getGrams(f.id!)
                                return (
                                    <div key={f.id} className="flex items-center gap-2">
                                        <Checkbox.Root
                                            checked={checked}
                                            onCheckedChange={(c) => toggle(f.id!, Boolean(c))}
                                            className="flex h-5 w-5 items-center justify-center border rounded"
                                        >
                                            <Checkbox.Indicator>✓</Checkbox.Indicator>
                                        </Checkbox.Root>

                                        <span className="flex-1">
                                            {getDescription ? getDescription(f) : `${f.type ?? ""} ${f.color ?? ""}`.trim()}
                                        </span>

                                        {checked && (
                                            <Input
                                                type="number"
                                                inputMode="decimal"
                                                min={0}
                                                step="0.01"
                                                className="w-24"
                                                value={Number.isFinite(grams) ? grams : 0}
                                                onChange={(e) => updateGrams(f.id!, e.target.value)}
                                                placeholder="g"
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    )
}
