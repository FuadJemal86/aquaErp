import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EyeIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";

interface BankAccount {
  id: number;
  branch: string;
  account_number: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}
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

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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

interface SalesReportTableProps {
  salesData: SalesData[];
  paginationData: PaginationData;
  currentPage: number;
  pageSize: number;
  filters: FilterForm;
  onFilterChange: (filters: Partial<FilterForm>) => void;
  onClearFilters: () => void;
  onViewDetails: (transactionId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: string) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

function SalesReportTable({
  salesData,
  paginationData,
  currentPage,
  pageSize,
  filters,
  onFilterChange,
  onClearFilters,
  onViewDetails,
  onPageChange,
  onPageSizeChange,
  onFirstPage,
  onLastPage,
  onPreviousPage,
  onNextPage,
}: SalesReportTableProps) {
  const [isFilterEnabled, setIsFilterEnabled] = React.useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

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

  const calculateTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await api.get("/admin/get-bank-list");
      setBankAccounts(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch bank accounts:", error);
      toast.error(
        error.response?.data?.error || "Failed to fetch bank accounts"
      );
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleFilterChange = (field: keyof FilterForm, value: string) => {
    onFilterChange({ [field]: value });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sales Transactions</CardTitle>
        <div className="flex items-center space-x-2">
          {/* Show "Filter" text only on large devices */}
          <span className="hidden md:inline text-sm font-medium">Filter</span>
          {/* Toggle button for all devices */}
          <button
            onClick={() => setIsFilterEnabled(!isFilterEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              isFilterEnabled ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                isFilterEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          {/* Clear filters button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium">
                Customer Name
              </Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={filters.customerName}
                onChange={(e) =>
                  handleFilterChange("customerName", e.target.value)
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

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-medium">
                Payment Method
              </Label>
              <Select
                value={filters.paymentMethod}
                onValueChange={(value) =>
                  handleFilterChange("paymentMethod", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">CASH</SelectItem>
                  <SelectItem value="BANK">BANK</SelectItem>
                  <SelectItem value="CREDIT">CREDIT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bank Branch */}
            <div className="space-y-2">
              <Label htmlFor="bankBranch" className="text-sm font-medium">
                Bank Branch
              </Label>
              <Select
                value={filters.bankBranch}
                onValueChange={(value) =>
                  handleFilterChange("bankBranch", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank branch" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((bank) => (
                    <SelectItem key={bank.id} value={bank.branch}>
                      {bank.branch}
                    </SelectItem>
                  ))}
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
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>

            {/* Customer Type */}
            <div className="space-y-2">
              <Label htmlFor="customerType" className="text-sm font-medium">
                Customer Type
              </Label>
              <Select
                value={filters.customerType}
                onValueChange={(value) =>
                  handleFilterChange("customerType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGULAR">REGULAR</SelectItem>
                  <SelectItem value="WALKER">WALKER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

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
              {salesData.map((sale, index) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {(paginationData.currentPage - 1) *
                      paginationData.pageSize +
                      index +
                      1}
                  </TableCell>
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
                        onClick={() => onViewDetails(sale.transaction_id)}
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
                  onValueChange={onPageSizeChange}
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
                {(paginationData.currentPage - 1) * paginationData.pageSize + 1}{" "}
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
                  onClick={onFirstPage}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreviousPage}
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
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => onPageChange(page)}
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
                  onClick={onNextPage}
                  disabled={currentPage === paginationData.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLastPage}
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
  );
}

export default SalesReportTable;
