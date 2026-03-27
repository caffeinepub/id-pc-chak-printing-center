import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { initStorage } from "@/lib/storage";
import AboutPage from "@/pages/AboutPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import BillCheckPage from "@/pages/BillCheckPage";
import ContactPage from "@/pages/ContactPage";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";

// Root layout wrapper with Navbar + Footer
function RootLayout() {
  useEffect(() => {
    initStorage();
  }, []);

  return (
    <>
      <Toaster />
      <Outlet />
    </>
  );
}

// Layout for public pages (with navbar + footer)
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

// Route tree
const rootRoute = createRootRoute({ component: RootLayout });

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: PublicLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/about",
  component: AboutPage,
});

const contactRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/contact",
  component: ContactPage,
});

const productsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/products",
  component: ProductsPage,
});

const billCheckRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/bill-check",
  component: BillCheckPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: AdminDashboardPage,
});

const adminResetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/reset-password",
  component: ResetPasswordPage,
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    homeRoute,
    aboutRoute,
    contactRoute,
    productsRoute,
    billCheckRoute,
  ]),
  adminRoute,
  adminDashboardRoute,
  adminResetRoute,
]);

const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
