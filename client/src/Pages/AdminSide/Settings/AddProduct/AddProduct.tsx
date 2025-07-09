import React, { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Package, Tag, Warehouse } from "lucide-react";

interface ProductCategory {
  id: string;
  name: string;
  description: string;
}

interface ProductType {
  id: string;
  name: string;
  categoryId: string;
  measurement: string;
}

interface Stock {
  id: string;
  productTypeId: string;
  pricePerQuantity: number;
  quantity: number;
  totalMoney: number;
}

function AddProduct() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

  // Form states for Category
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  // Form states for Product Type
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productTypeName, setProductTypeName] = useState("");
  const [productTypeMeasurement, setProductTypeMeasurement] = useState("");

  // Form states for Stock
  const [selectedProductType, setSelectedProductType] = useState("");
  const [stockPricePerQuantity, setStockPricePerQuantity] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockTotalMoney, setStockTotalMoney] = useState("");

  const handleCreateCategory = () => {
    if (categoryName.trim() && categoryDescription.trim()) {
      const newCategory: ProductCategory = {
        id: Date.now().toString(),
        name: categoryName,
        description: categoryDescription,
      };
      setCategories([...categories, newCategory]);
      setCategoryName("");
      setCategoryDescription("");
    }
  };

  const handleCreateProductType = () => {
    if (selectedCategory && productTypeName.trim() && productTypeMeasurement) {
      const newProductType: ProductType = {
        id: Date.now().toString(),
        name: productTypeName,
        categoryId: selectedCategory,
        measurement: productTypeMeasurement,
      };
      setProductTypes([...productTypes, newProductType]);
      setSelectedCategory("");
      setProductTypeName("");
      setProductTypeMeasurement("");
    }
  };

  const handleInitializeStock = () => {
    if (selectedProductType && stockPricePerQuantity && stockQuantity) {
      const pricePerQty = parseFloat(stockPricePerQuantity);
      const qty = parseInt(stockQuantity);
      const total = pricePerQty * qty;

      const newStock: Stock = {
        id: Date.now().toString(),
        productTypeId: selectedProductType,
        pricePerQuantity: pricePerQty,
        quantity: qty,
        totalMoney: total,
      };
      setStocks([...stocks, newStock]);
      setSelectedProductType("");
      setStockPricePerQuantity("");
      setStockQuantity("");
      setStockTotalMoney("");
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || "Unknown";
  };

  const getProductTypeName = (productTypeId: string) => {
    return (
      productTypes.find((type) => type.id === productTypeId)?.name || "Unknown"
    );
  };

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
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                placeholder="Enter category description"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateCategory} className="w-full mt-12">
              Create Category
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
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productTypeName">Product Type Name</Label>
              <Input
                id="productTypeName"
                placeholder="Enter product type name"
                value={productTypeName}
                onChange={(e) => setProductTypeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productTypeMeasurement">Measurement</Label>
              <Input
                id="productTypeMeasurement"
                placeholder="kg, pcs, etc."
                value={productTypeMeasurement}
                onChange={(e) => setProductTypeMeasurement(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateProductType} className="w-full">
              Create Product Type
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
                value={selectedProductType}
                onValueChange={setSelectedProductType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product type" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} - {getCategoryName(type.categoryId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="stockPricePerQuantity">
                  Price per Quantity
                </Label>
                <Input
                  id="stockPricePerQuantity"
                  type="number"
                  placeholder="0.00"
                  value={stockPricePerQuantity}
                  onChange={(e) => setStockPricePerQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockTotalMoney">Total Money</Label>
              <Input
                id="stockTotalMoney"
                type="number"
                placeholder="0.00"
                value={stockTotalMoney}
                onChange={(e) => setStockTotalMoney(e.target.value)}
                disabled
              />
            </div>
            <Button onClick={handleInitializeStock} className="w-full">
              Initialize Stock
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
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Types List */}
        <Card>
          <CardHeader>
            <CardTitle>Product Types ({productTypes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {productTypes.map((type) => (
                <div key={type.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{type.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Category: {getCategoryName(type.categoryId)} | Unit:{" "}
                    {type.measurement}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stocks List */}
        <Card>
          <CardHeader>
            <CardTitle>Stocks ({stocks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stocks.map((stock) => (
                <div key={stock.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">
                    {getProductTypeName(stock.productTypeId)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Price/Qty: ${stock.pricePerQuantity} | Qty: {stock.quantity}{" "}
                    | Total: ${stock.totalMoney}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AddProduct;
