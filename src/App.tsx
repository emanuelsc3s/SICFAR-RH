import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Aniversariantes from "./pages/Aniversariantes";
import ManualGestor from "./pages/ManualGestor";
import FAQ from "./pages/FAQ";
import Configuracao from "./pages/Configuracao";
import ChatLisAI from "./pages/ChatLisAI";
import PortalBeneficio from "./pages/PortalBeneficio";
import SolicitarBeneficio from "./pages/SolicitarBeneficio";
import BeneficioFaturas from "./pages/BeneficioFaturas";
import BeneficioFaturaDetalhe from "./pages/BeneficioFaturaDetalhe";
import NoticiasExternas from "./pages/NoticiasExternas";
import Comunicacao from "./pages/Comunicacao";
import ComunicacaoAdmin from "./pages/ComunicacaoAdmin";
import NotFound from "./pages/NotFound";
import ScannerParceiro from "./pages/ScannerParceiro";
import SolicitarSaidaAntecipada from "./pages/SolicitarSaidaAntecipada";
import SolicitarFerias from "./pages/SolicitarFerias";
import SolicitarTransferencia from "./pages/SolicitarTransferencia";
import EnviarAtestado from "./pages/EnviarAtestado";
import MeusAtestados from "./pages/MeusAtestados";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/aniversariantes" element={<Aniversariantes />} />
          <Route path="/manualgestor" element={<ManualGestor />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/configuracao" element={<Configuracao />} />
          <Route path="/chatlisai" element={<ChatLisAI />} />
          <Route path="/portalbeneficio" element={<PortalBeneficio />} />
          <Route path="/solicitarbeneficio" element={<SolicitarBeneficio />} />
          <Route path="/beneficiofaturas" element={<BeneficioFaturas />} />
          <Route path="/beneficiofaturadetalhe/:faturaId" element={<BeneficioFaturaDetalhe />} />
          <Route path="/noticiasexternas" element={<NoticiasExternas />} />
          <Route path="/comunicacao" element={<Comunicacao />} />
          <Route path="/comunicacao/admin" element={<ComunicacaoAdmin />} />
          <Route path="/scannerparceiro" element={<ScannerParceiro />} />
          <Route path="/solicitarsaidaantecipada" element={<SolicitarSaidaAntecipada />} />
          <Route path="/solicitarferias" element={<SolicitarFerias />} />
          <Route path="/solicitartransferencia" element={<SolicitarTransferencia />} />
          <Route path="/enviaratestado" element={<EnviarAtestado />} />
          <Route path="/meusatestados" element={<MeusAtestados />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
