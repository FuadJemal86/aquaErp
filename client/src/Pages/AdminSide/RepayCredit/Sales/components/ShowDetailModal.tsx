import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Banknote,
  Building2,
  CreditCard,
  Image as ImageIcon,
  Package,
  X,
} from "lucide-react";
import ProcessRepayment from "./ProcessRepayment";

// Type definitions
interface SalesCredit {
  id: number;
  customer_id: number;
  transaction_id: string;
  total_money: number;
  return_date: string;
  issued_date: string;
  description?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  customer_name: string;
}

interface SalesTransactionDetails {
  id: number;
  type_id?: number;
  customer_id?: number;
  manager_id?: number;
  transaction_id: string;
  price_per_quantity: number;
  quantity: number;
  payment_method: string;
  customer_type: string;
  status: string;
  Product_type?: {
    id: number;
    name: string;
  };
  manager_name?: string;
  cashier_name?: string;
  Bank_list?: {
    id: number;
    branch: string;
    account_number: string;
    owner: string;
  };
}

type BankAccount = {
  id: number;
  branch: string;
  account_number: string;
  owner: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bank_balance: {
    balance: number;
  }[];
};

interface RepaymentForm {
  amount_payed: number;
  payment_method: "CASH" | "BANK";
  bank_id?: number;
  image?: File | null;
  imagePreview?: string;
  outstanding_balance: number;
}

interface SalesCreditTransactions {
  id: number;
  amount_payed: number;
  payment_method: string;
  CTID: string;
  manager_name: string;
  outstanding_balance: number;
}

interface ShowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCredit: SalesCredit | null;
  transactionDetails: SalesTransactionDetails[];
  salesCreditTransaction: SalesCreditTransactions[];
  bankAccounts: BankAccount[];
  modalLoading: boolean;
  repaymentLoading: boolean;
  repaymentError: string | null;
  onRepayment: (data: any) => void;
  formatCurrency: (amount: number) => string;
}

function ShowDetailModal({
  isOpen,
  onClose,
  selectedCredit,
  transactionDetails,
  salesCreditTransaction,
  bankAccounts,
  modalLoading,
  repaymentLoading,
  repaymentError,
  onRepayment,
  formatCurrency,
}: ShowDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with proper blur effect */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center p-4"
        style={{
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-[95vw] lg:max-w-[85vw] xl:max-w-[80vw] 2xl:max-w-[75vw] max-h-[90vh] overflow-y-auto border z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Product Details & Repayment
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Transaction details and repayment form for{" "}
              {selectedCredit?.customer_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Product Details
                {transactionDetails.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {transactionDetails.length} Transaction
                    {transactionDetails.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modalLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : transactionDetails.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">ID</TableHead>
                        <TableHead className="w-[120px]">Responsible Person</TableHead>
                        <TableHead className="w-[180px]">
                          Product Type
                        </TableHead>
                        <TableHead className="w-[100px]">Quantity</TableHead>
                        <TableHead className="w-[140px]">Price/Unit</TableHead>
                        <TableHead className="w-[120px]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionDetails.map((detail, index) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {detail?.manager_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              {detail.Product_type?.name || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {detail.quantity}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4 text-muted-foreground" />
                              {formatCurrency(detail.price_per_quantity)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div className="text-sm font-medium">
                                {formatCurrency(
                                  detail.quantity * detail.price_per_quantity
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No transaction details available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales Credit Transaction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Transaction History
                {salesCreditTransaction.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {salesCreditTransaction.length} Transaction
                    {salesCreditTransaction.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modalLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : salesCreditTransaction.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">ID</TableHead>
                        <TableHead className="w-[120px]">
                          Credit Transaction ID
                        </TableHead>
                        <TableHead className="w-[180px]">
                          Amount Payed
                        </TableHead>
                        <TableHead className="w-[100px]">
                          Payment Method
                        </TableHead>
                        <TableHead className="w-[100px]">
                          Outstanding Balance
                        </TableHead>
                        <TableHead className="w-[100px]">Image</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesCreditTransaction.map((detail, index) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4 text-muted-foreground" />
                              {detail.CTID || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {formatCurrency(detail.amount_payed)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4 text-muted-foreground" />
                              <Badge
                                variant={
                                  detail.payment_method === "CASH"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {detail.payment_method}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div className="text-sm font-medium">
                                {formatCurrency(detail.outstanding_balance)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {detail.payment_method === "BANK" ? (
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                  <Button variant="outline">Download</Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">-</div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No previous transactions available for this customer
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Process Repayment Component */}
          <ProcessRepayment
            selectedCredit={selectedCredit}
            bankAccounts={bankAccounts}
            repaymentLoading={repaymentLoading}
            repaymentError={repaymentError}
            onRepayment={onRepayment}
            onCancel={onClose}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </div>
  );
}

export default ShowDetailModal;
