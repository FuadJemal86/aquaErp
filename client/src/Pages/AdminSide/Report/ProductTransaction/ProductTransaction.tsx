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
    Eye,
    Package,
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
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ProductTransactionData {
    id: number;
    name: string;
    measurement: string;
    updatedAt: string;
    product_Stock: ProductStock[];
    Product_category: ProductCategory;
    createdAt: string
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
    productName: string;
    categoryName: string;
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
        productName: "",
        categoryName: "",
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

    const getStatusBadge = (stocks: ProductStock[]) => {
        const activeStocks = stocks.filter(stock => stock.isActive);
        if (activeStocks.length === 0) {
            return <Badge className="bg-red-500 text-white">Inactive</Badge>;
        } else if (activeStocks.length === stocks.length) {
            return <Badge className="bg-green-500 text-white">Active</Badge>;
        } else {
            return <Badge className="bg-yellow-500 text-white">Partial</Badge>;
        }
    };

    const getTotalValue = (stocks: ProductStock[]) => {
        return stocks.reduce((total, stock) => total + stock.amount_money, 0);
    };

    const getTotalQuantity = (stocks: ProductStock[]) => {
        return stocks.reduce((total, stock) => total + stock.quantity, 0);
    };

    const getAveragePrice = (stocks: ProductStock[]) => {
        if (stocks.length === 0) return 0;
        const totalPrice = stocks.reduce((total, stock) => total + stock.price_per_quantity, 0);
        return totalPrice / stocks.length;
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
            if (filters.productName) params.productName = filters.productName;
            if (filters.categoryName) params.categoryName = filters.categoryName;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await api.get("/admin/get-product-transaction", {
                params,
            });
            setProductData(response.data.productTransaction);
            setPaginationData(response.data.pagination);

            // Fetch all data for summary (with same filters but no pagination)
            const summaryParams = { ...params };
            delete summaryParams.page;
            delete summaryParams.limit;
            summaryParams.limit = 10000; // Get all records for summary

            const summaryResponse = await api.get("/admin/get-product-transaction", {
                params: summaryParams,
            });
            setSummaryData(summaryResponse.data.productTransaction);
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
            productName: "",
            categoryName: "",
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

    const handleViewDetails = (productId: number) => {
        // Implementation for viewing product details
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
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Product Transaction Report</h1>
                <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Summary Cards */}
            <ProductTransactionSummary summaryData={summaryData} />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg md:text-xl">Product Transactions</CardTitle>
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
                    <div className="px-4 md:px-6 pb-4 border-b">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                            {/* Category Name */}
                            <div className="space-y-2">
                                <Label htmlFor="categoryName" className="text-sm font-medium">
                                    Category
                                </Label>
                                <Input
                                    id="categoryName"
                                    placeholder="Enter category name"
                                    value={filters.categoryName}
                                    onChange={(e) =>
                                        handleFilterChange("categoryName", e.target.value)
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

                <CardContent className="px-4 md:px-6">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Measurement</TableHead>
                                        <TableHead>Total Quantity</TableHead>
                                        <TableHead>Total Value</TableHead>
                                        <TableHead>Avg Price</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                    <span className="ml-2">Loading...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : productData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                No product transactions found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        productData.map((product, index) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    {(paginationData.currentPage - 1) *
                                                        paginationData.pageSize +
                                                        index +
                                                        1}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {product.name}
                                                </TableCell>
                                                <TableCell>
                                                    {product.Product_category.name}
                                                </TableCell>
                                                <TableCell className="uppercase">
                                                    {product.measurement}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {getTotalQuantity(product.product_Stock).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="font-medium text-green-600">
                                                    {getTotalValue(product.product_Stock).toLocaleString()} Birr
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {getAveragePrice(product.product_Stock).toFixed(2)} Birr
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(product.createdAt)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="lg:hidden space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <span className="ml-2">Loading...</span>
                                </div>
                            </div>
                        ) : productData.length === 0 ? (
                            <div className="text-center py-8">
                                No product transactions found
                            </div>
                        ) : (
                            productData.map((product, index) => (
                                <div key={product.id} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm text-muted-foreground">
                                                    #{(paginationData.currentPage - 1) *
                                                        paginationData.pageSize +
                                                        index +
                                                        1}
                                                </span>
                                            </div>
                                            <h3 className="font-medium text-lg">{product.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {product.Product_category.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground uppercase">
                                                {product.measurement}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Quantity</p>
                                            <p className="font-medium">
                                                {getTotalQuantity(product.product_Stock).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Value</p>
                                            <p className="font-medium text-green-600">
                                                {getTotalValue(product.product_Stock).toLocaleString()} Birr
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Avg Price</p>
                                            <p className="font-medium">
                                                {getAveragePrice(product.product_Stock).toFixed(2)} Birr
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Date</p>
                                            <p className="text-sm">
                                                {formatDate(product.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {productData.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-2 pt-4 border-t mt-6">
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
                                <div className="flex items-center justify-center sm:justify-end space-x-1 sm:space-x-2 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToFirstPage}
                                        disabled={currentPage === 1}
                                        className="h-8 w-8 p-0 sm:w-auto sm:px-2"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className="h-8 w-8 p-0 sm:w-auto sm:px-2"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="flex items-center space-x-1">
                                        {Array.from(
                                            { length: Math.min(3, paginationData.totalPages) },
                                            (_, i) => {
                                                let page;
                                                if (paginationData.totalPages <= 3) {
                                                    page = i + 1;
                                                } else if (currentPage <= 2) {
                                                    page = i + 1;
                                                } else if (currentPage >= paginationData.totalPages - 1) {
                                                    page = paginationData.totalPages - 2 + i;
                                                } else {
                                                    page = currentPage - 1 + i;
                                                }
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
                                        className="h-8 w-8 p-0 sm:w-auto sm:px-2"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToLastPage}
                                        disabled={currentPage === paginationData.totalPages}
                                        className="h-8 w-8 p-0 sm:w-auto sm:px-2"
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