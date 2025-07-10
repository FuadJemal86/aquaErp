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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ShoppingCart, Package, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Zod schema for cart validation
const cartSchema = z
  .object({
    supplier_name: z.string().min(1, "Supplier name is required"),
    product_category_id: z.string().min(1, "Product category is required"),
    product_type_id: z.string().min(1, "Product type is required"),
    quantity: z.string().min(1, "Quantity is required"),
    price_per_quantity: z.string().min(1, "Price per quantity is required"),
    payment_method: z.enum(["CREDIT", "CASH", "BANK"], {
      required_error: "Payment method is required",
    }),
    bank_id: z.string().optional(),
    return_date: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.payment_method === "BANK") {
        return data.bank_id && data.bank_id.length > 0;
      }
      return true;
    },
    {
      message: "Bank selection is required when payment method is BANK",
      path: ["bank_id"],
    }
  )
  .refine(
    (data) => {
      if (data.payment_method === "CREDIT") {
        return data.return_date && data.return_date.length > 0;
      }
      return true;
    },
    {
      message: "Return date is required when payment method is CREDIT",
      path: ["return_date"],
    }
  );

type CartFormData = z.infer<typeof cartSchema>;

// TypeScript types
type ProductCategory = {
  id: number;
  name: string;
  description?: string;
};

type ProductType = {
  id: number;
  name: string;
  measurement: string;
  product_category_id: number;
  Product_category: ProductCategory;
};

type BankList = {
  id: number;
  branch: string;
  account_number: string;
  owner: string;
};

