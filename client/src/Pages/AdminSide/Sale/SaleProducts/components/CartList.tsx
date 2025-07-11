import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { List, RefreshCw, ShoppingCart, User, Users } from "lucide-react";
import ConfirmSellModal from "./ConfirmSellModal";

function CartList({
  cartList,
  onSellCart,
  categories,
  productTypes,
  onSellAll,
  customerType,
  paymentMethod,
  selectedCustomer,
  totalAmount,
  bankList,
  customers,
}: {
  cartList: any[];
  onSellCart: (id: any) => void;
  categories: any[];
  productTypes: any[];
  onSellAll: () => void;
  customerType: string;
  paymentMethod: string;
  selectedCustomer: any;
  totalAmount: number;
  bankList: any[];
  customers: any[];
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  if (!cartList.length) {
    return (
      <Card className="h-[470px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Sales Cart
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.reload()}
              title="Reload"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
          <CardDescription>List of products in your sales cart</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Your sales cart is empty
            </h3>
            <p className="text-muted-foreground mb-4">
              Add some products to your cart to start selling
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper functions to get names
  const getCategoryName = (typeId: number) => {
    const type = productTypes.find((t) => t.id === typeId);
    if (!type) return "-";
    const cat = categories.find((c) => c.id === type.product_category_id);
    return cat ? cat.name : "-";
  };

  const getTypeName = (typeId: number) => {
    const type = productTypes.find((t) => t.id === typeId);
    return type ? type.name : "-";
  };

  const getCustomerInfo = () => {
    if (customerType === "WALKER") {
      return "Walking Customer";
    } else if (selectedCustomer) {
      return `${selectedCustomer.full_name} (${selectedCustomer.phone})`;
    }
    return "Regular Customer";
  };

  return (
    <Card className="h-[470px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Sales Cart
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.reload()}
            title="Reload"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
        <CardDescription>List of products in your sales cart</CardDescription>

        {/* Customer and Payment Info */}
        {(customerType || paymentMethod) && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
            {customerType && (
              <div className="flex items-center gap-2">
                {customerType === "WALKER" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                <span className="font-medium">Customer:</span>
                <span>{getCustomerInfo()}</span>
              </div>
            )}
            {paymentMethod && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Payment:</span>
                <span className="capitalize">
                  {paymentMethod.toLowerCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Table className="w-full text-sm border-collapse">
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="p-2 border-b text-left">#</TableHead>
                <TableHead className="p-2 border-b text-left">
                  Product Category
                </TableHead>
                <TableHead className="p-2 border-b text-left">
                  Product Type
                </TableHead>
                <TableHead className="p-2 border-b text-center">
                  Quantity
                </TableHead>
                <TableHead className="p-2 border-b text-center">
                  Price
                </TableHead>
                <TableHead className="p-2 border-b text-center">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartList.map((cart, idx) => (
                <TableRow
                  key={cart.id}
                  className={idx % 2 === 0 ? "bg-muted/50" : "bg-background"}
                >
                  <TableCell className="p-2 border-b">{idx + 1}</TableCell>
                  <TableCell className="p-2 border-b">
                    {getCategoryName(cart.type_id)}
                  </TableCell>
                  <TableCell className="p-2 border-b">
                    {getTypeName(cart.type_id)}
                  </TableCell>
                  <TableCell className="p-2 border-b text-center">
                    {cart.quantity}
                  </TableCell>
                  <TableCell className="p-2 border-b text-center">
                    {cart.price}
                  </TableCell>
                  <TableCell className="p-2 border-b text-center">
                    {cart.total_money}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Total Amount Display */}
        {totalAmount > 0 && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-lg font-bold">
                {totalAmount.toFixed(2)} Birr
              </span>
            </div>
          </div>
        )}

        <Button
          className="mt-4 w-full"
          onClick={() => setShowConfirmModal(true)}
        >
          Complete Sale
        </Button>
      </CardContent>
      <ConfirmSellModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          onSellAll();
          setShowConfirmModal(false);
        }}
        cartList={cartList}
        customerType={customerType}
        paymentMethod={paymentMethod}
        selectedCustomer={selectedCustomer}
        categories={categories}
        productTypes={productTypes}
        totalAmount={totalAmount}
        bankList={bankList}
      />
    </Card>
  );
}

export default CartList;
