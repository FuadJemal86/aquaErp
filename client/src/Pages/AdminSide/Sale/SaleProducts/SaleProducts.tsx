import api from "@/services/api";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AddCart from "./components/AddCart";
import CartList from "./components/CartList";

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
    try {
      // Update customer type if not already set
      if (!customerType) {
        setCustomerType(cart.customer_type);
      }

      // Update payment method if not already set
      if (!paymentMethod) {
        setPaymentMethod(cart.payment_method);
      }

      // Update selected customer if not already set and customer_id exists
      if (!selectedCustomer && cart.customer_id) {
        // Safely find customer with null checks
        const customer = Array.isArray(customers)
          ? customers.find((c) => c?.id === cart.customer_id)
          : null;

        if (customer) {
          setSelectedCustomer(customer);
        }
      }

      // Add to cart list with a unique ID
      setCartList((prev) => [
        ...prev,
        {
          ...cart,
          id: Date.now() + Math.random().toString(36).substring(2, 9),
        },
      ]);

      // Update total amount
      if (typeof cart.total_money === "number") {
        setTotalAmount((prev) => prev + cart.total_money);
      }
    } catch (error) {
      console.error("Error in handleAddCart:", error);
      // Optionally show error to user
      toast.error("Failed to add item to cart");
    }
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
  // const handleSellAll = async () => {
  //   const cartListData = cartList.map((cart) => ({
  //     type_id: cart.type_id,
  //     quantity: cart.quantity,
  //     price: cart.price,
  //   }));

  //   const sendData = {
  //     customer_type: customerType,
  //     customer_id: selectedCustomer?.id || null,
  //     payment_method: paymentMethod,
  //     bank_id: cartList.find((cart) => cart.bank_id)?.bank_id || null,
  //     return_date:
  //       cartList.find((cart) => cart.return_date)?.return_date || null,
  //     description:
  //       cartList.find((cart) => cart.description)?.description || null,
  //     cart_list: cartListData,
  //   };

  //   console.log(sendData);

  //   try {
  //     const res = await api.post("/admin/sell-product", sendData);
  //     if (res.status === 200) {
  //       toast.success("Sale completed successfully");
  //       setCartList([]);
  //       setTotalAmount(0);
  //       setCustomerType("");
  //       setPaymentMethod("");
  //       setSelectedCustomer(null);
  //     } else {
  //       toast.error(res.data.message);
  //     }
  //   } catch (error: any) {
  //     console.error("Error completing sale:", error);
  //     const errorMessage =
  //       error.response?.data?.error || "Failed to complete sale";
  //     toast.error(errorMessage);
  //   }
  // };

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
            customerType={customerType}
            paymentMethod={paymentMethod}
            selectedCustomer={selectedCustomer}
            totalAmount={totalAmount}
            bankList={bankList}
          />
        </div>
      </div>
    </div>
  );
}

export default SaleProducts;
