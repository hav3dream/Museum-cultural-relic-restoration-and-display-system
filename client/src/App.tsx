import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";

/** Per-route error boundary that shows inline error without killing navigation */
function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary inline>{children}</ErrorBoundary>;
}
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import ScrollToTopButton from "./components/ScrollToTopButton";

// Retry wrapper for lazy imports -- handles chunk load failures after deploys
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- React.lazy requires ComponentType<any>
function lazyRetry(importFn: () => Promise<{ default: React.ComponentType<any> }>) {
  return React.lazy(() => {
    const attempt = (retries: number, delay: number): Promise<{ default: React.ComponentType<any> }> =>
      importFn().catch((err: unknown) => {
        if (retries <= 0) return Promise.reject(err);
        return new Promise(resolve => setTimeout(() => resolve(attempt(retries - 1, delay * 2)), delay));
      });
    return attempt(3, 1000);
  });
}

// Lazy load all pages except Home (landing page)
const VirtualRestoration = lazyRetry(() => import("./pages/VirtualRestoration"));
const AncientPaintingRestoration = lazyRetry(() => import("./pages/AncientPaintingRestoration"));
const MuralRestoration = lazyRetry(() => import("./pages/MuralRestoration"));
const CalligraphyGeneration = lazyRetry(() => import("./pages/CalligraphyGeneration"));
const OutlineAnalysis = lazyRetry(() => import("./pages/OutlineAnalysis"));
const SteleRestoration = lazyRetry(() => import("./pages/SteleRestoration"));
const Pricing = lazyRetry(() => import("./pages/Pricing"));
const GalleryPage = lazyRetry(() => import("./pages/GalleryPage"));
const ArtworkDetailPage = lazyRetry(() => import("./pages/ArtworkDetailPage"));
const Login = lazyRetry(() => import("./pages/Login"));
const Dashboard = lazyRetry(() => import("./pages/Dashboard"));
const SmartCreation = lazyRetry(() => import("./pages/SmartCreation"));
const StyleTransfer = lazyRetry(() => import("./pages/StyleTransfer"));
const PatternGeneration = lazyRetry(() => import("./pages/PatternGeneration"));
const SemanticSegmentation = lazyRetry(() => import("./pages/SemanticSegmentation"));
const SuperResolution = lazyRetry(() => import("./pages/SuperResolution"));
const NotFound = lazyRetry(() => import("./pages/NotFound"));
const DigitalHumanPage = lazyRetry(() => import("./pages/DigitalHumanPage"));
const InkPaintingGeneration = lazyRetry(() => import("./pages/InkPaintingGeneration"));
const CalliPaintGeneration = lazyRetry(() => import("./pages/CalliPaintGeneration"));
const CulturalActivation = lazyRetry(() => import("./pages/CulturalActivation"));
const ImageOutpainting = lazyRetry(() => import("./pages/ImageOutpainting"));
const FusionRepair = lazyRetry(() => import("./pages/FusionRepair"));
const MultiViewGeneration = lazyRetry(() => import("./pages/MultiViewGeneration"));
const TextColorization = lazyRetry(() => import("./pages/TextColorization"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function ScrollToTop() {
  const [location] = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      main.removeAttribute('tabindex');
    }
  }, [location]);
  return null;
}

function Router() {
  const [location] = useLocation();

  return (
    <>
    <ScrollToTop />
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#E8E3D1]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-[#7F3222]/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-[#7F3222] border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border border-[#D4A76A]/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute -inset-1 border border-[#7F3222]/10 rounded-full animate-pulse" />
          </div>
          <p className="text-[#7F3222] text-lg font-serif tracking-widest">载入中</p>
          <div className="mt-3 flex justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7F3222] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#7F3222] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#7F3222] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    }>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#7F3222] focus:text-[#E8E3D1] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:shadow-lg"
        style={{ fontFamily: "'LXGW WenKai', sans-serif" }}
      >
        跳转到主要内容
      </a>
      <main id="main-content">
        <Switch location={location}>
          <Route path={"/"} component={Home} />
          <Route path={"/login"} component={Login} />
          <Route path={"/dashboard"} component={Dashboard} />
          <Route path={"/virtual-restoration"} component={VirtualRestoration} />
          <Route path={"/ancient-painting-restoration"}>{() => <RouteErrorBoundary><AncientPaintingRestoration /></RouteErrorBoundary>}</Route>
          <Route path={"/mural-restoration"}>{() => <RouteErrorBoundary><MuralRestoration /></RouteErrorBoundary>}</Route>
          <Route path={"/calligraphy-generation"}>{() => <RouteErrorBoundary><CalligraphyGeneration /></RouteErrorBoundary>}</Route>
          <Route path={"/outline-analysis"}>{() => <RouteErrorBoundary><OutlineAnalysis /></RouteErrorBoundary>}</Route>
          <Route path={"/stele-restoration"}>{() => <RouteErrorBoundary><SteleRestoration /></RouteErrorBoundary>}</Route>
          <Route path={"/ai-generation"}>{() => <RouteErrorBoundary><SmartCreation /></RouteErrorBoundary>}</Route>
          <Route path={"/style-transfer"}>{() => <RouteErrorBoundary><StyleTransfer /></RouteErrorBoundary>}</Route>
          <Route path={"/pattern-generation"}>{() => <RouteErrorBoundary><PatternGeneration /></RouteErrorBoundary>}</Route>
          <Route path={"/semantic-segmentation"}>{() => <RouteErrorBoundary><SemanticSegmentation /></RouteErrorBoundary>}</Route>
          <Route path={"/super-resolution"}>{() => <RouteErrorBoundary><SuperResolution /></RouteErrorBoundary>}</Route>
          <Route path={"/ai-generation/ink-painting"}>{() => <RouteErrorBoundary><InkPaintingGeneration /></RouteErrorBoundary>}</Route>
          <Route path={"/ai-generation/callipaint"}>{() => <RouteErrorBoundary><CalliPaintGeneration /></RouteErrorBoundary>}</Route>
          <Route path={"/cultural-activation/image-outpainting"}>{() => <RouteErrorBoundary><ImageOutpainting /></RouteErrorBoundary>}</Route>
          <Route path={"/cultural-activation/multi-view"}>{() => <RouteErrorBoundary><MultiViewGeneration /></RouteErrorBoundary>}</Route>
          <Route path={"/cultural-activation"}>{() => <RouteErrorBoundary><CulturalActivation /></RouteErrorBoundary>}</Route>
          <Route path={"/fusion-repair"}>{() => <RouteErrorBoundary><FusionRepair /></RouteErrorBoundary>}</Route>
          <Route path={"/text-colorization"}>{() => <RouteErrorBoundary><TextColorization /></RouteErrorBoundary>}</Route>
          <Route path={"/pricing"} component={Pricing} />
          <Route path={"/digital-human"} component={DigitalHumanPage} />
          <Route path={"/gallery/:category/:id"} component={ArtworkDetailPage} />
          <Route path={"/gallery/:category"} component={GalleryPage} />
          <Route path={"/404"} component={NotFound} />
          {/* Final fallback route */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </Suspense>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <ScrollToTopButton />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
