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
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SingleValue } from "react-select";
import ReactSelect from "react-select";
import { toast } from "sonner";
import { z } from "zod";

// Zod schema for sales cart validation
const salesCartSchema = z
  .object({
    customer_type: z.enum(["WALKER", "REGULAR"], {
      required_error: "Customer type is required",
    }),
    customer_id: z.string().optional(),
    product_category_id: z.string().min(1, "Product category is required"),
    product_type_id: z.string().min(1, "Product type is required"),
    quantity: z.string().min(1, "Quantity is required"),
    price: z.string().min(1, "Price is required"),
    payment_method: z.enum(["CREDIT", "CASH", "BANK"], {
      required_error: "Payment method is required",
    }),
    bank_id: z.string().optional(),
    return_date: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.customer_type === "REGULAR" && data.customer_id) {
        return data.customer_id.length > 0;
      }
      return true;
    },
    {
      message: "Customer selection is required for regular customers",
      path: ["customer_id"],
    }
  )
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
  )
  .refine(
    (data) => {
      if (data.payment_method === "CREDIT") {
        return data.description && data.description.length > 0;
      }
      return true;
    },
    {
      message: "Description is required when payment method is CREDIT",
      path: ["description"],
    }
  )
  .refine(
    (data) => {
      // Only REGULAR customers can use CREDIT payment
      if (data.payment_method === "CREDIT") {
        return data.customer_type === "REGULAR";
      }
      return true;
    },
    {
      message: "Credit payment is only available for regular customers",
      path: ["payment_method"],
    }
  )
  .refine(
    (data) => {
      // Validate quantity against available stock
      const quantity = parseInt(data.quantity);
      const productTypeId = parseInt(data.product_type_id);

      // This will be validated in the component with actual product data
      return true; // We'll handle this validation in the component
    },
    {
      message: "Quantity validation will be handled in component",
      path: ["quantity"],
    }
  );

type SalesCartFormData = z.infer<typeof salesCartSchema>;

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
  available_quantity?: number;
  price_per_quantity?: number;
  total_amount?: number;
};

type BankList = {
  id: number;
  branch: string;
  account_number: string;
  owner: string;
};

type Customer = {
  id: number;
  full_name: string;
  phone: string;
  address: string;
};

