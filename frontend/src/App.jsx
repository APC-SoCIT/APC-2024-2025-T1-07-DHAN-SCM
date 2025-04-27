import { Routes, Route, Navigate } from "react-router-dom";

import AuthWrapper from "./components/AuthWrapper.jsx";
import PublicRoutes from "./components/PublicRoutes";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import RoleRoutes from "./components/RoleRoutes.jsx";

import Login from "./pages/public/Login/Index.jsx";

import Layout from "./layout/Index.jsx";
import PageTitleProvider from "./components/common/PageTitleProvider";

import Dashboard from "./pages/private/Dashboard/Index";
import Products from "./pages/private/Products/Index";
import ProductInventory from "./pages/private/ProductInventory/Index";

import PurchaseOrders from "./pages/private/PurchaseOrders/Index.jsx";
import PurchaseOrdersCreate from "./pages/private/PurchaseOrdersCreate/Index.jsx";
import PurchaseOrdersView from "./pages/private/PurchaseOrdersView/Index.jsx";
import PurchaseOrdersReceive from "./pages/private/PurchaseOrdersReceive/Index.jsx";
import Orders from "./pages/private/Orders/Index.jsx";
import OrdersView from "./pages/private/OrdersView/Index.jsx";
import DemoUnits from "./pages/private/DemoUnits/Index.jsx";
import Servicing from "./pages/private/Servicing/Index.jsx";

import Suppliers from "./pages/private/Suppliers/Index.jsx";
import Companies from "./pages/private/Companies/Index.jsx";
import Locations from "./pages/private/Locations/Index.jsx";
import Warehouses from "./pages/private/Warehouses/Index.jsx";
import ProductUnits from "./pages/private/ProductUnits/Index.jsx";
import Tags from "./pages/private/Tags/Index.jsx";

import Reports from "./pages/private/Reports/Index.jsx";
import Users from "./pages/private/Users/Index.jsx";

import Ecommerce from "./pages/private/Ecommerce/Index";

import CustomerOrders from "./pages/private/CustomerOrders/Index.jsx";
import CustomerOrdersView from "./pages/private/CustomerOrdersView/Index.jsx";

function App() {
  const routes = [
    {
      title: "Products",
      subTitle: "product management",
      path: "/products",
      element: <Products />,
    },
    {
      title: "Product Inventory",
      subTitle: "view your selected product inventory details",
      path: "/products/:productId",
      element: <ProductInventory />,
      isWithBackButton: true,
    },
    {
      title: "Purchase Orders",
      subTitle: "purchase order management",
      path: "/purchaseOrders",
      element: <PurchaseOrders />,
    },
    {
      title: "Create Purchase Order",
      subTitle: "create purchase order here",
      path: "/purchaseOrders/create",
      element: <PurchaseOrdersCreate />,
      isWithBackButton: true,
    },
    {
      title: "View Purchase Order",
      subTitle: "view your purchase order here",
      path: "/purchaseOrders/:purchaseOrderId",
      element: <PurchaseOrdersView />,
      isWithBackButton: true,
    },
    {
      title: "Receive Purchase Order",
      subTitle: "receive your purchase order here",
      path: "/purchaseOrders/receive/:purchaseOrderId",
      element: <PurchaseOrdersReceive />,
      isWithBackButton: true,
    },
    {
      title: "Orders",
      subTitle: "orders management",
      path: "/orders",
      element: <Orders />,
    },
    {
      title: "View Order",
      subTitle: "view order full details",
      path: "/orders/:orderId",
      element: <OrdersView />,
      isWithBackButton: true,
    },
    {
      title: "Demo Units",
      subTitle: "demo units management",
      path: "/demoUnits",
      element: <DemoUnits />,
    },
    {
      title: "Servicing",
      subTitle: "machine servicing monitoring",
      path: "/servicing",
      element: <Servicing />,
    },
    {
      title: "Users",
      subTitle: "user management",
      path: "/users",
      element: <Users />,
    },
    {
      title: "Suppliers",
      subTitle: "supplier management",
      path: "/suppliers",
      element: <Suppliers />,
    },
    {
      title: "Customers",
      subTitle: "customer/company management",
      path: "/customers",
      element: <Companies />,
    },
    {
      title: "Locations",
      subTitle: "product/item location management",
      path: "/locations",
      element: <Locations />,
    },
    {
      title: "Warehouses",
      subTitle: "warehouse management",
      path: "/warehouses",
      element: <Warehouses />,
    },
    {
      title: "Product Units",
      subTitle: "product unit management",
      path: "/productUnits",
      element: <ProductUnits />,
    },
    {
      title: "Tags",
      subTitle: "product tags unit management",
      path: "/tags",
      element: <Tags />,
    },
    {
      title: "Ecommerce",
      subTitle: "place your order here",
      path: "/ecommerce",
      element: <Ecommerce />,
    },
    {
      title: "My Orders",
      subTitle: "view your orders here",
      path: "/customerOrders",
      element: <CustomerOrders />,
    },
    {
      title: "View Order",
      subTitle: "view order full details",
      path: "/customerOrders/:orderId",
      element: <CustomerOrdersView />,
      isWithBackButton: true,
    },
    // {
    //   title: "Reports",
    //   subTitle: "view reports here",
    //   path: "/reports",
    //   element: <Reports />,
    // },
  ];

  const customerRoutes = [];

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/" element={<AuthWrapper />}>
        <Route path="/" element={<PublicRoutes />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/" element={<ProtectedRoutes />}>
          <Route path="/" element={<Layout />}>
            <Route
              path="/dashboard"
              element={
                <PageTitleProvider
                  route={{
                    title: "Dashboard",
                    subTitle: "track, analyze, and optimize your operations",
                  }}
                >
                  <Dashboard />
                </PageTitleProvider>
              }
            />
            <Route path="/" element={<RoleRoutes userType="All" />}>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <PageTitleProvider route={route}>
                      {route.element}
                    </PageTitleProvider>
                  }
                />
              ))}
            </Route>
            {/* <Route path="/" element={<RoleRoutes userType="Customer" />}>
              {customerRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <PageTitleProvider route={route}>
                      {route.element}
                    </PageTitleProvider>
                  }
                />
              ))}
            </Route> */}
          </Route>
        </Route>
      </Route>
      <Route path="/404" element={<div>Page Not Found</div>} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
  );
}

export default App;
