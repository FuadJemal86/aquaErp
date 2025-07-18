import React, { useState, useEffect } from "react";
import AddCart from "./components/AddCart";
import CartList from "./components/CartList";
import { ShoppingCart } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

function SaleProducts() {
  const [cartList, setCartList] = useState<any[]>([]);
  const [customerType, setCustomerType] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [bankList, setBankList] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories, product types, banks, and customers once
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
    const fetchCustomers = async () => {
      const res = await api.get("/admin/get-all-customer-for-sale");
      setCustomers(res.data.customers);
    };

    fetchCategories();
    fetchProductTypes();
    fetchBankList();
    fetchCustomers();
  }, []);

  // Add a new cart to the list
  const handleAddCart = (cart: any) => {
    if (!customerType) setCustomerType(cart.customer_type);
    if (!paymentMethod) setPaymentMethod(cart.payment_method);
    if (!selectedCustomer && cart.customer_id) {
      const customer = customers.find((c) => c.id === cart.customer_id);
      setSelectedCustomer(customer);
    }

    setCartList((prev) => [
      ...prev,
      { ...cart, id: Date.now() + Math.random() },
    ]);
    setTotalAmount((prev) => prev + cart.total_money);
  };

  // Handle sell action (for now, just remove from list)
  const handleSellCart = (id: any) => {
    const removedCart = cartList.find((cart) => cart.id === id);
    setCartList((prev) => prev.filter((cart) => cart.id !== id));
    if (removedCart) {
      setTotalAmount((prev) => prev - removedCart.total_money);
    }
  };

  // Handle sell all action
  const handleSellAll = async () => {
    const cartListData = cartList.map((cart) => ({
      type_id: cart.type_id,
      quantity: cart.quantity,
      price: cart.price,
    }));

    const sendData = {
      customer_type: customerType,
      customer_id: selectedCustomer?.id || null,
      payment_method: paymentMethod,
      bank_id: cartList.find((cart) => cart.bank_id)?.bank_id || null,
      return_date:
        cartList.find((cart) => cart.return_date)?.return_date || null,
      description:
        cartList.find((cart) => cart.description)?.description || null,
      cart_list: cartListData,
    };

    console.log(sendData);

    try {
      const res = await api.post("/admin/sell-product", sendData);
      if (res.status === 200) {
        toast.success("Sale completed successfully");
        setCartList([]);
        setTotalAmount(0);
        setCustomerType("");
        setPaymentMethod("");
        setSelectedCustomer(null);
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      console.error("Error completing sale:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to complete sale";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-1">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Sale Products</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AddCart
            onAddCart={handleAddCart}
            customerType={customerType}
            selectedCustomerId={selectedCustomer?.id?.toString() || ""}
            paymentMethod={paymentMethod}
            description={
              cartList.find((cart) => cart.description)?.description || ""
            }
            returnDate={
              cartList.find((cart) => cart.return_date)?.return_date || ""
            }
            selectedBankId={
              cartList.find((cart) => cart.bank_id)?.bank_id?.toString() || ""
            }
          />
        </div>
        <div className="space-y-6">
          <CartList
            cartList={cartList}
            onSellCart={handleSellCart}
            categories={categories}
            productTypes={productTypes}
            onSellAll={handleSellAll}
            customerType={customerType}
            paymentMethod={paymentMethod}
            selectedCustomer={selectedCustomer}
            totalAmount={totalAmount}
            bankList={bankList}
            customers={customers}
          />
        </div>
      </div>
    </div>
  );
}

export default SaleProducts;
