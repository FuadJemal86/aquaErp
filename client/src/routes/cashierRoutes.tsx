import { lazy } from "react";
import { Route } from "react-router-dom";

const CashierLayout = lazy(
  () => import("../Layouts/CashierSide/CashierLayout")
);
const CashierDashboard = lazy(
  () => import("../Pages/CashierSide/CashierDashboard")
);
const AddCustomers = lazy(
  () => import("../Pages/AdminSide/Customers/AddCustomers")
);
const ListCustomers = lazy(
  () => import("../Pages/AdminSide/Customers/ListCustomers")
);
const BuyProducts = lazy(
  () => import("../Pages/AdminSide/Buy/BuyProducts/BuyProducts")
);
const SaleProducts = lazy(
  () => import("../Pages/AdminSide/Sale/SaleProducts/SaleProducts")
);
const RepaySalesCredit = lazy(
  () => import("../Pages/AdminSide/RepayCredit/Sales/RepaySalesCredit")
);
const RepayBuyCredit = lazy(
  () => import("../Pages/AdminSide/RepayCredit/Buy/RepayBuyCredit")
);

export const cashierRoutes = (
  <Route path="/cashier" element={<CashierLayout></CashierLayout>}>
    <Route index element={<CashierDashboard></CashierDashboard>}></Route>
    <Route
      path="sales-products"
      element={<SaleProducts></SaleProducts>}
    ></Route>
    <Route path="buy-products" element={<BuyProducts></BuyProducts>}></Route>
    <Route
      path="sales-credit-repay"
      element={<RepaySalesCredit></RepaySalesCredit>}
    ></Route>
    <Route
      path="buy-credit-repay"
      element={<RepayBuyCredit></RepayBuyCredit>}
    ></Route>
    <Route path="customers/add" element={<AddCustomers></AddCustomers>}></Route>
    <Route path="customers" element={<ListCustomers></ListCustomers>}></Route>
  </Route>
);
