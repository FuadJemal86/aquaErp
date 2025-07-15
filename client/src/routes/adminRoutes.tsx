import { lazy } from "react";
import { Route } from "react-router-dom";

const AdminLayout = lazy(() => import("../Layouts/AdminSide/AdminLayout"));
const AdminDashboard = lazy(() => import("../Pages/AdminSide/AdminDashboard"));
const AddUsers = lazy(
  () => import("../Pages/AdminSide/Settings/AddUser/AddUsers")
);
const BankAccount = lazy(
  () => import("../Pages/AdminSide/Settings/BankAccount/BankAccount")
);
const AddProduct = lazy(
  () => import("../Pages/AdminSide/Settings/AddProduct/AddProduct")
);
const MyProfile = lazy(
  () => import("../Pages/AdminSide/Settings/Profile/MyProfile")
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
const BuyCreditReport = lazy(
  () => import("../Pages/AdminSide/Buy/BuyProducts/BuyCreditReport")
);
const SaleProducts = lazy(
  () => import("../Pages/AdminSide/Sale/SaleProducts/SaleProducts")
);
const BankTransfer = lazy(
  () => import("../Pages/AdminSide/BankTransfer/Deposit/BankDeposti")
);
const BankWithdraw = lazy(
  () => import("../Pages/AdminSide/BankTransfer/Withdraw/BankWithdraw")
);
const SalesCreditReport = lazy(
  () => import("../Pages/AdminSide/Sale/SaleProducts/SalesCreditReport")
);
const SalesReport = lazy(
  () => import("../Pages/AdminSide/Report/SalesReport/SalesReport")
);

const RepaySalesCredit = lazy(
  () => import("../Pages/AdminSide/RepayCredit/Sales/RepaySalesCredit")
);

const RepayBuyCredit = lazy(
  () => import("../Pages/AdminSide/RepayCredit/Buy/RepayBuyCredit")
);

export const adminRoutes = (
  <Route path="/admin" element={<AdminLayout></AdminLayout>}>
    <Route index element={<AdminDashboard></AdminDashboard>}></Route>
    <Route
      path="/admin/settings/add-product"
      element={<AddProduct></AddProduct>}
    ></Route>
    <Route
      path="/admin/settings/add-user"
      element={<AddUsers></AddUsers>}
    ></Route>
    <Route
      path="/admin/settings/bank-account"
      element={<BankAccount></BankAccount>}
    ></Route>
    <Route
      path="/admin/settings/my-profile"
      element={<MyProfile></MyProfile>}
    ></Route>
    <Route
      path="/admin/customers/add"
      element={<AddCustomers></AddCustomers>}
    ></Route>
    <Route
      path="/admin/customers"
      element={<ListCustomers></ListCustomers>}
    ></Route>
    <Route
      path="/admin/buy-products"
      element={<BuyProducts></BuyProducts>}
    ></Route>
    <Route
      path="/admin/sales-products"
      element={<SaleProducts></SaleProducts>}
    ></Route>
    <Route
      path="/admin/sales-credit-report"
      element={<SalesCreditReport></SalesCreditReport>}
    ></Route>
    <Route
      path="/admin/buy-credit-report"
      element={<BuyCreditReport></BuyCreditReport>}
    ></Route>
    <Route
      path="/admin/sales-report"
      element={<SalesReport></SalesReport>}
    ></Route>
    <Route
      path="/admin/bank-transfer/deposit"
      element={<BankTransfer></BankTransfer>}
    ></Route>
    <Route
      path="/admin/bank-transfer/withdraw"
      element={<BankWithdraw></BankWithdraw>}
    ></Route>
    <Route
      path="/admin/sales-credit-repay"
      element={<RepaySalesCredit></RepaySalesCredit>}
    ></Route>
    <Route
      path="/admin/buy-credit-repay"
      element={<RepayBuyCredit></RepayBuyCredit>}
    ></Route>
  </Route>
);
