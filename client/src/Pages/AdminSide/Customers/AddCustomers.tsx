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
  Mail,
  Upload,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

// Zod schema for customer validation
const customerSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  id_card: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png", "application/pdf"].includes(
          file.type
        ),
      "Only JPG, PNG, and PDF files are allowed"
    )
    .optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

function AddCustomers() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      address: "",
    },
  });

  const selectedFile = watch("id_card");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("id_card", file);
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("full_name", data.full_name);
      formData.append("phone", data.phone);
      formData.append("address", data.address);

      if (data.id_card) {
        formData.append("id_card", data.id_card);
      }

      const response = await api.post("/admin/add-customer", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Customer added successfully!");
      reset();

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
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="id_card"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className={errors.id_card ? "border-red-500" : ""}
                  />
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <span>
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
                {errors.id_card && (
                  <p className="text-sm text-red-500">
                    {errors.id_card.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPG, PNG, PDF (max 5MB)
                </p>
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
