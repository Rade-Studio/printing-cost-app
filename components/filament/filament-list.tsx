"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiClient } from "@/lib/api";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
} from "lucide-react";

import { useLocale } from "@/app/localContext";
import { Filament } from "@/lib/types";
import { MultiColorPicker } from "./multiply-color-picker";

interface FilamentListProps {
  onEdit: (filament: Filament) => void;
  onAdd: () => void;
  refreshTrigger: number;
}

export function FilamentList({
  onEdit,
  onAdd,
  refreshTrigger,
}: FilamentListProps) {
  const [filaments, setFilaments] = useState<Filament[] | null>([]);
  const [filteredFilaments, setFilteredFilaments] = useState<Filament[] | null>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteFilament, setDeleteFilament] = useState<Filament | null>(null);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const { formatCurrency } = useLocale();

  const fetchFilaments = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getFilaments();
      console.log(data);

      const parsed =
        data?.map((f) => ({
          ...f,
          color: typeof f.color === "string" ? f.color.split(",") : [], // validación
        })) || [];

      setFilaments(parsed);
      setFilteredFilaments(parsed);
      setAvailableColors(Array.from(new Set(parsed.flatMap((f) => f.color))));
    } catch (error) {
      console.error("Error fetching filaments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilaments();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!filaments) {
      setFilteredFilaments([]);
      return;
    }

    const filtered = filaments.filter((filament) => {
      const matchesSearch = (filament.type || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesColor =
        selectedColor.length === 0 ||
        selectedColor.some((c) =>
          (filament.color || []).some((fc) =>
            fc.toLowerCase().includes(c.toLowerCase())
          )
        );

      return matchesSearch && matchesColor;
    });

    setFilteredFilaments(filtered);
  }, [searchTerm, filaments, selectedColor]);

  const handleDelete = async (filament: Filament) => {
    try {
      if (!filament.id) {
        console.error("Filament ID is undefined, cannot delete.");
        return;
      }
      await apiClient.deleteFilament(filament.id!);
      await fetchFilaments();
      setDeleteFilament(null);
    } catch (error) {
      console.error("Error deleting filament:", error);
    }
  };

  const getStockStatus = (stockGrams: number) => {
    if (stockGrams <= 100)
      return {
        label: "Crítico",
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
      };
    if (stockGrams <= 500)
      return {
        label: "Bajo",
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertTriangle,
      };
    return {
      label: "Disponible",
      color: "bg-green-100 text-green-800",
      icon: Package,
    };
  };

  const totalValue = filaments?.reduce(
    (sum, filament) =>
      sum + (filament.costPerGram || 0) * (filament.stockGrams || 0),
    0
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  function removeColorFromSelected(color: string): void {
    setSelectedColor((prev) => prev.filter((c) => c !== color));
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Filamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filaments?.length}</div>
            <p className="text-xs text-muted-foreground">Tipos diferentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total del Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">En stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filaments?.filter((f) => (f.stockGrams || 0) <= 500).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren reposición
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Filamentos</CardTitle>
              <CardDescription>
                Gestiona tu inventario de filamentos para impresión 3D
              </CardDescription>
            </div>
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Filamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-center">
            {/* Buscador */}
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar filamentos por tipo o color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de colores */}
            <div className="flex items-center justify-end gap-2">
              <MultiColorPicker
                value={selectedColor}
                onChange={(colors) => setSelectedColor(colors)}
                availableColors={availableColors}
                limitSelection={5}
              />
            </div>
          </div>

          {filteredFilaments?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron filamentos que coincidan con tu búsqueda."
                  : "No hay filamentos registrados."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Colores</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFilaments?.map((filament) => {
                    const stockStatus = getStockStatus(
                      filament.stockGrams || 0
                    );
                    const totalValue =
                      (filament.costPerGram || 0) * (filament.stockGrams || 0);
                    return (
                      <TableRow key={filament.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{filament.type}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {filament.color.map((c, i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded-full border"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {formatCurrency(filament.costPerGram || 0)}/g
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(
                                (filament.costPerGram || 0) * 1000
                              )}
                              /kg
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {filament.stockGrams || 0}g
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {((filament.stockGrams || 0) / 1000).toFixed(1)}kg
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            <stockStatus.icon className="h-3 w-3 mr-1" />
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {formatCurrency(totalValue)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(filament)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteFilament(filament)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteFilament}
        onOpenChange={() => setDeleteFilament(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              filamento "{deleteFilament?.type} - {deleteFilament?.color}" del
              inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFilament && handleDelete(deleteFilament)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
