import api from "@/services/api";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  BarChart3,
  TrendingUp,
  EyeIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import ShowDetails from "./components/ShowDetails";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SalesData {
  id: number;
  type_id: number;
  bank_id: number | null;
  customer_id: number | null;
  walker_id: string | null;
  transaction_id: string;
  price_per_quantity: number;
  quantity: number;
  payment_method: "CASH" | "BANK" | "CREDIT";
  customer_type: "REGULAR" | "WALKER";
  status: string;
  createdAt: string;
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

function SalesReport() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/get-sales-report");
        setSalesData(response.data.sales);
      } catch (err) {
        setError("Failed to fetch sales report");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesReport();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPaymentMethodBadge = (method: string) => {
    const color = {
      CASH: "bg-green-500 text-white",
      BANK: "bg-blue-500 text-white",
      CREDIT: "bg-yellow-500 text-white",
    } as const;

    return (
      <Badge className={color[method as keyof typeof color]}>{method}</Badge>
    );
  };

  const getCustomerTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "REGULAR" ? "default" : "outline"}>{type}</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "DONE" ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  const calculateTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  const getTotalSales = () => {
    return salesData.reduce((total, sale) => {
      return total + calculateTotal(sale.price_per_quantity, sale.quantity);
    }, 0);
  };

  const getTotalTransactions = () => {
    return salesData.length;
  };

  const handleViewDetails = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedTransaction(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(salesData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = salesData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () =>
    setCurrentPage(Math.min(totalPages, currentPage + 1));

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Sales Report</h1>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
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
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Report</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${getTotalSales().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {getTotalTransactions()} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalTransactions()}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {getTotalTransactions() > 0
                ? (getTotalSales() / getTotalTransactions()).toFixed(2)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Transaction ID</TableHead>

                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Bank</TableHead>

                  <TableHead>Date</TableHead>
                  <TableHead>See Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((sale, index) => (
                  <TableRow key={sale.id}>
                    <TableCell>{startIndex + index + 1}</TableCell>
                    <TableCell>
                      {sale.Customer ? (
                        <div>
                          <div className="font-medium">
                            {sale.Customer.full_name}
                          </div>
                        </div>
                      ) : sale.walker_id ? (
                        <div className="text-muted-foreground">
                          Walker: {sale.walker_id}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {sale.transaction_id}
                    </TableCell>

                    <TableCell className="font-medium">
                      {calculateTotal(
                        sale.price_per_quantity,
                        sale.quantity
                      ).toLocaleString()}{" "}
                      Birr
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getPaymentMethodBadge(sale.payment_method)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sale.Bank_list ? sale.Bank_list.branch : "-"}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(sale.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => handleViewDetails(sale.transaction_id)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {salesData.length > 0 && (
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
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, salesData.length)} of {salesData.length}{" "}
                  results
                </div>
              </div>
              {salesData.length > pageSize && (
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
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className="h-8 w-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show Details Modal */}
      {selectedTransaction && (
        <ShowDetails
          transactionId={selectedTransaction}
          isOpen={showDetailsModal}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

export default SalesReport;
