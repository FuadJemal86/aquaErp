import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import DetailSkeleton from "./DetailSkeleton";

interface BuyDetail {
    id: number;
    price_per_quantity: number;
    quantity: number;
    payment_method: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    type_id: number;
    bank_id: number | null;
    transaction_id: string;
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

interface ShowBuyDetailsProps {
    transactionId: string;
    isOpen: boolean;
    onClose: () => void;
}

function BuyDetails({ transactionId, isOpen, onClose }: ShowBuyDetailsProps) {
    const [buyDetails, setBuyDetails] = useState<BuyDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && transactionId) {
            fetchBuyDetails();
        }
    }, [isOpen, transactionId]);

    const fetchBuyDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(
                `/admin/get-buy-details/${transactionId}`
            );
            setBuyDetails(response.data.buy);
        } catch (err: any) {
            console.error("Error fetching buy details:", err);
            setError(err.response?.data?.message || "Failed to fetch buy details");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const getPaymentMethodBadge = (method: string) => {
        const color = {
            CASH: "bg-green-500 text-white",
            BANK: "bg-blue-500 text-white",
            CREDIT: "bg-yellow-500 text-white",
        } as const;

        return (
            <Badge className={color[method as keyof typeof color] || "default"}>
                {method}
            </Badge>
        );
    };;

    const getStatusBadge = (status: string) => {
        const color = {
            COMPLETED: "bg-green-500 text-white",
            PENDING: "bg-yellow-500 text-white",
            CANCELLED: "bg-red-500 text-white",
        } as const;

        return (
            <Badge className={color[status as keyof typeof color] || "bg-gray-500 text-white"}>
                {status}
            </Badge>
        );
    };

    const calculateTotal = (price: number, quantity: number) => {
        return price * quantity;
    };

    const getTotalAmount = () => {
        return buyDetails.reduce((total, detail) => {
            return total + calculateTotal(detail.price_per_quantity, detail.quantity);
        }, 0);
    };

    const getTotalQuantity = () => {
        return buyDetails.reduce((total, detail) => total + detail.quantity, 0);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4 pt-8"
            onClick={onClose}
        >
            <div
                className="relative mx-auto p-4 md:p-5 border w-full max-w-4xl shadow-2xl rounded-lg bg-card/95 backdrop-blur-md border-border max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mt-3">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-card-foreground">
                            Purchase Details - {transactionId}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {loading ? (
                        <DetailSkeleton />
                    ) : error ? (
                        <Card className="border-destructive">
                            <CardContent className="pt-6">
                                <div className="text-center text-destructive">
                                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                                    <p>{error}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : buyDetails.length > 0 ? (
                        <div className="space-y-6">
                            {/* Purchase Summary Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Purchase Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">
                                                Total Amount
                                            </div>
                                            <div className="text-lg font-semibold">
                                                {getTotalAmount().toLocaleString()} Birr
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">
                                                Total Items
                                            </div>
                                            <div className="text-lg font-semibold">
                                                {buyDetails.length}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">
                                                Total Quantity
                                            </div>
                                            <div className="text-lg font-semibold">
                                                {getTotalQuantity()}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">
                                                Transaction ID
                                            </div>
                                            <div className="text-sm font-mono">{transactionId}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">Date</div>
                                            <div className="text-sm">
                                                {formatDate(buyDetails[0]?.createdAt || "")}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">
                                                Payment Method
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getPaymentMethodBadge(
                                                    buyDetails[0]?.payment_method || ""
                                                )}
                                                {buyDetails[0]?.Bank_list && (
                                                    <span className="text-xs text-muted-foreground">
                                                        ({buyDetails[0].Bank_list.branch})
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">
                                                Supplier
                                            </div>
                                            <div className="text-sm">
                                                {buyDetails[0]?.supplier_name ? (
                                                    buyDetails[0].supplier_name
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Products Table Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Products Purchased</CardTitle>
                                    <CardDescription>
                                        {buyDetails.length} item(s) in this purchase transaction
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>#</TableHead>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>Price per Unit</TableHead>
                                                    <TableHead>Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {buyDetails.map((detail, index) => (
                                                    <TableRow key={detail.id}>
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell className="font-medium">
                                                            {detail.Product_type.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{detail.quantity}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {detail.price_per_quantity.toLocaleString()} Birr
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {calculateTotal(
                                                                detail.price_per_quantity,
                                                                detail.quantity
                                                            ).toLocaleString()} Birr
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
                                    No purchase details found for this transaction.
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BuyDetails;