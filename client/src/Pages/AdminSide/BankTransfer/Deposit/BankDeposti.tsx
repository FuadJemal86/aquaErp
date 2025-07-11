import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Upload,
  FileText,
  X,
  Image as ImageIcon,
  File,
  DollarSign,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

// Interface for bank account
interface BankAccount {
  id: number;
  branch: string;
  account_number: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

// Zod schema for deposit validation
const depositSchema = z.object({
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

type DepositFormData = z.infer<typeof depositSchema>;

function BankDeposti() {
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
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
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

  const onSubmit = async (data: DepositFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("bank_id", data.bank_id);
      formData.append("amount", data.amount);
      formData.append("description", data.description);

      if (selectedFile) {
        formData.append("receipt_image", selectedFile);
      }

      const response = await api.post("/admin/add-bank-deposit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Deposit added successfully!");
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
      console.error("Error adding deposit:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to add deposit";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBankId = watch("bank_id");
  const selectedBank = bankAccounts.find(
    (bank) => bank.id.toString() === selectedBankId
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Bank Deposit</h1>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Deposit Information
            </CardTitle>
            <CardDescription>
              Add a new bank deposit with receipt and details
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
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Deposit Amount *</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("amount")}
                    className={errors.amount ? "border-red-500" : ""}
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-500">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter deposit description"
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
                    Adding Deposit...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deposit
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

export default BankDeposti;
