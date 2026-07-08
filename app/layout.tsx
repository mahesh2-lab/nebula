import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Geist, Merriweather } from "next/font/google";
import "./globals.css"; // Global styles, including cursor pointer rules
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

const merriweatherHeading = Merriweather({subsets:['latin'],variable:'--font-heading'});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: "Nebula - Cloud Deployment Platform",
  description: "Enterprise-grade cloud deployment, serverless functions, and storage orchestration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geist.variable, "font-mono", jetbrainsMono.variable, merriweatherHeading.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-text font-sans selection:bg-foreground selection:text-background">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
