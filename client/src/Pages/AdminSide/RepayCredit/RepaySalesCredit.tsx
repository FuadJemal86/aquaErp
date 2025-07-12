import api from "@/services/api";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  RefreshCw,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  FileText,
  Eye,
  Search,
  Package,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Banknote,
  Building2,
  Image as ImageIcon,
  X,
} from "lucide-react";

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
  payment_method: 'CASH' | 'BANK';
  bank_id?: number;
  image?: File | null;
  imagePreview?: string;
  outstanding_balance: number;
}

function RepaySalesCredit() {
  const [credits, setCredits] = useState<SalesCredit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal states
  const [selectedCredit, setSelectedCredit] = useState<SalesCredit | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<SalesTransactionDetails[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Repayment form states
  const [repaymentForm, setRepaymentForm] = useState<RepaymentForm>({
    amount_payed: 0,
    payment_method: 'CASH',
    outstanding_balance: 0,
  });
  const [repaymentLoading, setRepaymentLoading] = useState<boolean>(false);
  const [repaymentError, setRepaymentError] = useState<string | null>(null);

  // Fetch sales credit report
  const fetchSalesCredits = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/get-all-sales-credits");
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
        setError("Sales credit report not found");
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

  // Fetch transaction details
  const fetchTransactionDetails = async (transactionId: string) => {
    try {
      setModalLoading(true);
      const response = await api.get(`/admin/get-sales-transaction-details/${transactionId}`);
      const result = response.data;

      console.log("Transaction details received:", result); // Debugging

      if (result.status && Array.isArray(result.data) && result.data.length > 0) {
        // Map all transactions instead of just taking the first one
        const mappedDetails = result.data.map((detail: any) => ({
          id: detail.id,
          type_id: detail.Product_type?.id,
          customer_id: detail.customer_id,
          manager_id: detail.manager_id,
          transaction_id: transactionId,
          price_per_quantity: detail.price_per_quantity,
          payment_method: detail.payment_method,
          customer_type: detail.customer_type,
          status: detail.status,
          Product_type: detail.Product_type,
          manager_name: detail.manager_name,
          cashier_name: detail.cashier_name,
          Bank_list: detail.Bank_list
        }));
        setTransactionDetails(mappedDetails);
      } else {
        throw new Error(result.error || "No transaction details found");
      }
    } catch (err: any) {
      console.error("Error fetching transaction details:", err);
      setTransactionDetails([]);
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
        setBankAccounts(
          result.filter((bank: BankAccount) => bank.isActive)
        );
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
    setRepaymentForm({
      amount_payed: 0,
      payment_method: 'CASH',
      outstanding_balance: credit.total_money,
    });
    setRepaymentError(null);

    await fetchTransactionDetails(credit.transaction_id);
    await fetchBankAccounts();
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRepaymentForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  // Remove image
  const removeImage = () => {
    setRepaymentForm(prev => ({
      ...prev,
      image: null,
      imagePreview: undefined
    }));
  };

  // Handle repayment form submission
  const handleRepayment = async () => {
    if (!selectedCredit) return;

    try {
      setRepaymentLoading(true);
      setRepaymentError(null);

      // Validate form
      if (repaymentForm.amount_payed <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      if (repaymentForm.payment_method === 'BANK') {
        if (!repaymentForm.bank_id) {
          throw new Error("Please select a bank account");
        }
        if (!repaymentForm.image) {
          throw new Error("Please upload a payment receipt image");
        }
      }

      const formData = new FormData();
      formData.append('transaction_id', selectedCredit.transaction_id);
      formData.append('amount_payed', repaymentForm.amount_payed.toString());
      formData.append('payment_method', repaymentForm.payment_method);
      formData.append('outstanding_balance', repaymentForm.outstanding_balance.toString());

      if (repaymentForm.payment_method === 'BANK') {
        formData.append('bank_id', repaymentForm.bank_id!.toString());
        if (repaymentForm.image) {
          formData.append('image', repaymentForm.image);
        }
      }

      const response = await api.post('/admin/repay-credit-sales', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const result = response.data;

      if (result.status) {
        // Success - refresh the credits list and close modal
        await fetchSalesCredits();
        setIsModalOpen(false);
        setSelectedCredit(null);
      } else {
        setRepaymentError(result.error || "Failed to process repayment");
      }
    } catch (err: any) {
      console.error("Error processing repayment:", err);
      setRepaymentError(err.response?.data?.error || err.message || "Failed to process repayment");
    } finally {
      setRepaymentLoading(false);
    }
  };

  // Update outstanding balance when amount_payed changes
  useEffect(() => {
    if (selectedCredit) {
      setRepaymentForm(prev => ({
        ...prev,
        outstanding_balance: Math.max(0, selectedCredit.total_money - (prev.amount_payed || 0))
      }));
    }
  }, [repaymentForm.amount_payed, selectedCredit]);

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
      {activeCredits.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
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
        </Card>
      )}

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
              className={`transition-all duration-200 hover:shadow-lg ${isOverdue(credit.return_date)
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
                  </div>
                )}

                {/* Action Button */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full gap-2"
                      variant="outline"
                      onClick={() => handleShowDetails(credit)}
                    >
                      <Eye className="h-4 w-4" />
                      Show Details & Repay
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Credit Details & Repayment
                      </DialogTitle>
                      <DialogDescription>
                        Transaction details and repayment form for {selectedCredit?.customer_name}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Credit Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Credit Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">Customer Name</Label>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {selectedCredit?.customer_name}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">Transaction ID</Label>
                              <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                {selectedCredit?.transaction_id}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                              <div className="text-lg font-bold text-primary">
                                {selectedCredit && formatCurrency(selectedCredit.total_money)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                              <Badge
                                className={`text-white ${selectedCredit?.status === "ACCEPTED"
                                  ? "bg-blue-500"
                                  : selectedCredit?.status === "PAYED"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                  }`}
                              >
                                {selectedCredit?.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Transaction Details */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Transaction Details
                            {transactionDetails.length > 0 && (
                              <Badge variant="outline" className="ml-2">
                                {transactionDetails.length} Transaction{transactionDetails.length > 1 ? 's' : ''}
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
                            <div className="space-y-6">
                              {transactionDetails.map((detail, index) => (
                                <div key={detail.id} className="space-y-4">
                                  {transactionDetails.length > 1 && (
                                    <div className="flex items-center gap-2 mb-4">
                                      <Badge variant="secondary">
                                        Transaction {index + 1}
                                      </Badge>
                                      <Separator className="flex-1" />
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-muted-foreground">Product Type</Label>
                                      <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        {detail.Product_type?.name || 'N/A'}
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-muted-foreground">Customer Type</Label>
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {detail.customer_type}
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-muted-foreground">Price per Quantity</Label>
                                      <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        {formatCurrency(detail.price_per_quantity)}
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                                      <div className="flex items-center gap-2">
                                        <Banknote className="h-4 w-4" />
                                        {detail.payment_method}
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-muted-foreground">Manager</Label>
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {detail.manager_name || 'N/A'}
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-muted-foreground">Cashier</Label>
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {detail.cashier_name || 'N/A'}
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                      <Badge
                                        className={`text-white ${detail.status === "ACCEPTED"
                                          ? "bg-blue-500"
                                          : detail.status === "PAYED"
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                          }`}
                                      >
                                        {detail.status}
                                      </Badge>
                                    </div>

                                    {detail.Bank_list && (
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Bank Account</Label>
                                        <div className="flex items-center gap-2">
                                          <Building2 className="h-4 w-4" />
                                          {detail.Bank_list.branch} - {detail.Bank_list.account_number}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {index < transactionDetails.length - 1 && (
                                    <Separator className="my-4" />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">No transaction details available</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Repayment Form */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Process Repayment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {repaymentError && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Error</AlertTitle>
                              <AlertDescription>{repaymentError}</AlertDescription>
                            </Alert>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="amount_payed">Amount to Pay</Label>
                              <Input
                                id="amount_payed"
                                type="number"
                                placeholder="Enter amount"
                                value={repaymentForm.amount_payed || ''}
                                onChange={(e) => setRepaymentForm(prev => ({
                                  ...prev,
                                  amount_payed: parseFloat(e.target.value) || 0
                                }))}
                                min="0"
                                step="0.01"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="outstanding_balance">Outstanding Balance</Label>
                              <Input
                                id="outstanding_balance"
                                type="number"
                                value={repaymentForm.outstanding_balance}
                                disabled
                                className="bg-muted"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="payment_method">Payment Method</Label>
                            <Select
                              value={repaymentForm.payment_method}
                              onValueChange={(value: 'CASH' | 'BANK') => setRepaymentForm(prev => ({
                                ...prev,
                                payment_method: value,
                                bank_id: value === 'CASH' ? undefined : prev.bank_id
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="BANK">Bank Transfer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {repaymentForm.payment_method === 'BANK' && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="bank_id">Bank Account</Label>
                                <Select
                                  value={repaymentForm.bank_id?.toString() || ''}
                                  onValueChange={(value) => setRepaymentForm(prev => ({
                                    ...prev,
                                    bank_id: parseInt(value)
                                  }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select bank account" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {bankAccounts.map((bank) => (
                                      <SelectItem key={bank.id} value={bank.id.toString()}>
                                        {bank.branch} - {bank.account_number} ({bank.owner})
                                        {bank.bank_balance && bank.bank_balance.length > 0 && (
                                          <span className="ml-2 text-muted-foreground">
                                            - Balance: {formatCurrency(bank.bank_balance[0].balance)}
                                          </span>
                                        )}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="receipt_image">Payment Receipt Image</Label>
                                <div className="space-y-2">
                                  <Input
                                    id="receipt_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                                  />
                                  {repaymentForm.imagePreview && (
                                    <div className="relative inline-block">
                                      <img
                                        src={repaymentForm.imagePreview}
                                        alt="Payment Receipt Preview"
                                        className="max-w-xs max-h-48 rounded-lg border"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                        onClick={removeImage}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <Separator />

                          <div className="flex items-center justify-between pt-4">
                            <div className="text-sm text-muted-foreground">
                              <div>Total Amount: {selectedCredit && formatCurrency(selectedCredit.total_money)}</div>
                              <div>Amount Paying: {formatCurrency(repaymentForm.amount_payed)}</div>
                              <div className="font-medium">
                                Outstanding Balance: {formatCurrency(repaymentForm.outstanding_balance)}
                              </div>
                            </div>
                            <Button
                              onClick={handleRepayment}
                              disabled={repaymentLoading || repaymentForm.amount_payed <= 0}
                              className="gap-2"
                            >
                              {repaymentLoading ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  Process Repayment
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default RepaySalesCredit;