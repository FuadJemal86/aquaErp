import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";
import { BarChart3, DollarSign, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import SalesReportSkeleton from "./components/SalesReportSkeleton";
import SalesReportTable from "./components/SalesReportTable";
import ShowDetails from "./components/ShowDetails";
import { toast } from "sonner";

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

interface FilterForm {
  customerName: string;
  transactionId: string;
  paymentMethod: string;
  bankBranch: string;
  customerType: string;
  startDate: string;
  endDate: string;
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
  const [filters, setFilters] = useState<FilterForm>({
    customerName: "",
    transactionId: "",
    paymentMethod: "",
    bankBranch: "",
    customerType: "",
    startDate: "",
    endDate: "",
  });
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params: any = {
          page: currentPage,
          limit: pageSize,
        };

        // Add filter parameters only if they have values
        if (filters.customerName) params.customerName = filters.customerName;
        if (filters.transactionId) params.transactionId = filters.transactionId;
        if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
        if (filters.bankBranch) params.bankBranch = filters.bankBranch;
        if (filters.customerType) params.customerType = filters.customerType;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        const response = await api.get("/admin/get-sales-report", {
          params,
        });
        setSalesData(response.data.sales);
        setPaginationData(response.data.pagination);
      } catch (err) {
        setError("Failed to fetch sales report");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesReport();
  }, [currentPage, pageSize, filters]);

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

  // Filter functions
  const handleFilterChange = (newFilters: Partial<FilterForm>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      customerName: "",
      transactionId: "",
      paymentMethod: "",
      bankBranch: "",
      customerType: "",
      startDate: "",
      endDate: "",
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

  if (loading) {
    return <SalesReportSkeleton />;
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
      <SalesReportTable
        salesData={salesData}
        paginationData={paginationData}
        currentPage={currentPage}
        pageSize={pageSize}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onViewDetails={handleViewDetails}
        onPageChange={goToPage}
        onPageSizeChange={handlePageSizeChange}
        onFirstPage={goToFirstPage}
        onLastPage={goToLastPage}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
      />

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
