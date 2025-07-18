import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  Building2,
  DollarSign,
  File,
  FileText,
  Image as ImageIcon,
  Plus,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Interface for bank account
interface BankBalance {
  balance: number;
}

interface BankAccount {
  id: number;
  branch: string;
  account_number: string;
  owner: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bank_balance: BankBalance[];
}

// Zod schema for withdrawal validation
const withdrawalSchema = z.object({
  bank_id: z.string().min(1, "Please select a bank branch"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a valid positive number",
    }),
  description: z.string().min(1, "Description is required"),
  receipt_image: z.any().optional(),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

function BankWithdraw() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      bank_id: "",
      amount: "",
      description: "",
    },
  });

  // Fetch bank accounts on component mount
  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setIsLoadingBanks(true);
      const response = await api.get("/admin/get-bank-list");
      setBankAccounts(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch bank accounts:", error);
      toast.error(
        error.response?.data?.error || "Failed to fetch bank accounts"
      );
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("receipt_image", file);

      // Create preview URL for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValue("receipt_image", undefined);
    const fileInput = document.getElementById(
      "receipt_image"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data: WithdrawalFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("bank_id", data.bank_id);
      formData.append("amount", data.amount);
      formData.append("description", data.description);

      if (selectedFile) {
        formData.append("receipt_image", selectedFile);
      }

      const response = await api.post("/admin/add-bank-withdrawal", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchBankAccounts();
      toast.success("Withdrawal added successfully!");
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);

      // Clear file input
      const fileInput = document.getElementById(
        "receipt_image"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error: any) {
      console.error("Error adding withdrawal:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to add withdrawal";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBankId = watch("bank_id");
  const selectedBank = bankAccounts.find(
    (bank) => bank.id.toString() === selectedBankId
  );

  // Get available balance for selected bank
  const getAvailableBalance = (bank: BankAccount) => {
    return bank.bank_balance && bank.bank_balance.length > 0
      ? bank.bank_balance[0].balance
      : 0;
  };

  const availableBalance = selectedBank ? getAvailableBalance(selectedBank) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <ArrowUpRight className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Bank Withdrawal</h1>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Withdrawal Information
            </CardTitle>
            <CardDescription>
              Add a new bank withdrawal with receipt and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank_id">Bank Branch *</Label>
                <Select
                  value={selectedBankId}
                  onValueChange={(value) => setValue("bank_id", value)}
                >
                  <SelectTrigger
                    className={errors.bank_id ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select a bank branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingBanks ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Loading banks...
                      </div>
                    ) : bankAccounts.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No banks available
                      </div>
                    ) : (
                      bankAccounts.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{bank.branch}</span>
                            <span className="text-muted-foreground text-xs">
                              ({bank.account_number})
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.bank_id && (
                  <p className="text-sm text-red-500">
                    {errors.bank_id.message}
                  </p>
                )}
                {selectedBank && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Account Holder: {selectedBank.owner}
                    <div className="text-xs text-green-600 mt-1">
                      Current Balance:{" "}
                      {availableBalance.toLocaleString() + " Birr"}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  Withdrawal Amount *
                  {selectedBank && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (Available: ${availableBalance.toLocaleString()})
                    </span>
                  )}
                </Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    max={availableBalance}
                    {...register("amount", {
                      validate: (value) => {
                        const numValue = Number(value);
                        if (numValue > availableBalance) {
                          return `Withdrawal amount cannot exceed available balance ($${availableBalance.toLocaleString()})`;
                        }
                        return true;
                      },
                    })}
                    className={errors.amount ? "border-red-500" : ""}
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-500">
                    {errors.amount.message}
                  </p>
                )}
                {selectedBank && availableBalance === 0 && (
                  <p className="text-sm text-orange-600">
                    ⚠️ No available balance for withdrawal
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter withdrawal description"
                  {...register("description")}
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt_image">Receipt Image (Optional)</Label>

                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          {previewUrl ? (
                            <div className="relative">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={handleRemoveFile}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="relative">
                              {selectedFile.type.startsWith("image/") ? (
                                <ImageIcon className="h-8 w-8 text-blue-500" />
                              ) : selectedFile.type === "application/pdf" ? (
                                <FileText className="h-8 w-8 text-red-500" />
                              ) : (
                                <File className="h-8 w-8 text-gray-500" />
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={handleRemoveFile}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="receipt_image"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="receipt_image"
                      className="block w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Click to upload Receipt
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            JPG, PNG, PDF (max 5MB)
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                )}

                {errors.receipt_image && (
                  <p className="text-sm text-red-500">
                    {errors.receipt_image.message?.toString()}
                  </p>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <p>* Required fields</p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Withdrawal...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Withdrawal
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BankWithdraw;
