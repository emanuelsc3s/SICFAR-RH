import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import AutorizacaoAutoatendimento from "./pages/AutorizacaoAutoatendimento";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Rota pública - Login */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas - Requerem autenticação */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/aniversariantes" element={<ProtectedRoute><Aniversariantes /></ProtectedRoute>} />
            <Route path="/manualgestor" element={<ProtectedRoute><ManualGestor /></ProtectedRoute>} />
            <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
            <Route path="/configuracao" element={<ProtectedRoute><Configuracao /></ProtectedRoute>} />
            <Route path="/chatlisai" element={<ProtectedRoute><ChatLisAI /></ProtectedRoute>} />
            <Route path="/portalbeneficio" element={<ProtectedRoute><PortalBeneficio /></ProtectedRoute>} />
            <Route path="/solicitarbeneficio" element={<ProtectedRoute><SolicitarBeneficio /></ProtectedRoute>} />
            <Route path="/beneficiofaturas" element={<ProtectedRoute><BeneficioFaturas /></ProtectedRoute>} />
            <Route path="/beneficiofaturadetalhe/:faturaId" element={<ProtectedRoute><BeneficioFaturaDetalhe /></ProtectedRoute>} />
            <Route path="/noticiasexternas" element={<ProtectedRoute><NoticiasExternas /></ProtectedRoute>} />
            <Route path="/comunicacao" element={<ProtectedRoute><Comunicacao /></ProtectedRoute>} />
            <Route path="/comunicacao/admin" element={<ProtectedRoute><ComunicacaoAdmin /></ProtectedRoute>} />
            <Route path="/scannerparceiro" element={<ProtectedRoute><ScannerParceiro /></ProtectedRoute>} />
            <Route path="/solicitarsaidaantecipada" element={<ProtectedRoute><SolicitarSaidaAntecipada /></ProtectedRoute>} />
            <Route path="/solicitarferias" element={<ProtectedRoute><SolicitarFerias /></ProtectedRoute>} />
            <Route path="/solicitartransferencia" element={<ProtectedRoute><SolicitarTransferencia /></ProtectedRoute>} />
            <Route path="/enviaratestado" element={<ProtectedRoute><EnviarAtestado /></ProtectedRoute>} />
            <Route path="/meusatestados" element={<ProtectedRoute><MeusAtestados /></ProtectedRoute>} />
            <Route path="/autorizacaoautoatendimento" element={<ProtectedRoute><AutorizacaoAutoatendimento /></ProtectedRoute>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
