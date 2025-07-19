import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    EyeIcon,
    X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingTableSkeleton } from "./BuyReportSkeleton";

interface BankAccount {
    id: number;
    branch: string;
    account_number: string;
    owner: string;
    createdAt: string;
    updatedAt: string;
}

interface BuyData {
    id: number;
    type_id: number;
    bank_id: number | null;
    transaction_id: string;
    price_per_quantity: number;
    quantity: number;
    payment_method: "CASH" | "BANK" | "CREDIT";
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
    supplier_name: string

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
    supplier_name: string;
    transactionId: string;
    paymentMethod: string;
    bankBranch: string;
    startDate: string;
    endDate: string;
}

interface BuyReportTableProps {
    onViewDetails: (transactionId: string) => void;
    onDataChange?: (data: BuyData[]) => void;
}

function BuyReportTable({
    onViewDetails,
    onDataChange,
}: BuyReportTableProps) {
    const [buyData, setBuyData] = useState<BuyData[]>([]);
    const [summaryData, setSummaryData] = useState<BuyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isFilterEnabled, setIsFilterEnabled] = React.useState(false);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [filters, setFilters] = useState<FilterForm>({
        supplier_name: "",
        transactionId: "",
        paymentMethod: "",
        bankBranch: "",
        startDate: "",
        endDate: "",
    });
    const [paginationData, setPaginationData] = useState<PaginationData>({
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

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

    const fetchBuyReport = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters for paginated data
            const params: any = {
                page: currentPage,
                limit: pageSize,
            };

            // Add filter parameters only if they have values
            if (filters.supplier_name) params.supplier_name = filters.supplier_name;
            if (filters.transactionId) params.transactionId = filters.transactionId;
            if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
            if (filters.bankBranch) params.bankBranch = filters.bankBranch;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            // Fetch paginated data for table
            const response = await api.get("/admin/get-buy-report", {
                params,
            });
            setBuyData(response.data.buy);
            setPaginationData(response.data.pagination);

            // Fetch all data for summary (with same filters but no pagination)
            const summaryParams = { ...params };
            delete summaryParams.page;
            delete summaryParams.limit;
            summaryParams.limit = 10000; // Get all records for summary

            const summaryResponse = await api.get("/admin/get-buy-report", {
                params: summaryParams,
            });
            setSummaryData(summaryResponse.data.buy);
        } catch (err: any) {
            setError("Failed to fetch buy report");
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to fetch buy report");
        } finally {
            setLoading(false);
        }
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
        fetchBuyReport();
    }, [currentPage, pageSize, filters]);

    // Notify parent component when data changes
    useEffect(() => {
        if (onDataChange) {
            onDataChange(summaryData);
        }
    }, [summaryData, onDataChange]);

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const handleFilterChange = (field: keyof FilterForm, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const clearFilters = () => {
        setFilters({
            supplier_name: "",
            transactionId: "",
            paymentMethod: "",
            bankBranch: "",
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

    const hasActiveFilters = Object.values(filters).some((value) => value !== "");

    // Keep filter open when there are active filters
    React.useEffect(() => {
        if (hasActiveFilters && !isFilterEnabled) {
            setIsFilterEnabled(true);
        }
    }, [hasActiveFilters, isFilterEnabled]);

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="text-center text-destructive">
                        <h2 className="text-xl font-semibold mb-2">Error</h2>
                        <p>{error}</p>
                        <Button
                            onClick={fetchBuyReport}
                            className="mt-4"
                            variant="outline"
                        >
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Purchase Transactions</CardTitle>
                <div className="flex items-center space-x-2">
                    {/* Show "Filter" text only on large devices */}
                    <span className="hidden md:inline text-sm font-medium">Filter</span>
                    {/* Toggle button for all devices */}
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
                    {/* Clear filters button */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Supplier Name */}
                        <div className="space-y-2">
                            <Label htmlFor="supplier_name" className="text-sm font-medium">
                                Supplier Name
                            </Label>
                            <Input
                                id="supplier_name"
                                placeholder="Enter supplier name"
                                value={filters.supplier_name}
                                onChange={(e) =>
                                    handleFilterChange("supplier_name", e.target.value)
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
                    </div>
                </div>
            )}

            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Bank</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>See Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <LoadingTableSkeleton />
                            ) : (
                                buyData.map((buy, index) => (
                                    <TableRow key={buy.id}>
                                        <TableCell>
                                            {(paginationData.currentPage - 1) *
                                                paginationData.pageSize +
                                                index +
                                                1}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {buy.supplier_name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {buy.transaction_id}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {calculateTotal(
                                                buy.price_per_quantity,
                                                buy.quantity
                                            ).toLocaleString()}{" "}
                                            Birr
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {getPaymentMethodBadge(buy.payment_method)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {buy.Bank_list ? buy.Bank_list.branch : "-"}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(buy.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center items-center">
                                                <button
                                                    onClick={() => onViewDetails(buy.transaction_id)}
                                                    className="p-1 hover:bg-muted rounded-md transition-colors"
                                                >
                                                    <EyeIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {buyData.length > 0 && (
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
                                                    variant={currentPage === page ? "default" : "outline"}
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
    );
}

export default BuyReportTable;