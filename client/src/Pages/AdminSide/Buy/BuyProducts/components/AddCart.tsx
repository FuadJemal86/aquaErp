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
import api from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ReactSelect from "react-select";
import type { SingleValue } from "react-select";
import { z } from "zod";

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

type BankList = {
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

type CashBalance = {
  id: number;
  balance: number;
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

  const [bankList, setBankList] = useState<BankList[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [cashBalance, setCashBalance] = useState<CashBalance | null>(null);

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
    setError,
    clearErrors,
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
  const selectedBankId = watch("bank_id");
  const quantity = watch("quantity");
  const pricePerQuantity = watch("price_per_quantity");

  // Calculate total amount
  const totalAmount = parseFloat(quantity || "0") * parseFloat(pricePerQuantity || "0");

  // Get available balance based on payment method
  const getAvailableBalance = () => {
    if (selectedPaymentMethod === "CASH") {
      return cashBalance ? cashBalance.balance : 0;
    } else if (selectedPaymentMethod === "BANK" && selectedBankId) {
      const selectedBank = bankList.find(bank => bank.id.toString() === selectedBankId);
      return selectedBank && selectedBank.bank_balance.length > 0 ? selectedBank.bank_balance[0].balance : 0;
    }
    return 0;
  };

  const availableBalance = getAvailableBalance();

  // Validate balance whenever total amount or payment method changes
  useEffect(() => {
    if (selectedPaymentMethod === "CREDIT") {
      // Credit doesn't require balance validation
      clearErrors("quantity");
      clearErrors("price_per_quantity");
      return;
    }

    if (totalAmount > 0 && availableBalance > 0 && totalAmount > availableBalance) {
      setError("quantity", {
        type: "manual",
        message: `Insufficient balance. Available: $${availableBalance.toFixed(2)}, Required: $${totalAmount.toFixed(2)}`
      });
    } else {
      clearErrors("quantity");
      clearErrors("price_per_quantity");
    }
  }, [totalAmount, availableBalance, selectedPaymentMethod, setError, clearErrors]);

  // fetch Bank list
  const fetchBankList = async () => {
    try {
      const response = await api.get("/admin/get-bank-list");
      setBankList(response.data);
    } catch (error) {
      console.error("Error fetching bank list:", error);
    }
  };

  // Filter product type options based on selected category
  const filteredProductTypeOptions = productTypeOptions.filter((option) => {
    const productType = productTypes.find((type) => type.id === option.value);
    return (
      productType &&
      productType.product_category_id === parseInt(selectedCategory)
    );
  });

  const fetchCashBalance = async () => {
    try {
      const response = await api.get("/admin/get-cash-balance");
      setCashBalance(response.data);
    } catch (error) {
      console.error("Error fetching cash balance:", error);
    }
  };

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
    // Final balance check before submission (for non-credit payments)
    if (data.payment_method !== "CREDIT") {
      const finalTotalAmount = parseInt(data.quantity) * parseFloat(data.price_per_quantity);
      const finalAvailableBalance = data.payment_method === "CASH"
        ? (cashBalance ? cashBalance.balance : 0)
        : (data.payment_method === "BANK" && data.bank_id
          ? (bankList.find(bank => bank.id.toString() === data.bank_id)?.bank_balance[0]?.balance || 0)
          : 0);

      if (finalTotalAmount > finalAvailableBalance) {
        toast.error(`Insufficient balance. Available: $${finalAvailableBalance.toFixed(2)}, Required: $${finalTotalAmount.toFixed(2)}`);
        return;
      }
    }

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
    fetchCashBalance();
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

  // Check if form is valid for submission
  const isFormValid = () => {
    if (selectedPaymentMethod === "CREDIT") {
      return true; // Credit doesn't require balance validation
    }
    return totalAmount <= availableBalance;
  };

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
                styles={{
                  control: (provided) => ({
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
                styles={{
                  control: (provided) => ({
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
                  <SelectItem value="CASH">
                    Cash {cashBalance && `(${cashBalance.balance.toFixed(2)})`}
                  </SelectItem>
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
                        <div className="flex justify-between items-center w-full">
                          <span>{bank.branch} - {bank.account_number} ({bank.owner})</span>
                          <span className="text-sm text-green-600 font-medium ml-4">
                            ${bank.bank_balance.length > 0 ? bank.bank_balance[0].balance.toFixed(2) : '0.00'}
                          </span>
                        </div>
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

          {/* Balance and Total Information */}
          {selectedPaymentMethod !== "CREDIT" && availableBalance > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Available Balance: ${availableBalance.toFixed(2)}
              </p>
            </div>
          )}

          {/* Total Calculation */}
          {quantity && pricePerQuantity && (
            <div className={`p-3 rounded-lg ${selectedPaymentMethod !== "CREDIT" && totalAmount > availableBalance
                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                : "bg-gray-50 dark:bg-gray-800"
              }`}>
              <p className={`text-sm font-medium ${selectedPaymentMethod !== "CREDIT" && totalAmount > availableBalance
                  ? "text-red-800 dark:text-red-200"
                  : ""
                }`}>
                Total: ${totalAmount.toFixed(2)}
                {selectedPaymentMethod !== "CREDIT" && totalAmount > availableBalance && (
                  <span className="block text-xs mt-1">
                    Exceeds available balance by ${(totalAmount - availableBalance).toFixed(2)}
                  </span>
                )}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || (selectedPaymentMethod !== "CREDIT" && !isFormValid())}
          >
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