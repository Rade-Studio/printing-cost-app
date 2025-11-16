"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Package,
  Clock,
  Weight,
  Calculator,
  Cuboid,
} from "lucide-react";
import { SaleDetail } from "@/lib/types";
import { useLocale } from "@/app/localContext";

interface SaleDetailsProps {
  saleId: string;
  onBack: () => void;
  onAddDetail: () => void;
  onEditDetail: (detail: SaleDetail) => void;
  refreshTrigger: number;
}

export function SaleDetails({
  saleId,
  onBack,
  onAddDetail,
  onEditDetail,
  refreshTrigger,
}: SaleDetailsProps) {
  const [details, setDetails] = useState<SaleDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDetail, setDeleteDetail] = useState<SaleDetail | null>(null);
  const { formatCurrency } = useLocale();

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const detailsData = await apiClient.getSaleDetails(saleId);
      setDetails(detailsData || []);

    } catch (error) {
      console.error("Error fetching sale details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [saleId, refreshTrigger]);

  const handleDelete = async (detail: SaleDetail) => {
    if (!detail.id) {
      console.error("Detail ID is undefined, cannot delete.");
      return;
    }

    try {
      await apiClient.deleteSaleDetail(saleId, detail.id);
      await fetchDetails();
      setDeleteDetail(null);
    } catch (error) {
      console.error("Error deleting sale detail:", error);
    }
  };

  const totalCost = details?.reduce((sum, detail) => sum + detail.subTotal, 0)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle>Detalles de Venta</CardTitle>
              </div>
              <CardDescription>ID de Venta: {saleId}</CardDescription>
            </div>
            <Button onClick={onAddDetail} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {details?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay productos en esta venta.
              </p>
              <Button onClick={onAddDetail} className="mt-4">
                Agregar Primer Producto
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Especificaciones</TableHead>
                      <TableHead>Costo Mano de Obra</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details?.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {detail.product?.name}
                            </p>
                            {detail.comments && (
                              <p className="text-sm text-muted-foreground">
                                {detail.comments}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">
                                Cantidad: {detail.quantity}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(detail.subTotal)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(detail.laborCost)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {detail.product?.workPackage?.name || "No definido"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(detail.product?.modelUrl, "_blank")
                              }
                            >
                              <Cuboid className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEditDetail(detail)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteDetail(detail)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Resumen de costos */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Estimado:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Basado en {details?.length} producto
                  {details?.length !== 1 ? "s" : ""}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteDetail}
        onOpenChange={() => setDeleteDetail(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente
              este producto de la venta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDetail && handleDelete(deleteDetail)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
