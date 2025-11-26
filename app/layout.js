// app/layout.jsx
import "./globals.css";
import Header from "../components/header/Header";
import Footer from "../components/Footer/Footer";

export const metadata = {
  title: "Compagnie MATHILDE — Théâtre & cabaret",
  description:
    "Site de la Compagnie MATHILDE : créations, agenda, médias et contact.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
