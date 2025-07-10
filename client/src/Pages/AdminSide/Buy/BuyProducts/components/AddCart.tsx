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
const cartSchema = z.object({
  supplier_name: z.string().min(1, "Supplier name is required"),
  product_category_id: z.string().min(1, "Product category is required"),
  product_type_id: z.string().min(1, "Product type is required"),
  quantity: z.string().min(1, "Quantity is required"),
  price_per_quantity: z.string().min(1, "Price per quantity is required"),
  payment_method: z.enum(["CREDIT", "CASH", "BANK"], {
    required_error: "Payment method is required",
  }),
});

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

function AddCart() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);

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
    },
  });

  const selectedCategory = watch("product_category_id");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await api.get("/admin/get-product-category");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch product types
  const fetchProductTypes = async () => {
    try {
      setIsLoadingProductTypes(true);
      const response = await api.get("/admin/get-product-type");
      setProductTypes(response.data);
    } catch (error) {
      console.error("Error fetching product types:", error);
      toast.error("Failed to fetch product types");
    } finally {
      setIsLoadingProductTypes(false);
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
  };

  const onSubmit = async (data: CartFormData) => {
    try {
      setIsSubmitting(true);

      const cartData = {
        supplier_name: data.supplier_name,
        product_type_id: parseInt(data.product_type_id),
        quantity: parseInt(data.quantity),
        price_per_quantity: parseFloat(data.price_per_quantity),
        payment_method: data.payment_method,
        total_money:
          parseInt(data.quantity) * parseFloat(data.price_per_quantity),
        transaction_id: `TXN_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };

      const response = await api.post("/admin/add-cart", cartData);

      toast.success("Item added to cart successfully!");
      reset();
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
  }, []);

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
            />
            {errors.supplier_name && (
              <p className="text-sm text-red-500">
                {errors.supplier_name.message}
              </p>
            )}
          </div>

          {/* Product Category */}
          <div className="space-y-2">
            <Label htmlFor="product_category_id">Product Category *</Label>
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger
                className={errors.product_category_id ? "border-red-500" : ""}
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

          {/* Product Type */}
          <div className="space-y-2">
            <Label htmlFor="product_type_id">Product Type *</Label>
            <Select
              value={watch("product_type_id")}
              onValueChange={handleProductTypeChange}
              disabled={!selectedCategory}
            >
              <SelectTrigger
                className={errors.product_type_id ? "border-red-500" : ""}
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

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method *</Label>
            <Select
              value={watch("payment_method")}
              onValueChange={handlePaymentMethodChange}
            >
              <SelectTrigger
                className={errors.payment_method ? "border-red-500" : ""}
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
