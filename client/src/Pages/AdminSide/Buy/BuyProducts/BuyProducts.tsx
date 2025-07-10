import React, { useState, useEffect } from "react";
import AddCart from "./components/AddCart";
import CartList from "./components/CartList";
import { ShoppingCart } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

function BuyProducts() {
  const [cartList, setCartList] = useState<any[]>([]);
  const [supplierName, setSupplierName] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [bankList, setBankList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories and product types once
    const fetchCategories = async () => {
      const res = await api.get("/admin/get-product-category");
      setCategories(res.data);
    };
    const fetchProductTypes = async () => {
      const res = await api.get("/admin/get-product-type");
      setProductTypes(res.data);
    };
    const fetchBankList = async () => {
      const res = await api.get("/admin/get-bank-list");
      setBankList(res.data);
    };
    fetchCategories();
    fetchProductTypes();
    fetchBankList();
  }, []);

  // Add a new cart to the list
  const handleAddCart = (cart: any) => {
    if (!supplierName) setSupplierName(cart.supplier_name);
    if (!paymentMethod) setPaymentMethod(cart.payment_method);
    if (!description && cart.payment_method === "CREDIT")
      setDescription(cart.description);
    setCartList((prev) => [
      ...prev,
      { ...cart, id: Date.now() + Math.random() },
    ]);
    setTotalAmount(
      cartList.reduce((acc, curr) => acc + curr.total_money, 0) +
        cart.total_money
    );
  };

  // Handle buy action (for now, just remove from list)
  const handleBuyCart = (id: any) => {
    setCartList((prev) => prev.filter((cart) => cart.id !== id));
  };

  // Handle buy all action
  const handleBuyAll = async () => {
    const cartListData = cartList.map((cart) => ({
      product_type_id: cart.product_type_id,
      quantity: cart.quantity,
      price_per_quantity: cart.price_per_quantity,
    }));
    const sendData = {
      supplier_name: supplierName,
      payment_method: paymentMethod,
      bank_id: bankList.find((bank) => bank.id === cartList[0].bank_id)?.id,
      return_date: cartList[0].return_date.split("T")[0],
      cart_list: cartListData,
    };
    console.log(sendData);
    const res = await api.post("/admin/buy-product", sendData);
    if (res.status === 200) {
      toast.success("Buy product successfully");
      setCartList([]);
    } else {
      toast.error(res.data.message);
    }
  };

  return (
    <div className="container mx-auto p-1">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Buy Products</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AddCart
            onAddCart={handleAddCart}
            supplierName={supplierName}
            paymentMethod={paymentMethod}
            categories={categories}
            productTypes={productTypes}
            description={description}
          />
        </div>
        <div className="space-y-6">
          <CartList
            cartList={cartList}
            onBuyCart={handleBuyCart}
            categories={categories}
            productTypes={productTypes}
            onBuyAll={handleBuyAll}
            supplierName={supplierName}
            paymentMethod={paymentMethod}
            totalAmount={totalAmount}
            bankList={bankList}
          />
        </div>
      </div>
    </div>
  );
}

export default BuyProducts;
