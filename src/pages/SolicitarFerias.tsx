import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Send, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import BirthdayCard from "@/components/BirthdayCard";
import AnnouncementsCard from "@/components/AnnouncementsCard";
import SystemStatus from "@/components/SystemStatus";
import NewsCard from "@/components/NewsCard";
import { toast } from "sonner";

const SolicitarFerias = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    colaborador: "",
    dataInicio: "",
    dataFim: "",
    observacoes: "",
  });

  const calcularDiasFerias = () => {
    if (!formData.dataInicio || !formData.dataFim) return 0;
    
    const inicio = new Date(formData.dataInicio);
    const fim = new Date(formData.dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.colaborador) {
      toast.error("Por favor, informe o nome do colaborador.");
      return;
    }

    if (!formData.dataInicio) {
      toast.error("Por favor, selecione a data de início das férias.");
      return;
    }

    if (!formData.dataFim) {
      toast.error("Por favor, selecione a data de término das férias.");
      return;
    }

    // Validar se data fim é posterior à data início
    const inicio = new Date(formData.dataInicio);
    const fim = new Date(formData.dataFim);
    
    if (fim < inicio) {
      toast.error("A data de término deve ser posterior à data de início.");
      return;
    }

    const diasFerias = calcularDiasFerias();
    
    if (diasFerias > 30) {
      toast.error("O período de férias não pode exceder 30 dias.");
      return;
    }

    // Aqui seria feita a integração com o backend
    console.log("Dados da solicitação:", {
      ...formData,
      diasFerias
    });

    toast.success(`Solicitação de férias enviada com sucesso! (${diasFerias} dias)`);

    // Limpar formulário
    setFormData({
      colaborador: "",
      dataInicio: "",
      dataFim: "",
      observacoes: "",
    });

    // Redirecionar após 2 segundos
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Breadcrumb / Voltar */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center text-muted-foreground hover:text-foreground p-0 h-auto font-normal"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o início
          </Button>
        </div>

        {/* Título da página */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Solicitar Férias
              </h1>
              <p className="text-muted-foreground">
                Preencha o formulário abaixo para solicitar seu período de férias
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content - Formulário */}
          <div className="lg:col-span-3 space-y-6">
            {/* Formulário */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Dados da Solicitação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Busca de Colaborador */}
              <div className="space-y-2">
                <Label htmlFor="colaborador" className="text-sm font-medium">
                  Colaborador *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="colaborador"
                    type="text"
                    placeholder="Digite o nome do colaborador"
                    value={formData.colaborador}
                    onChange={(e) =>
                      setFormData({ ...formData, colaborador: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Por enquanto, digite manualmente. Em breve será carregado automaticamente.
                </p>
              </div>

              {/* Data de Início */}
              <div className="space-y-2">
                <Label htmlFor="dataInicio" className="text-sm font-medium">
                  Data de Início *
                </Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, dataInicio: e.target.value })
                  }
                />
              </div>

              {/* Data de Término */}
              <div className="space-y-2">
                <Label htmlFor="dataFim" className="text-sm font-medium">
                  Data de Término *
                </Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) =>
                    setFormData({ ...formData, dataFim: e.target.value })
                  }
                />
                {formData.dataInicio && formData.dataFim && (
                  <p className="text-sm text-primary font-medium">
                    Total de dias: {calcularDiasFerias()} dias
                  </p>
                )}
              </div>

              {/* Campo de Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-sm font-medium">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Adicione observações ou informações adicionais sobre suas férias..."
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.observacoes.length}/500 caracteres
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Solicitação
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

            {/* Card Informativo */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Informações Importantes
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>A solicitação será enviada para aprovação do seu gestor imediato</li>
                  <li>Você receberá uma notificação quando a solicitação for analisada</li>
                  <li>O período máximo de férias é de 30 dias corridos</li>
                  <li>Certifique-se de planejar suas férias com antecedência</li>
                  <li>Em caso de dúvidas, entre em contato com o RH</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <BirthdayCard />
            <AnnouncementsCard />
            <SystemStatus />
            <NewsCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SolicitarFerias;

