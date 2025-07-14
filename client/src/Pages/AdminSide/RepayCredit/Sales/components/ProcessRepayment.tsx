import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, RefreshCw, X } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

// Zod schema for repayment form validation
const repaymentFormSchema = z
  .object({
    amount_payed: z
      .number()
      .min(0.01, "Amount must be greater than 0")
      .refine((val) => val > 0, {
        message: "Amount must be greater than 0",
      }),
    payment_method: z.enum(["CASH", "BANK"], {
      required_error: "Please select a payment method",
    }),
    bank_id: z.number().optional(),
    image: z.any().optional(),
    imagePreview: z.string().optional(),
    outstanding_balance: z.number().min(0),
  })
  .refine(
    (data) => {
      // Custom validation for BANK payment method
      if (data.payment_method === "BANK") {
        if (!data.bank_id) {
          return false;
        }
        if (!data.image) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Bank account and receipt image are required for BANK payments",
      path: ["payment_method"], // This will show the error on the payment_method field
    }
  );

type RepaymentFormData = z.infer<typeof repaymentFormSchema>;

interface ProcessRepaymentProps {
  selectedCredit: SalesCredit | null;
  bankAccounts: BankAccount[];
  repaymentLoading: boolean;
  repaymentError: string | null;
  onRepayment: (data: RepaymentFormData) => void;
  onCancel?: () => void;
  formatCurrency: (amount: number) => string;
}

function ProcessRepayment({
  selectedCredit,
  bankAccounts,
  repaymentLoading,
  repaymentError,
  onRepayment,
  onCancel,
  formatCurrency,
}: ProcessRepaymentProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<RepaymentFormData>({
    resolver: zodResolver(repaymentFormSchema),
    defaultValues: {
      amount_payed: 0,
      payment_method: "CASH",
      outstanding_balance: selectedCredit?.total_money || 0,
    },
    mode: "onChange",
  });

  const watchedValues = watch();
  const paymentMethod = watch("payment_method");
  const amountPayed = watch("amount_payed");

  // Update outstanding balance when amount changes
  React.useEffect(() => {
    if (selectedCredit && amountPayed !== undefined) {
      const newOutstandingBalance = Math.max(
        0,
        selectedCredit.total_money - (amountPayed || 0)
      );
      setValue("outstanding_balance", newOutstandingBalance);
    }
  }, [amountPayed, selectedCredit, setValue]);

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("image", file);

      // Create preview URL for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setValue("imagePreview", url);
      } else {
        setValue("imagePreview", "");
      }
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setValue("image", undefined);
    setValue("imagePreview", "");
    const fileInput = document.getElementById(
      "receipt_image"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Handle form submission
  const onSubmit = (data: RepaymentFormData) => {
    onRepayment(data);
  };

  // Validate amount against credit limit
  const getAmountError = () => {
    if (!selectedCredit || !amountPayed) return null;

    if (amountPayed > selectedCredit.total_money) {
      return "You can't pay more than the credit outstanding balance";
    }

    return null;
  };

  const amountError = getAmountError();

  // Helper function to safely get error message
  const getErrorMessage = (error: any): string => {
    if (typeof error === "string") return error;
    if (error?.message && typeof error.message === "string")
      return error.message;
    return "";
  };

  return (
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount_payed">Amount to Pay</Label>
              <Input
                id="amount_payed"
                type="number"
                placeholder="Enter amount"
                {...register("amount_payed", {
                  valueAsNumber: true,
                })}
                min="0"
                step="0.01"
                className={
                  errors.amount_payed || amountError ? "border-red-500" : ""
                }
              />
              {(errors.amount_payed || amountError) && (
                <p className="text-xs text-red-500">
                  {amountError || getErrorMessage(errors.amount_payed)}
                </p>
              )}
              {!errors.amount_payed && !amountError && (
                <p className="text-xs text-gray-500">
                  Maximum:{" "}
                  {selectedCredit && formatCurrency(selectedCredit.total_money)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="outstanding_balance">Outstanding Balance</Label>
              <Input
                id="outstanding_balance"
                type="number"
                {...register("outstanding_balance", {
                  valueAsNumber: true,
                })}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: "CASH" | "BANK") =>
                setValue("payment_method", value)
              }
            >
              <SelectTrigger
                className={errors.payment_method ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-xs text-red-500">
                {getErrorMessage(errors.payment_method)}
              </p>
            )}
          </div>

          {paymentMethod === "BANK" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank_id">Bank Account</Label>
                <Select
                  value={watchedValues.bank_id?.toString() || ""}
                  onValueChange={(value) =>
                    setValue("bank_id", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id.toString()}>
                        {bank.branch} - {bank.account_number} ({bank.owner})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bank_id && (
                  <p className="text-xs text-red-500">
                    {getErrorMessage(errors.bank_id)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt_image">Payment Receipt Image</Label>
                <div className="space-y-2">
                  <Input
                    id="receipt_image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  {watchedValues.imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={watchedValues.imagePreview}
                        alt="Payment Receipt Preview"
                        className="max-w-xs max-h-48 rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={handleRemoveFile}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {errors.image && (
                  <p className="text-xs text-red-500">
                    {getErrorMessage(errors.image)}
                  </p>
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 gap-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                Total Amount:{" "}
                {selectedCredit && formatCurrency(selectedCredit.total_money)}
              </div>
              <div>Amount Paying: {formatCurrency(amountPayed || 0)}</div>
              <div className="font-medium">
                Outstanding Balance:{" "}
                {formatCurrency(watchedValues.outstanding_balance || 0)}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={repaymentLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={
                  repaymentLoading ||
                  !isValid ||
                  amountPayed <= 0 ||
                  amountError !== null
                }
                className="gap-2 w-full sm:w-auto"
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ProcessRepayment;
