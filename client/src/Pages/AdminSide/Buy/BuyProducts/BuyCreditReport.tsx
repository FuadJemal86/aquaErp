import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/services/api";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  RefreshCw,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Type definitions based on your Prisma models
interface BuyCredit {
  id: number;
  transaction_id: string;
  total_money: number;
  description?: string;
  issued_date: string;
  return_date: string;
  status: "ACCEPTED" | "PAYED" | "OVERDUE";
  supplier_name: string | null;
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
  manager_name: string;
  casher_name: string;
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

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface FilterForm {
  transactionId: string;
  status: string;
  startDate: string;
  endDate: string;
  supplierName: string;
}

const BuyCreditReport: React.FC = () => {
  const [credits, setCredits] = useState<BuyCredit[]>([]);
  const [selectedCredit, setSelectedCredit] = useState<BuyCredit | null>(null);
  const [creditDetails, setCreditDetails] = useState<BuyTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFilterEnabled, setIsFilterEnabled] = useState(false);
  const [filters, setFilters] = useState<FilterForm>({
    transactionId: "",
    status: "",
    startDate: "",
    endDate: "",
    supplierName: "",
  });
  const [paginationData, setPaginationData] = useState<PaginationData>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Debounce state
  const [debouncedFilters, setDebouncedFilters] = useState<FilterForm>(filters);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Update debounced filters after typing stops
  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1); // Reset to first page when filters change
    }, 500);

    setTypingTimeout(timeout);

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [filters]);

  // Fetch buy credit report with pagination and filtering
  const fetchBuyCredits = async () => {
    try {
      // setLoading(true);
      setError(null);

      // Build query parameters
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };

      // Add filter parameters only if they have values
      if (debouncedFilters.transactionId)
        params.transactionId = debouncedFilters.transactionId;
      if (debouncedFilters.status) params.status = debouncedFilters.status;
      if (debouncedFilters.startDate)
        params.startDate = debouncedFilters.startDate;
      if (debouncedFilters.endDate) params.endDate = debouncedFilters.endDate;
      if (debouncedFilters.supplierName)
        params.supplierName = debouncedFilters.supplierName;

      const response = await api.get("/admin/get-all-buy-credits", { params });

      // Axios wraps response in .data property
      const result = response.data;

      console.log("API Response:", result); // Debug log

      if (result.status && result.data) {
        // Handle paginated response
        if (result.data.credits && Array.isArray(result.data.credits)) {
          setCredits(result.data.credits);
          setPaginationData(result.data.pagination);
        }
        // Handle non-paginated response (fallback)
        else if (Array.isArray(result.data)) {
          setCredits(result.data);
          setPaginationData({
            currentPage: 1,
            pageSize: result.data.length,
            totalCount: result.data.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          });
        }
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
        console.log("Buy credit report not found");
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
        console.log("Buy credit detail not found");
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

  // Handle click outside modal
  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseDetails();
    }
  };

  // Filter handling
  const handleFilterChange = (field: keyof FilterForm, value: string) => {
    const actualValue = field === "status" && value === "ALL" ? "" : value;
    setFilters((prev) => ({ ...prev, [field]: actualValue }));
  };

  const clearFilters = () => {
    setFilters({
      transactionId: "",
      status: "",
      startDate: "",
      endDate: "",
      supplierName: "",
    });
    setCurrentPage(1);
  };

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationData.totalPages)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(paginationData.totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () =>
    setCurrentPage(Math.min(paginationData.totalPages, currentPage + 1));

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
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

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  // Keep filter open when there are active filters
  useEffect(() => {
    if (hasActiveFilters && !isFilterEnabled) {
      setIsFilterEnabled(true);
    }
  }, [hasActiveFilters, isFilterEnabled]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchBuyCredits();
  }, [currentPage, pageSize, debouncedFilters]);

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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Buy Credit Report
            </CardTitle>
            <CardDescription>
              Manage and track buy credit transactions
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="gap-1">
                Total Credits: {paginationData.totalCount}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="hidden md:inline text-sm font-medium">Filter</span>
            <button
              onClick={() => setIsFilterEnabled(!isFilterEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${isFilterEnabled ? "bg-primary" : "bg-input"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${isFilterEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Filter Form */}
        {isFilterEnabled && (
          <div className="px-6 pb-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Supplier Name */}
              <div className="space-y-2">
                <Label htmlFor="supplierName" className="text-sm font-medium">
                  Supplier Name
                </Label>
                <Input
                  id="supplierName"
                  placeholder="Enter supplier name"
                  value={filters.supplierName}
                  onChange={(e) =>
                    handleFilterChange("supplierName", e.target.value)
                  }
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-2">
                <Label htmlFor="transactionId" className="text-sm font-medium">
                  Transaction ID
                </Label>
                <Input
                  id="transactionId"
                  placeholder="Enter transaction ID"
                  value={filters.transactionId}
                  onChange={(e) =>
                    handleFilterChange("transactionId", e.target.value)
                  }
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PAYED">PAYED</SelectItem>
                    <SelectItem value="OVERDUE">OVERDUE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

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
                    <TableHead>Supplier</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead className="max-w-[200px]">Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCredits.map((credit, index) => (
                    <TableRow key={credit.id}>
                      <TableCell className="font-medium">
                        {(paginationData.currentPage - 1) *
                          paginationData.pageSize +
                          index +
                          1}
                      </TableCell>
                      <TableCell>{credit.supplier_name}</TableCell>
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

          {/* Pagination */}
          {activeCredits.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-2 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">entries</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  {(paginationData.currentPage - 1) * paginationData.pageSize +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    paginationData.currentPage * paginationData.pageSize,
                    paginationData.totalCount
                  )}{" "}
                  of {paginationData.totalCount} results
                </div>
              </div>
              {paginationData.totalPages > 1 && (
                <div className="flex items-center justify-center sm:justify-end space-x-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(5, paginationData.totalPages) },
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="h-8 w-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === paginationData.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage === paginationData.totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Details Modal */}
      {showDetails && selectedCredit && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
          onClick={handleModalClick}
        >
          <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-2xl rounded-lg bg-card/95 backdrop-blur-md border-border">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-card-foreground">
                  Buy Credit Details - {selectedCredit.transaction_id}
                </h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[80vh] overflow-y-auto">
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
                        <CardTitle className="text-lg">
                          Credit Summary
                        </CardTitle>
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
                              Transaction ID
                            </div>
                            <div className="text-sm font-mono">
                              {selectedCredit.transaction_id}
                            </div>
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
                          Buy Transaction Details
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
                                <TableHead>Responsible Person</TableHead>
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
                                    {detail?.manager_name ? detail?.manager_name : detail?.casher_name}
                                  </TableCell>
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
                                  <TableCell>
                                    <Badge variant="secondary">
                                      {detail.supplier_name}
                                    </Badge>
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
                        No transaction details found.
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyCreditReport;
