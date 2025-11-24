import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileCheck, Send, Upload, X, Calendar, FileText, AlertCircle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import BirthdayCard from "@/components/BirthdayCard";
import AnnouncementsCard from "@/components/AnnouncementsCard";
import SystemStatus from "@/components/SystemStatus";
import NewsCard from "@/components/NewsCard";
import { toast } from "sonner";
import { motivosAtestado } from "@/types/atestado";
import {
  salvarAtestado,
  gerarIdAtestado,
  validarPDF,
  arquivoParaBase64,
  formatarTamanhoArquivo,
  calcularDiasAfastamento,
} from "@/utils/atestadoStorage";

const EnviarAtestado = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    funcionario: "Emanuel Silva", // Seria obtido do contexto/sessão do usuário
    cpf: "123.456.789-00", // Seria obtido do contexto/sessão do usuário
    dataInicio: "",
    dataFim: "",
    motivo: "",
    observacoes: "",
  });

  const [arquivo, setArquivo] = useState<{
    file: File | null;
    nome: string;
    tamanho: number;
    preview: string;
  }>({
    file: null,
    nome: "",
    tamanho: 0,
    preview: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar o arquivo
    const validacao = validarPDF(file);
    if (!validacao.valido) {
      toast.error(validacao.erro || "Arquivo inválido");
      return;
    }

    try {
      const base64 = await arquivoParaBase64(file);
      setArquivo({
        file,
        nome: file.name,
        tamanho: file.size,
        preview: base64,
      });
      toast.success("Arquivo anexado com sucesso!");
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast.error("Erro ao processar o arquivo");
    }
  };

  const handleRemoveFile = () => {
    setArquivo({
      file: null,
      nome: "",
      tamanho: 0,
      preview: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validações
      if (!formData.dataInicio) {
        toast.error("Por favor, informe a data de início do afastamento");
        setIsSubmitting(false);
        return;
      }

      if (!formData.dataFim) {
        toast.error("Por favor, informe a data de fim do afastamento");
        setIsSubmitting(false);
        return;
      }

      if (new Date(formData.dataFim) < new Date(formData.dataInicio)) {
        toast.error("A data de fim não pode ser anterior à data de início");
        setIsSubmitting(false);
        return;
      }

      if (!formData.motivo) {
        toast.error("Por favor, selecione o motivo do atestado");
        setIsSubmitting(false);
        return;
      }

      if (!arquivo.file) {
        toast.error("Por favor, anexe o arquivo PDF do atestado");
        setIsSubmitting(false);
        return;
      }

      // Criar objeto do atestado
      const novoAtestado = {
        id: gerarIdAtestado(),
        funcionario: formData.funcionario,
        cpf: formData.cpf,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        motivo: formData.motivo,
        observacoes: formData.observacoes,
        arquivoPdf: arquivo.preview,
        nomeArquivo: arquivo.nome,
        tamanhoArquivo: arquivo.tamanho,
        status: "pendente" as const,
        dataEnvio: new Date().toISOString(),
      };

      // Salvar no localStorage
      salvarAtestado(novoAtestado);

      const diasAfastamento = calcularDiasAfastamento(formData.dataInicio, formData.dataFim);
      
      toast.success(
        `Atestado enviado com sucesso! ${diasAfastamento} ${diasAfastamento === 1 ? 'dia' : 'dias'} de afastamento.`
      );

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate("/meusatestados");
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar atestado:", error);
      toast.error("Erro ao enviar o atestado. Tente novamente.");
      setIsSubmitting(false);
    }
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
              <FileCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Enviar Atestado Médico
              </h1>
              <p className="text-muted-foreground">
                Anexe seu atestado médico e preencha as informações necessárias
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
                  <FileText className="h-5 w-5 text-primary" />
                  Dados do Atestado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações do Funcionário (somente leitura) */}
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Funcionário</Label>
                      <p className="text-sm font-medium">{formData.funcionario}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">CPF</Label>
                      <p className="text-sm font-medium">{formData.cpf}</p>
                    </div>
                  </div>

                  {/* Datas de Afastamento */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataInicio" className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data de Início *
                      </Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={formData.dataInicio}
                        onChange={(e) =>
                          setFormData({ ...formData, dataInicio: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataFim" className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data de Fim *
                      </Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={formData.dataFim}
                        onChange={(e) =>
                          setFormData({ ...formData, dataFim: e.target.value })
                        }
                        min={formData.dataInicio}
                        required
                      />
                    </div>
                  </div>

                  {/* Exibir dias de afastamento */}
                  {formData.dataInicio && formData.dataFim && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>Período de afastamento:</strong>{" "}
                        {calcularDiasAfastamento(formData.dataInicio, formData.dataFim)}{" "}
                        {calcularDiasAfastamento(formData.dataInicio, formData.dataFim) === 1 ? 'dia' : 'dias'}
                      </p>
                    </div>
                  )}

                  {/* Motivo */}
                  <div className="space-y-2">
                    <Label htmlFor="motivo" className="text-sm font-medium">
                      Motivo do Atestado *
                    </Label>
                    <Select
                      value={formData.motivo}
                      onValueChange={(value) =>
                        setFormData({ ...formData, motivo: value })
                      }
                    >
                      <SelectTrigger id="motivo">
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {motivosAtestado.map((motivo) => (
                          <SelectItem key={motivo.value} value={motivo.value}>
                            {motivo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="text-sm font-medium">
                      Observações (opcional)
                    </Label>
                    <Textarea
                      id="observacoes"
                      placeholder="Adicione informações complementares se necessário..."
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData({ ...formData, observacoes: e.target.value })
                      }
                      className="min-h-[100px] resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.observacoes.length}/500 caracteres
                    </p>
                  </div>

                  {/* Upload de Arquivo */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Anexar Atestado (PDF) *
                    </Label>
                    
                    {!arquivo.file ? (
                      <div
                        className="relative w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <Upload className="h-8 w-8 mb-2" />
                          <p className="text-sm font-medium">Clique para anexar o atestado</p>
                          <p className="text-xs">PDF até 10MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-red-100 dark:bg-red-950 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{arquivo.nome}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatarTamanhoArquivo(arquivo.tamanho)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/")}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Enviando..." : "Enviar Atestado"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Card Informativo */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Informações Importantes
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>O atestado será enviado para análise do RH</li>
                  <li>Você receberá uma notificação quando o atestado for analisado</li>
                  <li>O arquivo deve estar em formato PDF e ter no máximo 10MB</li>
                  <li>Certifique-se de que o atestado está legível e completo</li>
                  <li>Em caso de dúvidas, entre em contato com o RH</li>
                </ul>
              </CardContent>
            </Card>

            {/* Card de Acesso Rápido */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Atestados Enviados</h3>
                    <p className="text-xs text-muted-foreground">
                      Visualize e acompanhe seus atestados
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/meusatestados")}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Atestados
                  </Button>
                </div>
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

export default EnviarAtestado;

