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
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";
import ProductTransactionSummary from "./component/ProductTransactionSummary";

interface ProductStock {
    id: number;
    amount_money: number;
    price_per_quantity: number;
    quantity: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    product_type_id: number;
}

interface ProductCategory {
    id: number;
    name: string;
}

interface ProductType {
    id: number;
    name: string;
    measurement: string;
    Product_category: ProductCategory;
    product_Stock: ProductStock[];
    createdAt: string;
    updatedAt: string;
}

interface ProductTransactionData {
    id: number;
    transaction_id: string;
    type_id: number;
    quantity: number;
    price_per_quantity: number;
    method: "IN" | "OUT";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    Product_type: ProductType;
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
    productName: string;
    startDate: string;
    endDate: string;
}

function ProductTransaction() {
    const [productData, setProductData] = useState<ProductTransactionData[]>([]);
    const [summaryData, setSummaryData] = useState<ProductTransactionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isFilterEnabled, setIsFilterEnabled] = React.useState(false);
    const [filters, setFilters] = useState<FilterForm>({
        transactionId: "",
        productName: "",
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
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTransactionTypeBadge = (method: "IN" | "OUT") => {
        if (method === "IN") {
            return <Badge className="bg-green-500 text-white">IN</Badge>;
        } else {
            return <Badge className="bg-red-500 text-white">OUT</Badge>;
        }
    };

    const getInQuantity = (transaction: ProductTransactionData) => {
        return transaction.method === "IN" ? transaction.quantity : 0;
    };

    const getOutQuantity = (transaction: ProductTransactionData) => {
        return transaction.method === "OUT" ? transaction.quantity : 0;
    };

    const fetchProductTransactions = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters for paginated data
            const params: any = {
                page: currentPage,
                limit: pageSize,
            };

            // Add filter parameters only if they have values
            if (filters.transactionId) params.transactionId = filters.transactionId;
            if (filters.productName) params.productName = filters.productName;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await api.get("/admin/get-product-transaction", {
                params,
            });
            setProductData(response.data.productTransactions);
            setPaginationData(response.data.pagination);

            // Fetch all data for summary (with same filters but no pagination)
            const summaryParams = { ...params };
            delete summaryParams.page;
            delete summaryParams.limit;
            summaryParams.limit = 10000; // Get all records for summary

            const summaryResponse = await api.get("/admin/get-product-transaction", {
                params: summaryParams,
            });
            setSummaryData(summaryResponse.data.productTransactions);
        } catch (err: any) {
            setError("Failed to fetch product transactions");
            console.error(err);
            toast.error(
                err.response?.data?.error || "Failed to fetch product transactions"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductTransactions();
    }, [currentPage, pageSize, filters]);

    const handleFilterChange = (field: keyof FilterForm, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const clearFilters = () => {
        setFilters({
            transactionId: "",
            productName: "",
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

    const handleViewDetails = (transactionId: string) => {
        // Implementation for viewing transaction details
    };

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="text-center text-destructive">
                        <h2 className="text-xl font-semibold mb-2">Error</h2>
                        <p>{error}</p>
                        <Button
                            onClick={fetchProductTransactions}
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
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Product Transaction Report</h1>
                <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Summary Cards */}
            <ProductTransactionSummary summaryData={summaryData} />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Product Transactions</CardTitle>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                            {/* Product Name */}
                            <div className="space-y-2">
                                <Label htmlFor="productName" className="text-sm font-medium">
                                    Product Name
                                </Label>
                                <Input
                                    id="productName"
                                    placeholder="Enter product name"
                                    value={filters.productName}
                                    onChange={(e) =>
                                        handleFilterChange("productName", e.target.value)
                                    }
                                />
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
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Measurement</TableHead>
                                    <TableHead>Price per Unit</TableHead>
                                    <TableHead>IN</TableHead>
                                    <TableHead>OUT</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                <span className="ml-2">Loading...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : productData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8">
                                            No product transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    productData.map((transaction, index) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                {(paginationData.currentPage - 1) *
                                                    paginationData.pageSize +
                                                    index +
                                                    1}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {transaction.transaction_id}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {transaction.Product_type.name}
                                            </TableCell>
                                            <TableCell>
                                                {transaction.Product_type.Product_category.name}
                                            </TableCell>
                                            <TableCell>
                                                {getTransactionTypeBadge(transaction.method)}
                                            </TableCell>
                                            <TableCell>
                                                {transaction.Product_type.measurement}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {transaction.price_per_quantity.toLocaleString()} Birr
                                            </TableCell>
                                            <TableCell className="font-medium text-green-600">
                                                {getInQuantity(transaction) > 0
                                                    ? `${getInQuantity(transaction).toLocaleString()}`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="font-medium text-red-600">
                                                {getOutQuantity(transaction) > 0
                                                    ? `${getOutQuantity(transaction).toLocaleString()}`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(transaction.updatedAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {productData.length > 0 && (
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
        </div>
    );
}

export default ProductTransaction;