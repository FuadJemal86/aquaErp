import React from "react";
import AddCart from "./components/AddCart";
import CartList from "./components/CartList";

function BuyProducts() {
  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AddCart />
        </div>
        <div className="space-y-6">
          <CartList />
        </div>
      </div>
    </div>
  );
}

export default BuyProducts;
