import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";
import FileUploadModal from "@/components/FileUploadModal";
import { ModalProvider } from "@/components/providers/ModalProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: {
    default: "Docubox",
    template: "%s | Docubox",
  },
  description:
    "Store your documents in the cloud. Parse and summarize with AI.",
  keywords: [
    "document management",
    "AI",
    "file storage",
    "parsing",
    "summarization",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider dynamic>
      <html lang="en" suppressHydrationWarning>
        <body className="w-screen h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <TooltipProvider delayDuration={300}>
                <Header />
                <div className="flex flex-col h-full">
                  <ErrorBoundary>
                    <div className="flex-1">{children}</div>
                  </ErrorBoundary>
                  <Footer />
                </div>
                <Toaster />
                <FileUploadModal />
                <ModalProvider />
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
