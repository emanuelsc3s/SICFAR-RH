import { useState } from "react";
import { Home, Plus, Users, QrCode, Download, DollarSign, Eye, Utensils, Car, GraduationCap, ArrowLeft, ArrowRight, CheckCircle, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import QRCode from "qrcode";
import { toast } from "sonner";

const SolicitarBeneficio = () => {
  const [activeButton, setActiveButton] = useState("Solicitar Voucher");
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [urgencia, setUrgencia] = useState("");
  const [informacoesAdicionais, setInformacoesAdicionais] = useState("");
  const [voucher, setVoucher] = useState<{
    id: string;
    verificador: string;
    qrCode: string;
    dataGeracao: string;
    programas: string[];
    urgencia: string;
    informacoes: string;
  } | null>(null);

  const handleProgramSelection = (programTitle: string) => {
    setSelectedPrograms(prev => 
      prev.includes(programTitle) 
        ? prev.filter(p => p !== programTitle)
        : [...prev, programTitle]
    );
  };

  const generateVoucher = async () => {
    try {
      // Gerar IDs únicos
      const voucherId = `VCH-${Date.now().toString().slice(-8)}`;
      const verificador = Math.random().toString(36).substr(2, 12).toUpperCase();
      
      // Dados para o QR Code
      const voucherData = {
        id: voucherId,
        verificador: verificador,
        programas: selectedPrograms,
        urgencia: urgencia || "Normal",
        informacoes: informacoesAdicionais,
        dataGeracao: new Date().toLocaleDateString("pt-BR"),
      };
      
      // Gerar QR Code
      const qrCodeData = await QRCode.toDataURL(JSON.stringify(voucherData), {
        width: 180,
        margin: 1,
      });
      
      setVoucher({
        ...voucherData,
        qrCode: qrCodeData,
      });
      
      setCurrentStep(4); // Novo step para mostrar o voucher
      toast.success("Voucher gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar voucher:", error);
      toast.error("Erro ao gerar voucher. Tente novamente.");
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedPrograms.length > 0) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      generateVoucher();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const navigationButtons = [
    { name: "Início", icon: Home },
    { name: "Solicitar Voucher", icon: Plus },
    { name: "Dashboard RH", icon: Users },
    { name: "Scanner Parceiro", icon: QrCode },
    { name: "Resgates", icon: Download },
    { name: "Faturas", icon: DollarSign },
    { name: "Auditoria", icon: Eye }
  ];

  const programasDisponiveis = [
    {
      title: "Vale Alimentação",
      description: "Benefício para alimentação e refeições",
      value: "R$ 500,00",
      icon: Utensils
    },
    {
      title: "Vale Transporte",
      description: "Auxílio para deslocamento urbano",
      value: "R$ 150,00",
      icon: Car
    },
    {
      title: "Vale Educação",
      description: "Investimento em cursos e capacitação",
      value: "R$ 1.000,00",
      icon: GraduationCap
    }
  ];

  const steps = [
    { number: 1, title: "Escolher Programa", subtitle: "Selecione o tipo de voucher", active: currentStep === 1 },
    { number: 2, title: "Preencher Detalhes", subtitle: "Informações adicionais", active: currentStep === 2 },
    { number: 3, title: "Revisar e Confirmar", subtitle: "Conferir dados antes do envio", active: currentStep === 3 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Estilos de impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .voucher-container, .voucher-container * {
            visibility: visible;
          }
          .voucher-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            page-break-inside: avoid;
            break-inside: avoid;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          .print-hidden {
            display: none !important;
          }
          .voucher-header {
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px 12px 0 0;
            margin-bottom: 0;
          }
          .voucher-body {
            background: white;
            border: 2px solid #E5E7EB;
            border-top: none;
            border-radius: 0 0 12px 12px;
            padding: 2rem;
          }
          .voucher-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            margin-top: 1.5rem;
          }
          .voucher-section {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
          }
          .voucher-qr-section {
            text-align: center;
            background: white;
            border: 2px dashed #9CA3AF;
            border-radius: 12px;
            padding: 1.5rem;
          }
          .voucher-qr img {
            max-width: 160px !important;
            height: auto !important;
            margin: 0 auto;
          }
          .voucher-code {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 18px;
            font-weight: bold;
            background: #EFF6FF;
            padding: 0.75rem;
            border-radius: 6px;
            border-left: 4px solid #2563EB;
          }
          .voucher-logo {
            max-width: 120px;
            height: auto;
          }
          .voucher-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
          }
          .voucher-subtitle {
            font-size: 14px;
            opacity: 0.9;
            margin: 0.25rem 0 0 0;
          }
          .voucher-label {
            font-size: 12px;
            font-weight: 600;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
          }
          .voucher-value {
            font-size: 16px;
            color: #111827;
            font-weight: 600;
          }
          .program-item {
            display: flex;
            justify-content: between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #E5E7EB;
          }
          .program-item:last-child {
            border-bottom: none;
          }
          @page {
            margin: 0.5cm;
            size: A4;
          }
        }
      `}</style>

      {/* Header Navigation */}
      <header className="text-white px-6 py-2 print-hidden" style={{
        backgroundColor: "#1E3A8A"
      }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/farmace-logo.png" 
              alt="Farmace Logo" 
              className="object-contain h-8" 
              style={{
                width: "149.98px",
                height: "68.97px"
              }} 
            />
          </div>
          
          <nav className="hidden md:flex items-center space-x-2 ml-12">
            {navigationButtons.map((button, index) => {
              const IconComponent = button.icon;
              return (
                <Button 
                  key={index}
                  variant="ghost" 
                  className={`transition-colors px-3 py-2 text-sm ${
                    activeButton === button.name 
                      ? "bg-white/30 text-white border-b-2 border-white/60" 
                      : "text-white hover:bg-white/20 hover:text-white"
                  }`}
                  onClick={() => setActiveButton(button.name)}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {button.name}
                </Button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-8 print-hidden">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Solicitar Voucher
          </h1>
          <p className="text-gray-600">
            Siga os passos abaixo para solicitar um novo voucher
          </p>
        </div>

        {/* Steps Indicator - Only show for steps 1-3 */}
        {currentStep < 4 && (
          <div className="flex items-center justify-center mb-8 space-x-8 print-hidden">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-2 ${
                      step.active ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
                    style={step.active ? { backgroundColor: "#1E3A8A" } : {}}
                  >
                    {step.number}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
                    <p className="text-gray-600 text-xs">{step.subtitle}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-px bg-gray-300 ml-8 mr-8 mt-[-40px]"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Program Selection */}
        {currentStep === 1 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha o Programa</h2>
              <div className="space-y-4">
                {programasDisponiveis.map((programa, index) => {
                  const IconComponent = programa.icon;
                  const isSelected = selectedPrograms.includes(programa.title);
                  
                  return (
                    <Card 
                      key={index} 
                      className={`border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleProgramSelection(programa.title)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">{programa.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{programa.description}</p>
                              <p className="font-bold text-gray-900">Valor: {programa.value}</p>
                            </div>
                          </div>
                          <div 
                            className={`w-6 h-6 border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-600 rounded-sm' 
                                : 'border-gray-300 rounded-sm'
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Details Form */}
        {currentStep === 2 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalhes da Solicitação</h2>
              <div className="space-y-6">
                {/* Urgência */}
                <div>
                  <Label htmlFor="urgencia" className="text-sm font-medium text-gray-900 mb-2 block">
                    Urgência
                  </Label>
                  <Select value={urgencia} onValueChange={setUrgencia}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Normal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Informações Adicionais */}
                <div>
                  <Label htmlFor="informacoes" className="text-sm font-medium text-gray-900 mb-2 block">
                    Informações Adicionais
                  </Label>
                  <Textarea
                    id="informacoes"
                    placeholder="Informações complementares (opcional)..."
                    value={informacoesAdicionais}
                    onChange={(e) => setInformacoesAdicionais(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Revisar Solicitação</h2>
              <div className="space-y-6">
                {/* Programas Selecionados */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Programa Selecionado</h3>
                  <div className="space-y-3">
                    {selectedPrograms.map((programName, index) => {
                      const programa = programasDisponiveis.find(p => p.title === programName);
                      if (!programa) return null;
                      
                      return (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900">{programa.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{programa.description}</p>
                          <p className="font-bold text-gray-900 mt-2">Valor: {programa.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Urgência */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Urgência</h3>
                  <p className="text-gray-700 capitalize">{urgencia || "Normal"}</p>
                </div>

                {/* Informações Adicionais */}
                {informacoesAdicionais && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Informações Adicionais</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{informacoesAdicionais}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Voucher Generated */}
        {currentStep === 4 && voucher && (
          <div className="voucher-container">
            {/* Header com logomarca para impressão */}
            <div className="voucher-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <img 
                    src="/farmace-logo.png" 
                    alt="Farmace Logo" 
                    className="voucher-logo"
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h1 className="voucher-title">VOUCHER CORPORATIVO</h1>
                  <p className="voucher-subtitle">Sistema de Benefícios</p>
                </div>
              </div>
            </div>

            {/* Corpo do voucher */}
            <div className="voucher-body">
              {/* Informações principais */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div className="voucher-label">ID do Voucher</div>
                    <div className="voucher-code">{voucher.id}</div>
                  </div>
                  <div>
                    <div className="voucher-label">Código Verificador</div>
                    <div className="voucher-code">{voucher.verificador}</div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <div className="voucher-label">Data de Geração</div>
                    <div className="voucher-value">{voucher.dataGeracao}</div>
                  </div>
                  <div>
                    <div className="voucher-label">Urgência</div>
                    <div className="voucher-value" style={{ textTransform: 'capitalize' }}>{voucher.urgencia}</div>
                  </div>
                </div>
              </div>

              {/* Grid principal */}
              <div className="voucher-grid">
                {/* Programas e informações */}
                <div>
                  <div className="voucher-section">
                    <div className="voucher-label">Programas Incluídos</div>
                    {voucher.programas.map((programa, index) => {
                      const programaData = programasDisponiveis.find(p => p.title === programa);
                      return (
                        <div key={index} className="program-item">
                          <div>
                            <div style={{ fontWeight: '600', color: '#111827' }}>{programa}</div>
                            <div style={{ fontSize: '14px', color: '#6B7280' }}>{programaData?.description}</div>
                          </div>
                          <div style={{ fontWeight: '700', color: '#059669' }}>{programaData?.value}</div>
                        </div>
                      );
                    })}
                  </div>

                  {voucher.informacoes && (
                    <div className="voucher-section">
                      <div className="voucher-label">Informações Adicionais</div>
                      <div className="voucher-value" style={{ whiteSpace: 'pre-wrap' }}>{voucher.informacoes}</div>
                    </div>
                  )}

                  <div style={{ marginTop: '2rem', padding: '1rem', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400E', marginBottom: '0.5rem' }}>⚠️ IMPORTANTE</div>
                    <div style={{ fontSize: '14px', color: '#92400E' }}>
                      Este voucher é válido apenas para os programas especificados e deve ser apresentado junto com um documento de identificação válido.
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="voucher-qr-section">
                  <div className="voucher-label" style={{ marginBottom: '1rem' }}>QR Code de Validação</div>
                  <img src={voucher.qrCode} alt="QR Code do Voucher" style={{ margin: '0 auto 1rem auto' }} />
                  <div style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center' }}>
                    Escaneie para validar o voucher
                  </div>
                  
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#EFF6FF', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1E40AF', marginBottom: '0.5rem' }}>Status do Voucher</div>
                    <div style={{ fontSize: '14px', color: '#1E40AF', fontWeight: '600' }}>✓ ATIVO</div>
                  </div>
                </div>
              </div>

              {/* Rodapé */}
              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '2px solid #E5E7EB', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  Documento gerado automaticamente em {new Date().toLocaleString('pt-BR')} | Sistema Farmace
                </div>
              </div>
            </div>

            {/* Tela de sucesso (apenas para visualização) */}
            <Card className="mb-8 print-hidden">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Voucher Gerado com Sucesso!</h2>
                  <p className="text-gray-600">Seu voucher foi criado e está pronto para uso.</p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Reset para criar novo voucher
                        setCurrentStep(1);
                        setSelectedPrograms([]);
                        setUrgencia("");
                        setInformacoesAdicionais("");
                        setVoucher(null);
                      }}
                    >
                      Criar Novo Voucher
                    </Button>
                    <Button
                      style={{ backgroundColor: "#1E3A8A" }}
                      className="text-white hover:opacity-90"
                      onClick={() => window.print()}
                    >
                      Imprimir Voucher
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons - Only show when not in voucher step */}
        {currentStep < 4 && (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>
            <Button 
              style={{
                backgroundColor: "#1E3A8A"
              }}
              className="text-white hover:opacity-90 flex items-center space-x-2"
              onClick={handleNextStep}
              disabled={currentStep === 1 && selectedPrograms.length === 0}
            >
              <span>{currentStep === 3 ? "Finalizar" : "Próximo"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitarBeneficio;