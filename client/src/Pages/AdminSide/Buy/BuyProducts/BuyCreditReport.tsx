import api from "@/services/api";
import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, X, RefreshCw } from "lucide-react";

// Type definitions based on your Prisma models
interface BuyCredit {
  id: number;
  transaction_id: string;
  total_money: number;
  description?: string;
  issued_date: string;
  return_date: string;
  status: "ACCEPTED" | "PAYED" | "OVERDUE";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BuyTransaction {
  id: number;
  price_per_quantity: number;
  quantity: number;
  payment_method: string;
  total_money: number;
  supplier_name: string;
  transaction_id: string;
  createdAt: string;
  updatedAt: string;
  type_id: number;
  bank_id?: number;
  return_date?: string;
  Product_type: {
    id: number;
    name: string;
  };
}

const BuyCreditReport: React.FC = () => {
  const [credits, setCredits] = useState<BuyCredit[]>([]);
  const [selectedCredit, setSelectedCredit] = useState<BuyCredit | null>(null);
  const [creditDetails, setCreditDetails] = useState<BuyTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Fetch buy credit report
  const fetchBuyCredits = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/get-all-buy-credits");

      // Axios wraps response in .data property
      const result = response.data;

      console.log("API Response:", result); // Debug log

      if (result.status && result.data && Array.isArray(result.data)) {
        setCredits(result.data);
        setError(null);
      } else if (result.status === false) {
        setError(result.error || "Failed to fetch buy credit report");
        setCredits([]);
      } else {
        setError("Invalid response format");
        setCredits([]);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Buy credit report not found");
      } else if (err.response?.status === 500) {
        setError("Internal server error");
      } else {
        setError("Network error occurred");
      }
      setCredits([]);
      console.error("Error fetching buy credits:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch credit details by transaction_id
  const fetchCreditDetails = async (transactionId: string) => {
    try {
      setDetailLoading(true);
      const response = await api.get(
        `/admin/get-buy-transaction-details/${transactionId}`
      );

      // Axios wraps response in .data property
      const result = response.data;

      if (result.status && result.data && Array.isArray(result.data)) {
        setCreditDetails(result.data);
        setShowDetails(true);
      } else if (result.status === false) {
        setError(result.error || "Failed to fetch credit details");
        setCreditDetails([]);
      } else {
        setError("Invalid response format");
        setCreditDetails([]);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Buy credit detail not found");
      } else if (err.response?.status === 500) {
        setError("Internal server error");
      } else {
        setError("Network error occurred while fetching details");
      }
      setCreditDetails([]);
      console.error("Error fetching credit details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = (credit: BuyCredit) => {
    setSelectedCredit(credit);
    fetchCreditDetails(credit.transaction_id);
  };

  // Handle close details
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedCredit(null);
    setCreditDetails([]);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get badge variant for status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "default";
      case "PAYED":
        return "secondary";
      case "OVERDUE":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Filter active credits with safety check
  const activeCredits = Array.isArray(credits)
    ? credits.filter((credit) => credit.isActive)
    : [];

  // Debug log to see what credits contains
  console.log(
    "Credits state:",
    credits,
    "Type:",
    typeof credits,
    "IsArray:",
    Array.isArray(credits)
  );

  useEffect(() => {
    fetchBuyCredits();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-1">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={fetchBuyCredits}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-1 pt-3 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Buy Credit Report
          </CardTitle>
          <CardDescription>
            Manage and track buy credit transactions
          </CardDescription>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              Total Credits: {activeCredits.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {activeCredits.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                No buy credit records found.
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">#</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead className="max-w-[200px]">Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCredits.map((credit) => (
                    <TableRow key={credit.id}>
                      <TableCell className="font-medium">{credit.id}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(credit.total_money)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(credit.status)}>
                          {credit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(credit.issued_date)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(credit.return_date)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {credit.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(credit)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Details Modal */}
      {showDetails && selectedCredit && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-2xl rounded-lg bg-card/95 backdrop-blur-md border-border">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-card-foreground">
                  Credit Details - {selectedCredit.transaction_id}
                </h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {detailLoading ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
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
              ) : creditDetails.length > 0 ? (
                <div className="space-y-6">
                  {/* Credit Summary Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Credit Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Total Amount
                          </div>
                          <div className="text-lg font-semibold">
                            {formatCurrency(selectedCredit.total_money)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Status
                          </div>
                          <Badge
                            variant={getStatusBadgeVariant(
                              selectedCredit.status
                            )}
                          >
                            {selectedCredit.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Issued Date
                          </div>
                          <div className="text-sm">
                            {formatDate(selectedCredit.issued_date)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Return Date
                          </div>
                          <div className="text-sm">
                            {formatDate(selectedCredit.return_date)}
                          </div>
                        </div>
                      </div>
                      {selectedCredit.description && (
                        <div className="mt-4 space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Description
                          </div>
                          <div className="text-sm p-3 bg-muted rounded-md">
                            {selectedCredit.description}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Transaction Details Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Transaction Details
                      </CardTitle>
                      <CardDescription>
                        {creditDetails.length} item(s) in this credit
                        transaction
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Price per Unit</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Supplier</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {creditDetails.map((detail) => (
                              <TableRow key={detail.id}>
                                <TableCell className="font-medium">
                                  {detail.Product_type.name}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {detail.quantity}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {formatCurrency(detail.price_per_quantity)}
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {formatCurrency(detail.total_money)}
                                </TableCell>
                                <TableCell>{detail.supplier_name}</TableCell>
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
                      No transaction details found.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyCreditReport;
