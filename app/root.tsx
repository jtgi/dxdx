import { isRouteErrorResponse, Link, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Button } from "./components/ui/button";
import { ArrowLeft } from "lucide-react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Azeret+Mono:ital,wght@0,100..900;1,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="p-4 text-white w-full h-screen">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-4">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-bold mb-6">{message}</h1>
          <p className="text-zinc-400 mb-8">{details}</p>
          {stack && (
            <pre className="w-full p-4 overflow-x-auto bg-zinc-900 rounded-lg text-sm text-zinc-400">
              <code>{stack}</code>
            </pre>
          )}
          <Link to={"/"}>
            <Button variant={"link"} className="mt-4 text-white">
              <ArrowLeft className="w-4 h-4" /> Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