function AddCart({
  onAddCart,
  customerType: presetCustomerType,
  selectedCustomerId,
  paymentMethod: presetPaymentMethod,
  description: presetDescription,
  returnDate: presetReturnDate,
  selectedBankId,
}: {
  onAddCart: (cart: any) => void;
  customerType?: string;
  selectedCustomerId?: string;
  paymentMethod?: string;
  description?: string;
  returnDate?: string;
  selectedBankId?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [productTypeOptions, setProductTypeOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [bankList, setBankList] = useState<BankList[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerOptions, setCustomerOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [quantityError, setQuantityError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SalesCartFormData>({
    resolver: zodResolver(salesCartSchema),
    defaultValues: {
      customer_type: "WALKER",
      customer_id: "",
      product_category_id: "",
      product_type_id: "",
      quantity: "",
      price: "",
      payment_method: "CASH",
      bank_id: "",
      return_date: "",
      description: "",
    },
  });

  const selectedCategory = watch("product_category_id");
  const selectedPaymentMethod = watch("payment_method");
  const selectedCustomerType = watch("customer_type");

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await api.get("/admin/get-product-category");
      setCategories(response.data);

      // Create options for react-select
      const options = response.data.map((category: ProductCategory) => ({
        value: category.id,
        label: category.name,
      }));
      setCategoryOptions(options);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch product types
  const fetchProductTypes = async () => {
    setIsLoadingProductTypes(true);
    try {
      const response = await api.get("/admin/get-product-type");
      setProductTypes(response.data);

      // Create options for react-select
      const options = response.data.map((type: ProductType) => ({
        value: type.id,
        label: `${type.name} (${type.measurement})`,
      }));
      setProductTypeOptions(options);
    } catch (error) {
      console.error("Error fetching product types:", error);
      toast.error("Failed to fetch product types");
    } finally {
      setIsLoadingProductTypes(false);
    }
  };

  // Fetch Bank list
  const fetchBankList = async () => {
    try {
      const response = await api.get("/admin/get-bank-list");
      setBankList(response.data);
    } catch (error) {
      console.error("Error fetching bank list:", error);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await api.get("/admin/get-all-customer-for-sale");
      const customersData = response.data?.customers;
      setCustomers(Array.isArray(customersData) ? customersData : []);

      // Create options for react-select
      const options = (Array.isArray(customersData) ? customersData : []).map(
        (customer: Customer) => ({
          value: customer.id,
          label: `${customer.full_name} - ${customer.phone}`,
        })
      );
      setCustomerOptions(options);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setCustomerOptions([]);
    }
  };

  // // Filter product types based on selected category
  // const filteredProductTypes = productTypes.filter(
  //   (type) => type.product_category_id === parseInt(selectedCategory)
  // );

  // Filter product type options based on selected category
  const filteredProductTypeOptions = productTypeOptions.filter((option) => {
    const productType = productTypes.find((type) => type.id === option.value);
    return (
      productType &&
      productType.product_category_id === parseInt(selectedCategory)
    );
  });

  // Get available payment methods based on customer type
  const getAvailablePaymentMethods = () => {
    if (selectedCustomerType === "REGULAR") {
      return [
        { value: "CASH", label: "Cash" },
        { value: "BANK", label: "Bank" },
        { value: "CREDIT", label: "Credit" },
      ];
    } else {
      return [
        { value: "CASH", label: "Cash" },
        { value: "BANK", label: "Bank" },
      ];
    }
  };

  // Handle customer type change
  const handleCustomerTypeChange = (customerType: "WALKER" | "REGULAR") => {
    setValue("customer_type", customerType);
    setValue("customer_id", "");
    // Reset payment method if CREDIT was selected for WALKER
    if (customerType === "WALKER" && selectedPaymentMethod === "CREDIT") {
      setValue("payment_method", "CASH");
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
      // Clear quantity error when product type changes
      setQuantityError("");
    } else {
      setValue("product_type_id", "");
      setQuantityError("");
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
      setValue("description", "");
    }
  };

  // Handle bank selection change
  const handleBankChange = (bankId: string) => {
    setValue("bank_id", bankId);
  };

  // Handle customer selection change
  const handleCustomerChange = (
    selectedOption: SingleValue<{ value: number; label: string }>
  ) => {
    if (selectedOption) {
      setValue("customer_id", selectedOption.value.toString());
    } else {
      setValue("customer_id", "");
    }
  };

  // Function to validate quantity against available stock
  const validateQuantity = (quantity: string, productTypeId: string) => {
    const selectedProduct = productTypes.find(
      (type) => type.id === parseInt(productTypeId)
    );

    if (!selectedProduct) {
      return { isValid: false, message: "Product not found" };
    }

    const requestedQuantity = parseInt(quantity);
    const availableQuantity = selectedProduct.available_quantity || 0;

    if (requestedQuantity > availableQuantity) {
      return {
        isValid: false,
        message: `Out of stock! Available quantity: ${availableQuantity}`,
      };
    }

    if (requestedQuantity <= 0) {
      return { isValid: false, message: "Quantity must be greater than 0" };
    }

    return { isValid: true, message: "" };
  };

  // Function to handle quantity changes and validate in real-time
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = e.target.value;
    const productTypeId = watch("product_type_id");

    if (quantity && productTypeId) {
      const validation = validateQuantity(quantity, productTypeId);
      setQuantityError(validation.isValid ? "" : validation.message);
    } else {
      setQuantityError("");
    }
  };

  const onSubmit = async (data: SalesCartFormData) => {
    setIsSubmitting(true);
    try {
      // Validate quantity against available stock
      const quantityValidation = validateQuantity(
        data.quantity,
        data.product_type_id
      );
      if (!quantityValidation.isValid) {
        toast.error(quantityValidation.message);
        setIsSubmitting(false);
        return;
      }

      const cartData = {
        customer_type: data.customer_type,
        customer_id:
          data.customer_type === "REGULAR" && data.customer_id
            ? parseInt(data.customer_id)
            : null,
        type_id: parseInt(data.product_type_id),
        quantity: parseInt(data.quantity),
        price: parseFloat(data.price),
        payment_method: data.payment_method,
        bank_id:
          data.payment_method === "BANK" ? parseInt(data.bank_id!) : null,
        return_date: data.payment_method === "CREDIT" ? data.return_date : null,
        description: data.payment_method === "CREDIT" ? data.description : null,
        total_money: parseInt(data.quantity) * parseFloat(data.price),
      };

      onAddCart(cartData);
      // When resetting, preserve customer_type, payment_method, and other preset values
      if (
        presetCustomerType ||
        presetPaymentMethod ||
        presetDescription ||
        presetReturnDate ||
        selectedBankId
      ) {
        reset({
          customer_type: (presetCustomerType || data.customer_type) as
            | "WALKER"
            | "REGULAR",
          customer_id: selectedCustomerId || "",
          payment_method: (presetPaymentMethod || data.payment_method) as
            | "CREDIT"
            | "CASH"
            | "BANK",
          product_category_id: "",
          product_type_id: "",
          quantity: "",
          price: "",
          bank_id: selectedBankId || "",
          return_date: presetReturnDate || "",
          description: presetDescription || "",
        });
      } else {
        reset();
      }
      toast.success("Product added to cart successfully!");
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
    fetchCategories();
    fetchProductTypes();
    fetchBankList();
    fetchCustomers();

    // Set preset values if provided
    if (presetCustomerType) {
      setValue("customer_type", presetCustomerType as "WALKER" | "REGULAR");
    }
    if (selectedCustomerId) {
      setValue("customer_id", selectedCustomerId);
    }
    if (presetPaymentMethod) {
      setValue(
        "payment_method",
        presetPaymentMethod as "CREDIT" | "CASH" | "BANK"
      );
    }
    if (presetDescription) {
      setValue("description", presetDescription);
    }
    if (presetReturnDate) {
      setValue("return_date", presetReturnDate);
    }
    if (selectedBankId) {
      setValue("bank_id", selectedBankId);
    }
  }, [
    presetCustomerType,
    selectedCustomerId,
    presetPaymentMethod,
    presetDescription,
    presetReturnDate,
    selectedBankId,
    setValue,
  ]);

  // Effect to validate quantity when product type changes
  useEffect(() => {
    const currentQuantity = watch("quantity");
    const currentProductTypeId = watch("product_type_id");

    if (currentQuantity && currentProductTypeId) {
      const validation = validateQuantity(
        currentQuantity,
        currentProductTypeId
      );
      setQuantityError(validation.isValid ? "" : validation.message);
    }
  }, [watch("product_type_id"), productTypes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Add Sale Item
        </CardTitle>
        <CardDescription>Add products to sale cart</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Customer Type */}
          <div className="space-y-2">
            <Label htmlFor="customer_type">Customer Type *</Label>
            <Select
              value={presetCustomerType || selectedCustomerType}
              onValueChange={handleCustomerTypeChange}
              disabled={!!presetCustomerType}
            >
              <SelectTrigger
                className={errors.customer_type ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Choose customer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WALKER">Walking Customer</SelectItem>
                <SelectItem value="REGULAR">Regular Customer</SelectItem>
              </SelectContent>
            </Select>
            {errors.customer_type && (
              <p className="text-sm text-red-500">
                {errors.customer_type.message}
              </p>
            )}
          </div>

          {/* Customer Selection (only for REGULAR customers) */}
          {selectedCustomerType === "REGULAR" && (
            <div className="space-y-2">
              <Label htmlFor="customer_id">Select Customer *</Label>
              <ReactSelect
                options={customerOptions}
                onChange={handleCustomerChange}
                placeholder="Search and select customer..."
                isDisabled={!!selectedCustomerId}
                value={customerOptions.find(
                  (option) =>
                    option.value.toString() ===
                    (selectedCustomerId || watch("customer_id"))
                )}
                className={errors.customer_id ? "border-red-500" : ""}
                classNamePrefix="react-select"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    borderColor: errors.customer_id
                      ? "#ef4444"
                      : provided.borderColor,
                    "&:hover": {
                      borderColor: errors.customer_id
                        ? "#ef4444"
                        : provided.borderColor,
                    },
                  }),
                }}
              />
              {errors.customer_id && (
                <p className="text-sm text-red-500">
                  {errors.customer_id.message}
                </p>
              )}
            </div>
          )}

          {/* Product Category and Type in one row */}
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="quantity">
                Quantity * (Available:{" "}
                {
                  productTypes.find(
                    (type) => type.id === parseInt(watch("product_type_id"))
                  )?.available_quantity
                }
                )
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                min="1"
                max={
                  productTypes.find(
                    (type) => type.id === parseInt(watch("product_type_id"))
                  )?.available_quantity || 0
                }
                {...register("quantity")}
                onChange={(e) => {
                  register("quantity").onChange(e);
                  handleQuantityChange(e);
                }}
                className={
                  errors.quantity || quantityError ? "border-red-500" : ""
                }
              />
              {(errors.quantity || quantityError) && (
                <p className="text-sm text-red-500">
                  {quantityError || errors.quantity?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Price * (
                {
                  productTypes.find(
                    (type) => type.id === parseInt(watch("product_type_id"))
                  )?.price_per_quantity
                }{" "}
                Birr)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("price")}
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Payment Method and Conditional Fields in one row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={presetPaymentMethod || watch("payment_method")}
                onValueChange={handlePaymentMethodChange}
                disabled={!!presetPaymentMethod}
              >
                <SelectTrigger
                  className={
                    errors.payment_method ? "border-red-500" : " w-full"
                  }
                >
                  <SelectValue placeholder="Choose payment method" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePaymentMethods().map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.payment_method && (
                <p className="text-sm text-red-500">
                  {errors.payment_method.message}
                </p>
              )}
            </div>

            {/* Conditional field based on payment method */}
            {(selectedPaymentMethod === "BANK" ||
              presetPaymentMethod === "BANK") && (
              <div className="space-y-2">
                <Label htmlFor="bank_id">Select Bank *</Label>
                <Select
                  value={selectedBankId || watch("bank_id")}
                  onValueChange={handleBankChange}
                  disabled={!!selectedBankId}
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

            {(selectedPaymentMethod === "CREDIT" ||
              presetPaymentMethod === "CREDIT") && (
              <div className="space-y-2">
                <Label htmlFor="return_date">Return Date *</Label>
                <Input
                  id="return_date"
                  type="date"
                  {...register("return_date")}
                  className={errors.return_date ? "border-red-500" : ""}
                  min={new Date().toISOString().split("T")[0]} // Set minimum date to today
                  disabled={!!presetReturnDate}
                  value={presetReturnDate || undefined}
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
          {(selectedPaymentMethod === "CREDIT" ||
            presetPaymentMethod === "CREDIT") && (
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Enter description for credit payment"
                {...register("description")}
                className={errors.description ? "border-red-500" : ""}
                disabled={!!presetDescription}
                value={presetDescription || undefined}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          )}

          {/* Total Calculation */}
          {watch("quantity") && watch("price") && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium">
                Total:{" "}
                {(
                  parseFloat(watch("quantity") || "0") *
                  parseFloat(watch("price") || "0")
                ).toFixed(2)}{" "}
                Birr
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
