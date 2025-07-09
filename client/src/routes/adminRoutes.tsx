import { lazy } from "react";
import { Route } from "react-router-dom";

const AdminLayout = lazy(() => import("../Layouts/AdminSide/AdminLayout"));
const AdminDashboard = lazy(() => import("../Pages/AdminSide/AdminDashboard"));

export const adminRoutes = (
  <Route path="/admin" element={<AdminLayout></AdminLayout>}>
    <Route index element={<AdminDashboard></AdminDashboard>}></Route>
  </Route>
);
