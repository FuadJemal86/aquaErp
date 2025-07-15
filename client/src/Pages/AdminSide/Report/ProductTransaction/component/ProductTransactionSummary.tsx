import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, DollarSign, TrendingUp } from "lucide-react";

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
}

interface ProductTransactionSummaryProps {
    summaryData: ProductTransactionData[];
}

function ProductTransactionSummary({ summaryData }: ProductTransactionSummaryProps) {
    // Summary calculations
    const getTotalProducts = () => {
        return summaryData.length;
    };

    const getTotalInventoryValue = () => {
        return summaryData.reduce((total, product) => {
            const productTotal = product.product_Stock.reduce((stockTotal, stock) => {
                return stockTotal + stock.amount_money;
            }, 0);
            return total + productTotal;
        }, 0);
    };

    const getTotalQuantity = () => {
        return summaryData.reduce((total, product) => {
            const productTotal = product.product_Stock.reduce((stockTotal, stock) => {
                return stockTotal + stock.quantity;
            }, 0);
            return total + productTotal;
        }, 0);
    };

    const getAverageProductValue = () => {
        if (summaryData.length === 0) return 0;
        return getTotalInventoryValue() / summaryData.length;
    };

    const getActiveProducts = () => {
        return summaryData.filter(product =>
            product.product_Stock.some(stock => stock.isActive)
        ).length;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Products
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{getTotalProducts()}</div>
                    <p className="text-xs text-muted-foreground">
                        {getActiveProducts()} active products
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">
                        {getTotalInventoryValue().toLocaleString()} Birr
                    </div>
                    <p className="text-xs text-muted-foreground">Total stock value</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Quantity
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">
                        {getTotalQuantity().toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Units in stock</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">
                        {getAverageProductValue().toFixed(0)} Birr
                    </div>
                    <p className="text-xs text-muted-foreground">Per product</p>
                </CardContent>
            </Card>
        </div>
    );
}

export default ProductTransactionSummary;