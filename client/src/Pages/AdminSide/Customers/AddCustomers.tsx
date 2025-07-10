import React, { useState } from "react";
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
  Plus,
  UserPlus,
  MapPin,
  Phone,
  Upload,
  FileText,
  X,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { toast } from "sonner";

// Zod schema for customer validation
const customerSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  id_card: z.any().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

function AddCustomers() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      address: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("id_card", file);

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
    setValue("id_card", undefined);
    const fileInput = document.getElementById("id_card") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("full_name", data.full_name);
      formData.append("phone", data.phone);
      formData.append("address", data.address);

      if (selectedFile) {
        formData.append("id_card", selectedFile);
      }

      const response = await api.post("/admin/add-customer", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Customer added successfully!");
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);

      // Clear file input
      const fileInput = document.getElementById("id_card") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error: any) {
      console.error("Error adding customer:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to add customer";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Add New Customer</h1>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Add a new customer with their complete information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    placeholder="Enter customer name"
                    {...register("full_name")}
                    className={errors.full_name ? "border-red-500" : ""}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-500">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      {...register("phone")}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    placeholder="Enter customer address"
                    {...register("address")}
                    rows={3}
                    className={errors.address ? "border-red-500" : ""}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_card">ID Card (Optional)</Label>

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
                      id="id_card"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="id_card"
                      className="block w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Click to upload ID Card
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            JPG, PNG, PDF (max 5MB)
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                )}

                {errors.id_card && (
                  <p className="text-sm text-red-500">
                    {errors.id_card.message?.toString()}
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
                    Adding Customer...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
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

export default AddCustomers;
