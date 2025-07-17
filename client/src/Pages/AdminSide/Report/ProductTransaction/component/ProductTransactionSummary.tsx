import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, DollarSign, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

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

interface ProductTransactionSummaryProps {
    summaryData: ProductTransactionData[];
}

function ProductTransactionSummary({ summaryData }: ProductTransactionSummaryProps) {
    // Summary calculations
    const getTotalTransactions = () => {
        return summaryData.length;
    };

    const getTotalInAmount = () => {
        return summaryData.reduce((total, transaction) => {
            return transaction.method === "IN"
                ? total + (transaction.quantity * transaction.price_per_quantity)
                : total;
        }, 0);
    };

    const getTotalOutAmount = () => {
        return summaryData.reduce((total, transaction) => {
            return transaction.method === "OUT"
                ? total + (transaction.quantity * transaction.price_per_quantity)
                : total;
        }, 0);
    };

    const getNetAmount = () => {
        return getTotalInAmount() - getTotalOutAmount();
    };

    const getInTransactionCount = () => {
        return summaryData.filter(transaction => transaction.method === "IN").length;
    };

    const getOutTransactionCount = () => {
        return summaryData.filter(transaction => transaction.method === "OUT").length;
    };

    const getTotalInQuantity = () => {
        return summaryData.reduce((total, transaction) => {
            return transaction.method === "IN" ? total + transaction.quantity : total;
        }, 0);
    };

    const getTotalOutQuantity = () => {
        return summaryData.reduce((total, transaction) => {
            return transaction.method === "OUT" ? total + transaction.quantity : total;
        }, 0);
    };

    const getUniqueProducts = () => {
        const uniqueProductIds = new Set(summaryData.map(transaction => transaction.type_id));
        return uniqueProductIds.size;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Transactions
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{getTotalTransactions()}</div>
                    <p className="text-xs text-muted-foreground">
                        {getInTransactionCount()} IN • {getOutTransactionCount()} OUT
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total IN Value</CardTitle>
                    <ArrowUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {getTotalInAmount().toLocaleString()} Birr
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {getTotalInQuantity().toLocaleString()} units received
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total OUT Value</CardTitle>
                    <ArrowDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-red-600">
                        {getTotalOutAmount().toLocaleString()} Birr
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {getTotalOutQuantity().toLocaleString()} units dispatched
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Value</CardTitle>
                    <TrendingUp className={`h-4 w-4 ${getNetAmount() >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-xl sm:text-2xl font-bold ${getNetAmount() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {getNetAmount().toLocaleString()} Birr
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {getUniqueProducts()} unique products
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default ProductTransactionSummary;