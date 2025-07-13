import React, { useState, useEffect } from "react";
import api from "@/services/api";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

interface SalesDetail {
  id: number;
  price_per_quantity: number;
  quantity: number;
  payment_method: string;
  createdAt: string;
  type_id: number;
  bank_id: number | null;
  customer_id: number | null;
  walker_id: string | null;
  transaction_id: string;
  updatedAt: string;
  Product_type: {
    id: number;
    name: string;
  };
  Bank_list: {
    id: number;
    branch: string;
  } | null;
  Customer: {
    id: number;
    full_name: string;
  } | null;
}

interface ShowDetailsProps {
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
}

function ShowDetails({ transactionId, isOpen, onClose }: ShowDetailsProps) {
  const [salesDetails, setSalesDetails] = useState<SalesDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchSalesDetails();
    }
  }, [isOpen, transactionId]);

  const fetchSalesDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(
        `/admin/get-sales-details/${transactionId}`
      );
      setSalesDetails(response.data.sales);
    } catch (err: any) {
      console.error("Error fetching sales details:", err);
      setError("Failed to fetch sales details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPaymentMethodBadge = (method: string) => {
    const color = {
      CASH: "bg-green-500 text-white",
      BANK: "bg-blue-500 text-white",
      CREDIT: "bg-yellow-500 text-white",
    } as const;

    return (
      <Badge className={color[method as keyof typeof color] || "default"}>
        {method}
      </Badge>
    );
  };

  const getCustomerTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "REGULAR" ? "default" : "outline"}>{type}</Badge>
    );
  };

  const calculateTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  const getTotalAmount = () => {
    return salesDetails.reduce((total, detail) => {
      return total + calculateTotal(detail.price_per_quantity, detail.quantity);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4 pt-8"
      onClick={onClose}
    >
      <div
        className="relative mx-auto p-4 md:p-5 border w-full max-w-4xl shadow-2xl rounded-lg bg-card/95 backdrop-blur-md border-border max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-card-foreground">
              Sales Details - {transactionId}
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="text-center text-destructive">
                  <h2 className="text-xl font-semibold mb-2">Error</h2>
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          ) : salesDetails.length > 0 ? (
            <div className="space-y-6">
              {/* Sales Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sales Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Total Amount
                      </div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(getTotalAmount())}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Total Items
                      </div>
                      <div className="text-lg font-semibold">
                        {salesDetails.length}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Transaction ID
                      </div>
                      <div className="text-sm font-mono">{transactionId}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Date</div>
                      <div className="text-sm">
                        {formatDate(salesDetails[0]?.createdAt || "")}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Payment Method
                      </div>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodBadge(
                          salesDetails[0]?.payment_method || ""
                        )}
                        {salesDetails[0]?.Bank_list && (
                          <span className="text-xs text-muted-foreground">
                            ({salesDetails[0].Bank_list.branch})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Customer Type
                      </div>
                      <div>
                        {salesDetails[0]?.Customer ? (
                          <Badge variant="default">REGULAR</Badge>
                        ) : salesDetails[0]?.walker_id ? (
                          <Badge variant="outline">WALKER</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products Table Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Products Sold</CardTitle>
                  <CardDescription>
                    {salesDetails.length} item(s) in this sales transaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price per Unit</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesDetails.map((detail, index) => (
                          <TableRow key={detail.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {detail.Product_type.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{detail.quantity}</Badge>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(detail.price_per_quantity)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(
                                calculateTotal(
                                  detail.price_per_quantity,
                                  detail.quantity
                                )
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  No sales details found for this transaction.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShowDetails;
