import type { ReactNode } from "react";
import AuthStatus from "../components/AuthStatus";
import "./globals.css";

export const metadata = {
  title: "dontroot.de",
  description: "Dezentrales soziales Netzwerk für IT-Menschen",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <header className="site-header">
          <a href="/" className="logo">dontroot.de</a>
          <AuthStatus />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
