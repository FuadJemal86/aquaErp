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
import { List, RefreshCw } from "lucide-react";
import ConfirmPaymentModal from "./ConfirmPaymentModal";

function CartList({
  cartList,
  onBuyCart,
  categories,
  productTypes,
  onBuyAll,
  supplierName,
  paymentMethod,
  totalAmount,
  bankList,
}: {
  cartList: any[];
  onBuyCart: (id: any) => void;
  categories: any[];
  productTypes: any[];
  onBuyAll: () => void;
  supplierName: string;
  paymentMethod: string;
  totalAmount: number;
  bankList: any[];
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  if (!cartList.length) return <div>No items in cart.</div>;

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

  return (
    <>
      <Card className="h-[470px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Cart List
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
          <CardDescription>List of products in your cart</CardDescription>
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
                    Price per Quantity
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
                      {getCategoryName(cart.product_type_id)}
                    </TableCell>
                    <TableCell className="p-2 border-b">
                      {getTypeName(cart.product_type_id)}
                    </TableCell>
                    <TableCell className="p-2 border-b text-center">
                      {cart.quantity}
                    </TableCell>
                    <TableCell className="p-2 border-b text-center">
                      {cart.price_per_quantity}
                    </TableCell>
                    <TableCell className="p-2 border-b text-center">
                      {cart.total_money}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button
            className="mt-6 w-full"
            onClick={() => setShowConfirmModal(true)}
          >
            Buy Product
          </Button>
        </CardContent>
      </Card>
      <ConfirmPaymentModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          onBuyAll();
          setShowConfirmModal(false);
        }}
        cartList={cartList}
        supplierName={supplierName}
        paymentMethod={paymentMethod}
        categories={categories}
        productTypes={productTypes}
        totalAmount={totalAmount}
        bankList={bankList}
      />
    </>
  );
}

export default CartList;
