import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "@/components/ui/toaster";
// import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Sidebar } from "@/components/sidebar";

// import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/Dashboard-page";
// import ScreenerPage from "@/pages/screener-page";
// import BacktestPage from "@/pages/backtest-page";
// import SettingsPage from "@/pages/settings-page";
// import NotFound from "@/pages/not-found";
// import InvoicesPieChart from "./components/invoice-pricechart";
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // <div className="flex h-screen">
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background ml-40">{children}</main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* <Route path="/auth" component={AuthPage} /> */}

      <Route path="/">
        <AppLayout>
          <ProtectedRoute path="/" component={DashboardPage} />
        </AppLayout>
      </Route>

      {/* <Route path="/screener">
        <AppLayout>
          <ProtectedRoute path="/screener" component={ScreenerPage} />
        </AppLayout>
      </Route>

      <Route path="/backtest">
        <AppLayout>
          <ProtectedRoute path="/backtest" component={BacktestPage} />
        </AppLayout>
      </Route>

      <Route path="/settings">
        <AppLayout>
          <ProtectedRoute path="/settings" component={SettingsPage} />
        </AppLayout>
      </Route> */}

      {/* <Route>
        <AppLayout>
          <NotFound />
        </AppLayout>
      </Route> */}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      {/* <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider> */}
    </QueryClientProvider>
  );
}

export default App;