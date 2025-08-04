import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Providers from "./providers";
import "./globals.css";
//import "./styles/home.css";
/* import "./styles/auth.css";
import "./styles/variables.css";
import "./styles/error.css";
import "./styles/dashboard.css";
import "./styles/category.css";
import "./styles/confirm-dialog.css";
import "./styles/product-filters.css";
import "./styles/products.css";
import "./styles/cart.css";
import "./styles/checkout.css";
import "./styles/orders.css";
import "./styles/markdown.css";
import "./styles/admin-faqs.css"; */

import AdminRouteHandler from "@/components/admin/common/AdminRouteHandler";
import UserRouteHandler from "@/components/common/UserRouteHandler";
import WhatsAppBotWrapper from "@/components/common/WhatsAppBotWrapper";

export const metadata = {
  title: "E-commerce App",
  description: "Your one-stop shop for everything",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AuthProvider>
            <CartProvider>
              <AdminAuthProvider>
                <AdminRouteHandler>
                  <UserRouteHandler>
                    {children}
                    <WhatsAppBotWrapper />
                  </UserRouteHandler>
                </AdminRouteHandler>
              </AdminAuthProvider>
            </CartProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
