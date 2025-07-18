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
import ReactSelect from "react-select";
import type { SingleValue } from "react-select";

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
    description: z.string().optional(),
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
  description,
  categories,
  productTypes,
}: {
  onAddCart: (cart: any) => void;
  supplierName: string;
  paymentMethod: string;
  description: string;
  categories: any[];
  productTypes: any[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [bankList, setBankList] = useState<BankList[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [productTypeOptions, setProductTypeOptions] = useState<
    { value: number; label: string }[]
  >([]);

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
      description: "",
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

  // Filter product type options based on selected category
  const filteredProductTypeOptions = productTypeOptions.filter((option) => {
    const productType = productTypes.find((type) => type.id === option.value);
    return (
      productType &&
      productType.product_category_id === parseInt(selectedCategory)
    );
  });

  // Handle category change
  const handleCategoryChange = (
    selectedOption: SingleValue<{ value: number; label: string }>
  ) => {
    if (selectedOption) {
      setValue("product_category_id", selectedOption.value.toString());
      setValue("product_type_id", ""); // Reset product type when category changes
    } else {
      setValue("product_category_id", "");
      setValue("product_type_id", "");
    }
  };

  // Handle product type change
  const handleProductTypeChange = (
    selectedOption: SingleValue<{ value: number; label: string }>
  ) => {
    if (selectedOption) {
      setValue("product_type_id", selectedOption.value.toString());
    } else {
      setValue("product_type_id", "");
    }
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
        description: data.payment_method === "CREDIT" ? data.description : null,
        total_money:
          parseInt(data.quantity) * parseFloat(data.price_per_quantity),
      };
      onAddCart(cartData);
      // When resetting, preserve supplier_name, payment_method, and description if set
      if (supplierName || paymentMethod || description) {
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
          description: description || "",
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
    if (description) {
      setValue("description", description);
    }
  }, [supplierName, paymentMethod, description, setValue]);

  // Create options for react-select when categories and productTypes change
  useEffect(() => {
    if (categories && categories.length > 0) {
      const options = categories.map((category: any) => ({
        value: category.id,
        label: category.name,
      }));
      setCategoryOptions(options);
    }
  }, [categories]);

  useEffect(() => {
    if (productTypes && productTypes.length > 0) {
      const options = productTypes.map((type: any) => ({
        value: type.id,
        label: `${type.name} (${type.measurement})`,
      }));
      setProductTypeOptions(options);
    }
  }, [productTypes]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_category_id">Product Category *</Label>
              <ReactSelect
                options={categoryOptions}
                onChange={handleCategoryChange}
                placeholder="Search and select category..."
                value={categoryOptions.find(
                  (option) => option.value.toString() === selectedCategory
                )}
                className={errors.product_category_id ? "border-red-500" : ""}
                classNamePrefix="react-select"
                isLoading={isLoadingCategories}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    borderColor: errors.product_category_id
                      ? "#ef4444"
                      : provided.borderColor,
                    "&:hover": {
                      borderColor: errors.product_category_id
                        ? "#ef4444"
                        : provided.borderColor,
                    },
                  }),
                }}
              />
              {errors.product_category_id && (
                <p className="text-sm text-red-500">
                  {errors.product_category_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_type_id">Product Type *</Label>
              <ReactSelect
                options={filteredProductTypeOptions}
                onChange={handleProductTypeChange}
                placeholder="Search and select product type..."
                isDisabled={!selectedCategory}
                value={filteredProductTypeOptions.find(
                  (option) =>
                    option.value.toString() === watch("product_type_id")
                )}
                className={errors.product_type_id ? "border-red-500" : ""}
                classNamePrefix="react-select"
                isLoading={isLoadingProductTypes}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    borderColor: errors.product_type_id
                      ? "#ef4444"
                      : provided.borderColor,
                    "&:hover": {
                      borderColor: errors.product_type_id
                        ? "#ef4444"
                        : provided.borderColor,
                    },
                  }),
                }}
              />
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

          {/* Description field for CREDIT payment */}
          {selectedPaymentMethod === "CREDIT" && (
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Enter description for credit payment"
                {...register("description")}
                className={errors.description ? "border-red-500" : ""}
                value={description ? description : undefined}
                disabled={!!description}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          )}

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