function AddCart({
  onAddCart,
  supplierName,
  paymentMethod,
  categories,
  productTypes,
}: {
  onAddCart: (cart: any) => void;
  supplierName: string;
  paymentMethod: string;
  categories: any[];
  productTypes: any[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [bankList, setBankList] = useState<BankList[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CartFormData>({
    resolver: zodResolver(cartSchema),
    defaultValues: {
      supplier_name: "",
      product_category_id: "",
      product_type_id: "",
      quantity: "",
      price_per_quantity: "",
      payment_method: "CASH",
      bank_id: "",
      return_date: "",
    },
  });

  const selectedCategory = watch("product_category_id");
  const selectedPaymentMethod = watch("payment_method");

  // Remove fetching categories and productTypes, use props instead

  // fetch Bank list
  const fetchBankList = async () => {
    try {
      const response = await api.get("/admin/get-bank-list");
      setBankList(response.data);
    } catch (error) {
      console.error("Error fetching bank list:", error);
    }
  };

  // Filter product types based on selected category
  const filteredProductTypes = productTypes.filter(
    (type) => type.product_category_id === parseInt(selectedCategory)
  );

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setValue("product_category_id", categoryId);
    setValue("product_type_id", ""); // Reset product type when category changes
  };

  // Handle product type change
  const handleProductTypeChange = (productTypeId: string) => {
    setValue("product_type_id", productTypeId);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method: "CREDIT" | "CASH" | "BANK") => {
    setValue("payment_method", method);
    if (method !== "BANK") {
      setValue("bank_id", "");
    }
    if (method !== "CREDIT") {
      setValue("return_date", "");
    }
  };

  // Handle bank selection change
  const handleBankChange = (bankId: string) => {
    setValue("bank_id", bankId);
  };

  const onSubmit = async (data: CartFormData) => {
    setIsSubmitting(true);
    try {
      const cartData = {
        supplier_name: data.supplier_name,
        product_type_id: parseInt(data.product_type_id),
        quantity: parseInt(data.quantity),
        price_per_quantity: parseFloat(data.price_per_quantity),
        payment_method: data.payment_method,
        bank_id:
          data.payment_method === "BANK" ? parseInt(data.bank_id!) : null,
        return_date: data.payment_method === "CREDIT" ? data.return_date : null,
        total_money:
          parseInt(data.quantity) * parseFloat(data.price_per_quantity),
      };
      onAddCart(cartData);
      // When resetting, preserve supplier_name and payment_method if set
      if (supplierName || paymentMethod) {
        reset({
          supplier_name: supplierName || "",
          payment_method:
            (paymentMethod as "CREDIT" | "CASH" | "BANK") || "CASH",
          product_category_id: "",
          product_type_id: "",
          quantity: "",
          price_per_quantity: "",
          bank_id: "",
          return_date: "",
        });
      } else {
        reset();
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to add to cart";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchBankList();
    if (supplierName) {
      setValue("supplier_name", supplierName);
    }
    if (paymentMethod) {
      setValue("payment_method", paymentMethod as "CREDIT" | "CASH" | "BANK");
    }
  }, [supplierName, paymentMethod, setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Add to Cart
        </CardTitle>
        <CardDescription>
          Add products to your cart for purchase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Supplier Name */}
          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier Name *</Label>
            <Input
              id="supplier_name"
              placeholder="Enter supplier name"
              {...register("supplier_name")}
              className={errors.supplier_name ? "border-red-500" : ""}
              value={supplierName ? supplierName : undefined}
              disabled={!!supplierName}
            />
            {errors.supplier_name && (
              <p className="text-sm text-red-500">
                {errors.supplier_name.message}
              </p>
            )}
          </div>

          {/* Product Category and Type in one row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_category_id">Product Category *</Label>
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger
                  className={
                    errors.product_category_id ? "border-red-500" : " w-full"
                  }
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.product_category_id && (
                <p className="text-sm text-red-500">
                  {errors.product_category_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_type_id">Product Type *</Label>
              <Select
                value={watch("product_type_id")}
                onValueChange={handleProductTypeChange}
                disabled={!selectedCategory}
              >
                <SelectTrigger
                  className={
                    errors.product_type_id ? "border-red-500" : " w-full"
                  }
                >
                  <SelectValue placeholder="Choose a product type" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProductTypes ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    filteredProductTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} ({type.measurement})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.product_type_id && (
                <p className="text-sm text-red-500">
                  {errors.product_type_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                {...register("quantity")}
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_per_quantity">Price per Quantity *</Label>
              <Input
                id="price_per_quantity"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("price_per_quantity")}
                className={errors.price_per_quantity ? "border-red-500" : ""}
              />
              {errors.price_per_quantity && (
                <p className="text-sm text-red-500">
                  {errors.price_per_quantity.message}
                </p>
              )}
            </div>
          </div>

          {/* Payment Method and Conditional Fields in one row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={paymentMethod ? paymentMethod : watch("payment_method")}
                onValueChange={handlePaymentMethodChange}
                disabled={!!paymentMethod}
              >
                <SelectTrigger
                  className={
                    errors.payment_method ? "border-red-500" : " w-full"
                  }
                >
                  <SelectValue placeholder="Choose payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                  <SelectItem value="BANK">Bank</SelectItem>
                </SelectContent>
              </Select>
              {errors.payment_method && (
                <p className="text-sm text-red-500">
                  {errors.payment_method.message}
                </p>
              )}
            </div>

            {/* Conditional field based on payment method */}
            {selectedPaymentMethod === "BANK" && (
              <div className="space-y-2">
                <Label htmlFor="bank_id">Select Bank *</Label>
                <Select
                  value={watch("bank_id")}
                  onValueChange={handleBankChange}
                >
                  <SelectTrigger
                    className={errors.bank_id ? "border-red-500" : " w-full"}
                  >
                    <SelectValue placeholder="Choose a bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankList.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id.toString()}>
                        {bank.branch} - {bank.account_number} ({bank.owner})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bank_id && (
                  <p className="text-sm text-red-500">
                    {errors.bank_id.message}
                  </p>
                )}
              </div>
            )}

            {selectedPaymentMethod === "CREDIT" && (
              <div className="space-y-2">
                <Label htmlFor="return_date">Return Date *</Label>
                <Input
                  id="return_date"
                  type="date"
                  {...register("return_date")}
                  className={errors.return_date ? "border-red-500" : ""}
                  min={new Date().toISOString().split("T")[0]} // Set minimum date to today
                />
                {errors.return_date && (
                  <p className="text-sm text-red-500">
                    {errors.return_date.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Total Calculation */}
          {watch("quantity") && watch("price_per_quantity") && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium">
                Total: $
                {(
                  parseFloat(watch("quantity") || "0") *
                  parseFloat(watch("price_per_quantity") || "0")
                ).toFixed(2)}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding to Cart...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default AddCart;
