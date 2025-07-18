import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";
import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  DollarSign,
  Eye,
  FileText,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ShowDetailModal from "./components/ShowDetailModal";

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

interface SalesCreditTransactions {
  id: number;
  amount_payed: number;
  payment_method: string;
  CTID: string;
  manager_name: string;
  outstanding_balance: number;
}

function RepaySalesCredit() {
  const [credits, setCredits] = useState<SalesCredit[]>([]);
  const [salesCreditTransaction, setSalesCreditTransaction] = useState<
    SalesCreditTransactions[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal states
  const [selectedCredit, setSelectedCredit] = useState<SalesCredit | null>(
    null
  );
  const [transactionDetails, setTransactionDetails] = useState<
    SalesTransactionDetails[]
  >([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Repayment states
  const [repaymentLoading, setRepaymentLoading] = useState<boolean>(false);
  const [repaymentError, setRepaymentError] = useState<string | null>(null);

  // Fetch sales credit report all ACCEPTED and overdue
  const fetchSalesCredits = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        "/admin/get-sales-credit-report-for-repay"
      );
      const result = response.data;

      if (result.status && result.data && Array.isArray(result.data)) {
        setCredits(result.data);
        setError(null);
      } else if (result.status === false) {
        setError(result.error || "Failed to fetch sales credit report");
        setCredits([]);
      } else {
        setError("Invalid response format");
        setCredits([]);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.log("Sales credit report not found");
      } else if (err.response?.status === 500) {
        setError("Internal server error");
      } else {
        setError("Network error occurred");
      }
      setCredits([]);
      console.error("Error fetching sales credits:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unified transaction details and credit transactions
  const fetchTransactionDetails = async (transactionId: string) => {
    try {
      setModalLoading(true);
      const response = await api.get(
        `/admin/get-sales-credit-details/${transactionId}`
      );
      const result = response.data;

      console.log("Unified transaction details received:", result); // Debugging

      if (result.status && result.data) {
        // Handle sales transactions
        if (
          result.data.salesTransactions &&
          Array.isArray(result.data.salesTransactions)
        ) {
          const mappedDetails = result.data.salesTransactions.map(
            (detail: any) => ({
              id: detail.id,
              type_id: detail.Product_type?.id,
              customer_id: detail.customer_id,
              manager_id: detail.manager_id,
              transaction_id: transactionId,
              price_per_quantity: detail.price_per_quantity,
              quantity: detail.quantity,
              payment_method: detail.payment_method,
              customer_type: detail.customer_type,
              status: detail.status,
              Product_type: detail.Product_type,
              manager_name: detail.manager_name,
              cashier_name: detail.cashier_name,
              Bank_list: detail.Bank_list,
            })
          );
          setTransactionDetails(mappedDetails);
        } else {
          setTransactionDetails([]);
        }

        // Handle sales credit transactions
        if (
          result.data.salesCreditTransactions &&
          Array.isArray(result.data.salesCreditTransactions)
        ) {
          const mappedCreditDetails = result.data.salesCreditTransactions.map(
            (detail: any) => ({
              id: detail.id,
              amount_payed: detail.amount_payed,
              payment_method: detail.payment_method,
              CTID: detail.CTID,
              manager_name: detail.maneger_name,
              outstanding_balance: detail.outstanding_balance,
            })
          );
          setSalesCreditTransaction(mappedCreditDetails);
        } else {
          setSalesCreditTransaction([]);
        }
      } else {
        console.log(result.error || "No transaction details found");
        setTransactionDetails([]);
        setSalesCreditTransaction([]);
      }
    } catch (err: any) {
      console.error("Error fetching transaction details:", err);
      setTransactionDetails([]);
      setSalesCreditTransaction([]);
      setRepaymentError(err.message || "Failed to load transaction details");
    } finally {
      setModalLoading(false);
    }
  };

  // Fetch bank accounts
  const fetchBankAccounts = async () => {
    try {
      const response = await api.get("/admin/get-bank-list");
      const result = response.data;

      console.log("Bank Accounts Response:", result); // Add this for debugging

      if (Array.isArray(result)) {
        setBankAccounts(result.filter((bank: BankAccount) => bank.isActive));
      } else {
        throw new Error(result.error || "Invalid bank accounts data");
      }
    } catch (err: any) {
      console.error("Error fetching bank accounts:", err);
      setBankAccounts([]);
      setRepaymentError(err.message || "Failed to load bank accounts");
    }
  };

  // Handle modal open
  const handleShowDetails = async (credit: SalesCredit) => {
    setSelectedCredit(credit);
    setIsModalOpen(true);
    setRepaymentError(null);

    await fetchTransactionDetails(credit.transaction_id);
    await fetchBankAccounts();
  };

  // Handle image upload

  // Handle repayment form submission
  const handleRepayment = async (formData: any) => {
    if (!selectedCredit) return;

    try {
      setRepaymentLoading(true);
      setRepaymentError(null);

      const apiFormData = new FormData();
      apiFormData.append("transaction_id", selectedCredit.transaction_id);
      apiFormData.append("amount_payed", formData.amount_payed.toString());
      apiFormData.append("payment_method", formData.payment_method);
      apiFormData.append(
        "outstanding_balance",
        formData.outstanding_balance.toString()
      );

      if (formData.payment_method === "BANK") {
        apiFormData.append("bank_id", formData.bank_id!.toString());
        if (formData.image) {
          apiFormData.append("image", formData.image);
        }
      }

      const response = await api.post(
        "/admin/repay-credit-sales",
        apiFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;

      if (result.status) {
        // Success - refresh the credits list and close modal
        toast.success("Repayment successful");
        await fetchSalesCredits();
        setIsModalOpen(false);
        setSelectedCredit(null);
      } else {
        toast.error(result.error || "Failed to process repayment");
        setRepaymentError(result.error || "Failed to process repayment");
      }
    } catch (err: any) {
      console.error("Error processing repayment:", err);
      setRepaymentError(
        err.response?.data?.error ||
        err.message ||
        "Failed to process repayment"
      );
    } finally {
      setRepaymentLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  // Check if return date has passed
  const isOverdue = (returnDate: string) => {
    return new Date(returnDate) < new Date();
  };

  // Calculate remaining days or days overdue
  const calculateRemainingDays = (returnDate: string) => {
    const today = new Date();
    const returnDateObj = new Date(returnDate);
    const timeDiff = returnDateObj.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  // Filter active credits with safety check and search term
  const activeCredits = Array.isArray(credits)
    ? credits.filter((credit) => credit.isActive)
    : [];

  // Filter credits based on search term
  const filteredCredits = activeCredits.filter((credit) =>
    credit.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchSalesCredits();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={fetchSalesCredits}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Repay Sales Credit</h1>
          </div>
          <p className="text-muted-foreground">
            Manage and process sales credit repayments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1 h-8">
            <CreditCard className="h-3 w-3" />
            Total Credits: {activeCredits.length}
          </Badge>
          <Button
            onClick={fetchSalesCredits}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {activeCredits.length > 0 && (
          <CardContent className="">
            <div className="relative max-w-md flex items-start justify-between">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <div className="mt-3 text-sm text-muted-foreground">
                {filteredCredits.length === 0
                  ? `No credits found for "${searchTerm}"`
                  : `Found ${filteredCredits.length} credit${filteredCredits.length === 1 ? "" : "s"
                  } for "${searchTerm}"`}
              </div>
            )}
          </CardContent>
        )}
      </div>

      {/* Credits Grid */}
      {activeCredits.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No sales credits found
              </h3>
              <p className="text-muted-foreground mb-4">
                There are no sales credits available for repayment
              </p>
              <Button onClick={fetchSalesCredits} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredCredits.length === 0 && searchTerm ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No matching credits found
              </h3>
              <p className="text-muted-foreground mb-4">
                No sales credits match your search term "{searchTerm}"
              </p>
              <Button onClick={() => setSearchTerm("")} variant="outline">
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCredits.map((credit) => (
            <Card
              key={credit.id}
              className={`transition-all duration-200 hover:shadow-lg ${credit.status === "OVERDUE"
                ? "border-destructive/50 bg-destructive/5"
                : ""
                }`}
            >
              <CardHeader className="">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold flex items-center ">
                      <User className="h-4 w-4 mr-2" />
                      {credit.customer_name}
                    </CardTitle>
                  </div>
                  <div className="relative">
                    <Badge
                      className={`text-white relative z-10 ${credit.status === "ACCEPTED"
                        ? "bg-blue-500"
                        : credit.status === "PAYED"
                          ? "bg-green-500"
                          : "bg-red-500"
                        }`}
                    >
                      {credit.status}
                    </Badge>
                    {credit.status !== "ACCEPTED" &&
                      credit.status !== "PAYED" && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <motion.div
                            className="absolute w-8 h-8 rounded-full bg-red-500/30 transform -translate-x-1/2 -translate-y-1/2"
                            animate={{
                              scale: [1, 3, 1],
                              opacity: [0.6, 0, 0.6],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeOut",
                            }}
                          />
                          <motion.div
                            className="absolute w-8 h-8 rounded-full bg-red-500/25 transform -translate-x-1/2 -translate-y-1/2"
                            animate={{
                              scale: [1, 2.5, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeOut",
                              delay: 0.4,
                            }}
                          />
                          <motion.div
                            className="absolute w-8 h-8 rounded-full bg-red-500/20 transform -translate-x-1/2 -translate-y-1/2"
                            animate={{
                              scale: [1, 3.5, 1],
                              opacity: [0.4, 0, 0.4],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeOut",
                              delay: 0.8,
                            }}
                          />
                        </div>
                      )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(credit.total_money)}
                  </div>
                </div>

                {/* Transaction ID */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Transaction ID
                  </div>
                  <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {credit.transaction_id}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Issued Date
                    </div>
                    <div className="text-sm">
                      {formatDate(credit.issued_date)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Return Date
                    </div>
                    <div
                      className={`text-sm ${isOverdue(credit.return_date)
                        ? "text-destructive font-medium"
                        : ""
                        }`}
                    >
                      {formatDate(credit.return_date)}
                      {isOverdue(credit.return_date) && (
                        <span className="ml-2 text-xs">⚠️ OVERDUE</span>
                      )}
                    </div>
                  </div>

                  {/* Remaining Days */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Remaining Days
                    </div>
                    <div
                      className={`text-sm font-medium ${calculateRemainingDays(credit.return_date) < 0
                        ? "text-destructive"
                        : "text-green-600 dark:text-green-400"
                        }`}
                    >
                      {calculateRemainingDays(credit.return_date) < 0
                        ? `${Math.abs(
                          calculateRemainingDays(credit.return_date)
                        )} days overdue`
                        : `${calculateRemainingDays(
                          credit.return_date
                        )} days left`}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {credit.description && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      Description
                    </div>
                    <div className="text-sm bg-muted p-2 rounded text-muted-foreground truncate">
                      {credit.description}
                    </div>
                    <Button
                      className="w-full gap-2"
                      variant="outline"
                      onClick={() => handleShowDetails(credit)}
                    >
                      <Eye className="h-4 w-4" />
                      Show Details & Repay
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ShowDetailModal Component */}
      <ShowDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedCredit={selectedCredit}
        transactionDetails={transactionDetails}
        salesCreditTransaction={salesCreditTransaction}
        bankAccounts={bankAccounts}
        modalLoading={modalLoading}
        repaymentLoading={repaymentLoading}
        repaymentError={repaymentError}
        onRepayment={handleRepayment}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

export default RepaySalesCredit;
