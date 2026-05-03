import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { LanguageProvider } from "@/context/language";
import { ChildrenProvider } from "@/context/children";
import Home from "@/pages/home";
import Forecast from "@/pages/forecast";
import Assistant from "@/pages/assistant";
import Doctors from "@/pages/doctors";
import MapPage from "@/pages/map";
import Alerts from "@/pages/alerts";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/forecast" component={Forecast} />
        <Route path="/assistant" component={Assistant} />
        <Route path="/doctors" component={Doctors} />
        <Route path="/map" component={MapPage} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ChildrenProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
        </ChildrenProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
