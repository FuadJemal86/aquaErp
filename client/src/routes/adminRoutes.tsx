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
  </Route>
);
