import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PhotoboothProvider } from "../lib/photobooth/context";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SnapStudio",
    alternateName: ["SnapStudio Booth", "SnapStudio Online Photobooth"],
    url: "https://snapstudio-app.vercel.app/",
    description:
      "Create beautiful photo strips with SnapStudio, a free online photobooth. Capture selfies, explore 8 creative modes, add stickers and filters, and download your photos.",
    inLanguage: "en-US",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SnapStudio",
    url: "https://snapstudio-app.vercel.app/",
    description:
      "Create beautiful photo strips with SnapStudio, a free online photobooth. Capture selfies, explore 8 creative modes, add stickers and filters, and download your photos.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript and HTML5 Canvas & MediaDevices support.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Free live virtual photobooth with webcam capture and countdown timer",
      "8 art-directed photo aesthetics (Classic, Cinematic, Fun & Meme, Vintage, Music, Cute, Editorial, Travel)",
      "Vertical strips (2, 4, 6 shots) and collage grids (2x2, 2x3)",
      "Over 12 analog film and booth filters",
      "Interactive sticker editor with doodles, speech bubbles, and custom text stamps",
      "Ultra high-res 300 DPI print-ready canvas PNG export",
      "100% private client-side processing where photos never leave your device",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I take photo strips with SnapStudio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Start by clicking 'Enter Studio'. Choose your favorite layout (2-cut, 4-cut, 6-cut, or collage), grant camera permissions to capture live photos with the countdown timer, or upload pictures from your device. You can then pick an aesthetic mode, customize frames, apply film filters, add stickers, and download your high-resolution strip.",
        },
      },
      {
        "@type": "Question",
        name: "Do I have to allow camera access to use the photobooth?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Camera access is optional. If you prefer not to use your webcam or front camera, you can upload your own photos directly from your phone or computer, or try our curated sample photo sets to preview and customize strips instantly.",
        },
      },
      {
        "@type": "Question",
        name: "How do stickers, doodles, and text stamps work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "In the Customize step, open the Stickers drawer to drag and drop hand-drawn doodles, stars, hearts, memes, and speech bubbles onto your strip. You can also type custom text stickers with hand or clean font styles, rotate, resize, and undo/redo any placement.",
        },
      },
      {
        "@type": "Question",
        name: "How do I download and save my photobooth strips?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Once you finish designing your strip, click 'Download Strip' to save a studio-grade PNG image directly to your device. You can also export a 300 DPI print-ready version, copy the strip to your clipboard, or share it using your device's native share menu.",
        },
      },
      {
        "@type": "Question",
        name: "Are my photos private and secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, 100%. SnapStudio runs entirely in your web browser. Your photos, live camera feeds, and customized strips are processed strictly on your device and are never uploaded, stored, or transmitted to any external servers.",
        },
      },
    ],
  },
];

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SnapStudio – Free Online Photobooth, Photo Strips & Stickers" },
      {
        name: "description",
        content:
          "Create beautiful photo strips with SnapStudio, a free online photobooth. Capture selfies, explore 8 creative modes, add stickers and filters, and download your photos.",
      },
      {
        name: "keywords",
        content:
          "online photobooth, photo booth online, photo strip maker, free photobooth, 4 cut photo strip, aesthetic photo booth, photobooth stickers, camera filters, print photo strips, selfie booth",
      },
      { name: "author", content: "SnapStudio" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:site_name", content: "SnapStudio" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://snapstudio-app.vercel.app/" },
      { property: "og:title", content: "SnapStudio – Free Online Photobooth, Photo Strips & Stickers" },
      {
        property: "og:description",
        content:
          "Create beautiful photo strips with SnapStudio, a free online photobooth. Capture selfies, explore 8 creative modes, add stickers and filters, and download your photos.",
      },
      { property: "og:image", content: "https://snapstudio-app.vercel.app/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "SnapStudio — Free Online Photobooth & Aesthetic Photo Strips" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SnapStudio – Free Online Photobooth, Photo Strips & Stickers" },
      {
        name: "twitter:description",
        content:
          "Create beautiful photo strips with SnapStudio, a free online photobooth. Capture selfies, explore 8 creative modes, add stickers and filters, and download your photos.",
      },
      { name: "twitter:image", content: "https://snapstudio-app.vercel.app/og-image.png" },
      {
        name: "google-site-verification",
        content: "nHkWfGSF0PKxzMs1c0zOEL8uOGF_t-F8Pj_VuT5jUsA",
      },
    ],
    links: [
      { rel: "canonical", href: "https://snapstudio-app.vercel.app/" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Silkscreen:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico?v=3", sizes: "any" },
      { rel: "icon", href: "/favicon.png?v=3", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=3" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <PhotoboothProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </PhotoboothProvider>
    </QueryClientProvider>
  );
}
