import api from "@/services/api";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  FileText,
  Eye,
} from "lucide-react";

// Type definitions based on your Prisma models
interface SalesCredit {
  id: number;
  customer_id: number;
  transaction_id: string;
  total_money: number;
  return_date: string;
  issued_date: string;
  description?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  customer_name: string;
}

function RepaySalesCredit() {
  const [credits, setCredits] = useState<SalesCredit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sales credit report
  const fetchSalesCredits = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/get-all-sales-credits");

      // Axios wraps response in .data property
      const result = response.data;

      console.log("API Response:", result); // Debug log

      if (result.status && result.data && Array.isArray(result.data)) {
        setCredits(result.data);
        setError(null);
      } else if (result.status === false) {
        setError(result.error || "Failed to fetch sales credit report");
        setCredits([]);
      } else {
        setError("Invalid response format");
        setCredits([]);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Sales credit report not found");
      } else if (err.response?.status === 500) {
        setError("Internal server error");
      } else {
        setError("Network error occurred");
      }
      setCredits([]);
      console.error("Error fetching sales credits:", err);
    } finally {
      setLoading(false);
    }
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
      currency: "ETB",
    }).format(amount);
  };

  // Get badge variant for status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "blue";
      case "PAYED":
        return "green";
      case "OVERDUE":
        return "red";
      default:
        return "outline";
    }
  };

  // Check if return date has passed
  const isOverdue = (returnDate: string) => {
    return new Date(returnDate) < new Date();
  };

  // Filter active credits with safety check
  const activeCredits = Array.isArray(credits)
    ? credits.filter((credit) => credit.isActive)
    : [];

  useEffect(() => {
    fetchSalesCredits();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={fetchSalesCredits}
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Repay Sales Credit</h1>
          </div>
          <p className="text-muted-foreground">
            Manage and process sales credit repayments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1 h-8">
            <CreditCard className="h-3 w-3" />
            Total Credits: {activeCredits.length}
          </Badge>
          <Button
            onClick={fetchSalesCredits}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Credits Grid */}
      {activeCredits.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No sales credits found
              </h3>
              <p className="text-muted-foreground mb-4">
                There are no sales credits available for repayment
              </p>
              <Button onClick={fetchSalesCredits} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCredits.map((credit) => (
            <Card
              key={credit.id}
              className={`transition-all duration-200 hover:shadow-lg ${
                isOverdue(credit.return_date)
                  ? "border-destructive/50 bg-destructive/5"
                  : ""
              }`}
            >
              <CardHeader className="">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold flex items-center ">
                      <User className="h-4 w-4 mr-2" />
                      {credit.customer_name}
                    </CardTitle>
                  </div>
                  <Badge
                    className={`bg-red-500 text-white ${
                      credit.status === "ACCEPTED"
                        ? "bg-blue-500"
                        : credit.status === "PAYED"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {credit.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(credit.total_money)}
                  </div>
                </div>

                {/* Transaction ID */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Transaction ID
                  </div>
                  <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {credit.transaction_id}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Issued Date
                    </div>
                    <div className="text-sm">
                      {formatDate(credit.issued_date)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Return Date
                    </div>
                    <div
                      className={`text-sm ${
                        isOverdue(credit.return_date)
                          ? "text-destructive font-medium"
                          : ""
                      }`}
                    >
                      {formatDate(credit.return_date)}
                      {isOverdue(credit.return_date) && (
                        <span className="ml-2 text-xs">⚠️ OVERDUE</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {credit.description && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      Description
                    </div>
                    <div className="text-sm bg-muted p-2 rounded text-muted-foreground truncate">
                      {credit.description}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={() => {
                    // TODO: Implement show details functionality
                    console.log("Show details for credit:", credit.id);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Show Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default RepaySalesCredit;
