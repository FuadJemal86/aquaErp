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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api";
import { Loader2, Package, Tag, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Zod schemas for validation
const ProductCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

const ProductTypeSchema = z.object({
  name: z.string().min(1, "Product type name is required"),
  product_category_id: z.number().min(1, "Category is required"),
  measurement: z.string().min(1, "Measurement is required"),
});

const InitializeStockSchema = z.object({
  product_type_id: z.number().min(1, "Product type is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price_per_quantity: z.number().min(0.01, "Price must be greater than 0"),
});

// TypeScript types inferred from Zod schemas
type ProductCategory = z.infer<typeof ProductCategorySchema> & {
  id: number;
};

type ProductType = z.infer<typeof ProductTypeSchema> & {
  id: number;
  Product_category: ProductCategory;
};

type Stock = z.infer<typeof InitializeStockSchema> & {
  id: number;
  amount_money: number;
  price_per_quantity: number;
  Product_type: ProductType;
};

// Form data types
type CategoryFormData = {
  name: string;
  description: string;
};

type ProductTypeFormData = {
  name: string;
  product_category_id: string;
  measurement: string;
};

type StockFormData = {
  product_type_id: string;
  price_per_quantity: string;
  quantity: string;
};

// Error types
type FormErrors = {
  [key: string]: string;
};

function AddProduct() {
  // State for data from API
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

  // Loading states
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingProductType, setIsCreatingProductType] = useState(false);
  const [isCreatingStock, setIsCreatingStock] = useState(false);

  // Form data states
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
  });

  const [productTypeFormData, setProductTypeFormData] =
    useState<ProductTypeFormData>({
      name: "",
      product_category_id: "",
      measurement: "",
    });

  const [stockFormData, setStockFormData] = useState<StockFormData>({
    product_type_id: "",
    price_per_quantity: "",
    quantity: "",
  });

  // Error states
  const [categoryErrors, setCategoryErrors] = useState<FormErrors>({});
  const [productTypeErrors, setProductTypeErrors] = useState<FormErrors>({});
  const [stockErrors, setStockErrors] = useState<FormErrors>({});

  // Fetch data functions
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

  const fetchStocks = async () => {
    try {
      setIsLoadingStocks(true);
      const response = await api.get("/admin/get-product-stock");
      setStocks(response.data);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      toast.error("Failed to fetch stocks");
    } finally {
      setIsLoadingStocks(false);
    }
  };

  // Form handlers
  const handleCategoryFormChange = (
    field: keyof CategoryFormData,
    value: string
  ) => {
    setCategoryFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (categoryErrors[field]) {
      setCategoryErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleProductTypeFormChange = (
    field: keyof ProductTypeFormData,
    value: string
  ) => {
    setProductTypeFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (productTypeErrors[field]) {
      setProductTypeErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleStockFormChange = (field: keyof StockFormData, value: string) => {
    setStockFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (stockErrors[field]) {
      setStockErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Reset form functions
  const resetCategoryForm = () => {
    setCategoryFormData({ name: "", description: "" });
    setCategoryErrors({});
  };

  const resetProductTypeForm = () => {
    setProductTypeFormData({
      name: "",
      product_category_id: "",
      measurement: "",
    });
    setProductTypeErrors({});
  };

  const resetStockForm = () => {
    setStockFormData({
      product_type_id: "",
      price_per_quantity: "",
      quantity: "",
    });
    setStockErrors({});
  };

  // Create category
  const handleCreateCategory = async () => {
    try {
      setCategoryErrors({});

      // Validate with Zod
      const validatedData = ProductCategorySchema.parse(categoryFormData);

      setIsCreatingCategory(true);
      const response = await api.post(
        "/admin/add-product-category",
        validatedData
      );

      toast.success("Category created successfully");
      resetCategoryForm();

      // Refresh categories
      await fetchCategories();
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.errors) {
        // Zod validation errors
        const errors: FormErrors = {};
        error.errors.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
        setCategoryErrors(errors);
      } else {
        toast.error("Failed to create category");
      }
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Create product type
  const handleCreateProductType = async () => {
    try {
      setProductTypeErrors({});

      // Validate with Zod
      const validatedData = ProductTypeSchema.parse({
        ...productTypeFormData,
        product_category_id: parseInt(productTypeFormData.product_category_id),
      });

      setIsCreatingProductType(true);
      const response = await api.post("/admin/add-product-type", validatedData);

      toast.success("Product type created successfully");
      resetProductTypeForm();

      // Refresh product types
      await fetchProductTypes();
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.errors) {
        // Zod validation errors
        const errors: FormErrors = {};
        error.errors.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
        setProductTypeErrors(errors);
      } else {
        toast.error("Failed to create product type");
      }
    } finally {
      setIsCreatingProductType(false);
    }
  };

  // Initialize stock
  const handleInitializeStock = async () => {
    try {
      setStockErrors({});

      // Validate with Zod
      const validatedData = InitializeStockSchema.parse({
        product_type_id: parseInt(stockFormData.product_type_id),
        quantity: parseInt(stockFormData.quantity),
        price_per_quantity: parseFloat(stockFormData.price_per_quantity),
      });

      setIsCreatingStock(true);
      const response = await api.post("/admin/initialize-stock", validatedData);

      toast.success("Stock initialized successfully");
      resetStockForm();

      // Refresh stocks
      await fetchStocks();
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.errors) {
        // Zod validation errors
        const errors: FormErrors = {};
        error.errors.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
        setStockErrors(errors);
      } else {
        toast.error("Failed to initialize stock");
      }
    } finally {
      setIsCreatingStock(false);
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((cat) => cat.id === categoryId)?.name || "Unknown";
  };

  const getProductTypeName = (productTypeId: number) => {
    return (
      productTypes.find((type) => type.id === productTypeId)?.name || "Unknown"
    );
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchProductTypes();
    fetchStocks();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Product Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Product Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Create Product Category
            </CardTitle>
            <CardDescription>
              Add a new product category with name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="Enter category name"
                value={categoryFormData.name}
                onChange={(e) =>
                  handleCategoryFormChange("name", e.target.value)
                }
                className={categoryErrors.name ? "border-destructive" : ""}
              />
              {categoryErrors.name && (
                <p className="text-sm text-destructive">
                  {categoryErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                placeholder="Enter category description"
                value={categoryFormData.description}
                onChange={(e) =>
                  handleCategoryFormChange("description", e.target.value)
                }
                className={
                  categoryErrors.description ? "border-destructive" : ""
                }
              />
              {categoryErrors.description && (
                <p className="text-sm text-destructive">
                  {categoryErrors.description}
                </p>
              )}
            </div>
            <Button
              onClick={handleCreateCategory}
              className="w-full mt-12"
              disabled={isCreatingCategory}
            >
              {isCreatingCategory ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Create Product Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Create Product Type
            </CardTitle>
            <CardDescription>
              Create a new product type within a category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categorySelect">Select Category</Label>
              <Select
                value={productTypeFormData.product_category_id}
                onValueChange={(value) =>
                  handleProductTypeFormChange("product_category_id", value)
                }
              >
                <SelectTrigger
                  className={
                    productTypeErrors.product_category_id
                      ? "border-destructive"
                      : ""
                  }
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {productTypeErrors.product_category_id && (
                <p className="text-sm text-destructive">
                  {productTypeErrors.product_category_id}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="productTypeName">Product Type Name</Label>
              <Input
                id="productTypeName"
                placeholder="Enter product type name"
                value={productTypeFormData.name}
                onChange={(e) =>
                  handleProductTypeFormChange("name", e.target.value)
                }
                className={productTypeErrors.name ? "border-destructive" : ""}
              />
              {productTypeErrors.name && (
                <p className="text-sm text-destructive">
                  {productTypeErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="productTypeMeasurement">Measurement</Label>
              <Input
                id="productTypeMeasurement"
                placeholder="kg, pcs, etc."
                value={productTypeFormData.measurement}
                onChange={(e) =>
                  handleProductTypeFormChange("measurement", e.target.value)
                }
                className={
                  productTypeErrors.measurement ? "border-destructive" : ""
                }
              />
              {productTypeErrors.measurement && (
                <p className="text-sm text-destructive">
                  {productTypeErrors.measurement}
                </p>
              )}
            </div>
            <Button
              onClick={handleCreateProductType}
              className="w-full"
              disabled={isCreatingProductType}
            >
              {isCreatingProductType ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Product Type"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Initialize Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Initialize Stock
            </CardTitle>
            <CardDescription>
              Add stock for a specific product type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productTypeSelect">Select Product Type</Label>
              <Select
                value={stockFormData.product_type_id}
                onValueChange={(value) =>
                  handleStockFormChange("product_type_id", value)
                }
              >
                <SelectTrigger
                  className={
                    stockErrors.product_type_id ? "border-destructive" : ""
                  }
                >
                  <SelectValue placeholder="Choose a product type" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name} - {type.Product_category?.name || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stockErrors.product_type_id && (
                <p className="text-sm text-destructive">
                  {stockErrors.product_type_id}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="stockPricePerQuantity">
                  Price per Quantity
                </Label>
                <Input
                  id="stockPricePerQuantity"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={stockFormData.price_per_quantity}
                  onChange={(e) =>
                    handleStockFormChange("price_per_quantity", e.target.value)
                  }
                  className={
                    stockErrors.price_per_quantity ? "border-destructive" : ""
                  }
                />
                {stockErrors.price_per_quantity && (
                  <p className="text-sm text-destructive">
                    {stockErrors.price_per_quantity}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  placeholder="0"
                  value={stockFormData.quantity}
                  onChange={(e) =>
                    handleStockFormChange("quantity", e.target.value)
                  }
                  className={stockErrors.quantity ? "border-destructive" : ""}
                />
                {stockErrors.quantity && (
                  <p className="text-sm text-destructive">
                    {stockErrors.quantity}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleInitializeStock}
              className="w-full mt-18"
              disabled={isCreatingStock}
            >
              {isCreatingStock ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Initialize Stock"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Display Created Items */}
      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>Categories ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.description || "No description"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Types List */}
        <Card>
          <CardHeader>
            <CardTitle>Product Types ({productTypes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProductTypes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {productTypes.map((type) => (
                  <div key={type.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{type.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Category: {type.Product_category?.name || "Unknown"} |
                      Unit: {type.measurement}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stocks List */}
        <Card>
          <CardHeader>
            <CardTitle>Stocks ({stocks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStocks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {stocks.map((stock) => (
                  <div key={stock.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">
                      {stock.Product_type?.name || "Unknown"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Price/Qty: ${stock.price_per_quantity} | Qty:{" "}
                      {stock.quantity} | Total: ${stock.amount_money}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AddProduct;
