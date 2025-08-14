import { useState } from "react";
import { Home, Plus, Users, QrCode, Download, DollarSign, Eye, ArrowLeft, ArrowRight, CheckCircle, Copy, FileText, User, Phone, Mail, CreditCard, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import QRCode from "qrcode";
import { toast } from "sonner";

const SolicitarBeneficio = () => {
  const [activeButton, setActiveButton] = useState("Solicitar Voucher");
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data state
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    email: "",
    telefone: "",
    tipoBeneficio: "",
    categoria: "",
    valor: "",
    observacoes: ""
  });

  // Voucher state
  const [voucherId, setVoucherId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCodeDataURL, setQrCodeDataURL] = useState("");

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateVoucher = async () => {
    try {
      // Validar campos obrigatórios
      if (!formData.nomeCompleto || !formData.cpf || !formData.email || !formData.tipoBeneficio) {
        toast.error("Por favor, preencha todos os campos obrigatórios");
        return;
      }

      // Gerar IDs únicos
      const newVoucherId = `VCH-${Date.now().toString().slice(-8)}`;
      const newVerificationCode = Math.random().toString(36).substr(2, 12).toUpperCase();
      
      // Dados para o QR Code
      const voucherData = {
        id: newVoucherId,
        verificador: newVerificationCode,
        colaborador: {
          nome: formData.nomeCompleto,
          cpf: formData.cpf,
          email: formData.email,
          telefone: formData.telefone
        },
        beneficio: {
          tipo: formData.tipoBeneficio,
          categoria: formData.categoria,
          valor: formData.valor,
          observacoes: formData.observacoes
        },
        dataGeracao: new Date().toISOString(),
      };
      
      // Gerar QR Code
      const qrCodeData = await QRCode.toDataURL(JSON.stringify(voucherData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#1E3A8A',
          light: '#FFFFFF'
        }
      });
      
      setVoucherId(newVoucherId);
      setVerificationCode(newVerificationCode);
      setQrCodeDataURL(qrCodeData);
      setCurrentStep(4);
      
      toast.success("Voucher gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar voucher:", error);
      toast.error("Erro ao gerar voucher. Tente novamente.");
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
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

  const copyVoucherData = () => {
    const voucherText = `
VOUCHER DE BENEFÍCIO - FARMACE
================================
ID: ${voucherId}
Código Verificador: ${verificationCode}
Colaborador: ${formData.nomeCompleto}
CPF: ${formData.cpf}
Tipo de Benefício: ${formData.tipoBeneficio}
Valor: R$ ${formData.valor}
Data de Geração: ${new Date().toLocaleString('pt-BR')}
================================
    `;
    navigator.clipboard.writeText(voucherText);
    toast.success("Dados do voucher copiados!");
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      nomeCompleto: "",
      cpf: "",
      email: "",
      telefone: "",
      tipoBeneficio: "",
      categoria: "",
      valor: "",
      observacoes: ""
    });
    setVoucherId("");
    setVerificationCode("");
    setQrCodeDataURL("");
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

  const tiposBeneficio = [
    { value: "vale-alimentacao", label: "Vale Alimentação", valor: "500,00" },
    { value: "vale-transporte", label: "Vale Transporte", valor: "150,00" },
    { value: "vale-educacao", label: "Vale Educação", valor: "1.000,00" },
    { value: "auxilio-saude", label: "Auxílio Saúde", valor: "300,00" },
    { value: "bonus-performance", label: "Bônus Performance", valor: "800,00" }
  ];

  const categorias = [
    { value: "regular", label: "Regular" },
    { value: "especial", label: "Especial" },
    { value: "promocional", label: "Promocional" }
  ];

  const steps = [
    { number: 1, title: "Dados Pessoais", subtitle: "Informações do colaborador", active: currentStep === 1 },
    { number: 2, title: "Tipo de Benefício", subtitle: "Selecionar benefício", active: currentStep === 2 },
    { number: 3, title: "Confirmar Dados", subtitle: "Revisar informações", active: currentStep === 3 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="text-white px-6 py-2 print-hidden" style={{
        backgroundColor: "#1E3A8A"
      }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/farmace-logo.png" alt="Farmace Logo" className="object-contain h-8" style={{
              width: "149.98px",
              height: "68.97px"
            }} />
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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Solicitar Benefício
          </h1>
          <p className="text-muted-foreground">
            Preencha o formulário para gerar seu voucher de benefício
          </p>
        </div>

        {/* Steps Indicator */}
        {currentStep < 4 && (
          <div className="flex items-center justify-center mb-8 space-x-8 print-hidden">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-2 ${
                      step.active ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground text-sm">{step.title}</p>
                    <p className="text-muted-foreground text-xs">{step.subtitle}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-px bg-border ml-8 mr-8 mt-[-40px]"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Personal Data */}
        {currentStep === 1 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto" className="flex items-center text-sm font-medium">
                    <User className="w-4 h-4 mr-2" />
                    Nome Completo *
                  </Label>
                  <Input
                    id="nomeCompleto"
                    placeholder="Digite seu nome completo"
                    value={formData.nomeCompleto}
                    onChange={(e) => updateFormData("nomeCompleto", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf" className="flex items-center text-sm font-medium">
                    <CreditCard className="w-4 h-4 mr-2" />
                    CPF *
                  </Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => updateFormData("cpf", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center text-sm font-medium">
                    <Mail className="w-4 h-4 mr-2" />
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone" className="flex items-center text-sm font-medium">
                    <Phone className="w-4 h-4 mr-2" />
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => updateFormData("telefone", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Benefit Type */}
        {currentStep === 2 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Tipo de Benefício</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tipoBeneficio" className="text-sm font-medium">
                    Tipo de Benefício *
                  </Label>
                  <Select 
                    value={formData.tipoBeneficio} 
                    onValueChange={(value) => {
                      updateFormData("tipoBeneficio", value);
                      const beneficio = tiposBeneficio.find(b => b.value === value);
                      if (beneficio) {
                        updateFormData("valor", beneficio.valor);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de benefício" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposBeneficio.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label} - R$ {tipo.valor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-sm font-medium">
                    Categoria
                  </Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => updateFormData("categoria", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor" className="text-sm font-medium">
                    Valor (R$)
                  </Label>
                  <Input
                    id="valor"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) => updateFormData("valor", e.target.value)}
                    disabled={!!formData.tipoBeneficio}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes" className="text-sm font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais (opcional)..."
                    value={formData.observacoes}
                    onChange={(e) => updateFormData("observacoes", e.target.value)}
                    className="min-h-[100px] resize-none"
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
              <h2 className="text-2xl font-bold text-foreground mb-6">Confirmar Dados</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">Dados Pessoais</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nome:</strong> {formData.nomeCompleto}</p>
                      <p><strong>CPF:</strong> {formData.cpf}</p>
                      <p><strong>E-mail:</strong> {formData.email}</p>
                      {formData.telefone && <p><strong>Telefone:</strong> {formData.telefone}</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">Benefício</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Tipo:</strong> {tiposBeneficio.find(t => t.value === formData.tipoBeneficio)?.label}</p>
                      {formData.categoria && <p><strong>Categoria:</strong> {categorias.find(c => c.value === formData.categoria)?.label}</p>}
                      <p><strong>Valor:</strong> R$ {formData.valor}</p>
                    </div>
                  </div>
                </div>

                {formData.observacoes && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Observações</h3>
                    <p className="text-sm bg-muted p-3 rounded">{formData.observacoes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Voucher Screen */}
        {currentStep === 4 && (
        <div className="min-h-screen bg-gray-50 print:bg-white">
          <div className="max-w-4xl mx-auto p-8 print:p-0">
            {/* Print Styles */}
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
                  background: white !important;
                  font-size: 12px;
                  page-break-inside: avoid;
                }
                .print-hidden {
                  display: none !important;
                }
                .qr-code-print {
                  width: 100px !important;
                  height: 100px !important;
                }
                .voucher-header {
                  margin-bottom: 15px;
                }
                .voucher-content {
                  font-size: 11px;
                  line-height: 1.3;
                }
                .company-logo {
                  height: 40px;
                }
                .voucher-main-box {
                  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                  border: 2px solid #3b82f6;
                }
              }
            `}</style>

            <div className="voucher-container bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
              {/* Header com gradiente inspirado na fatura */}
              <div className="voucher-header bg-gradient-to-r from-primary to-primary/80 text-white p-6 print:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src="/farmace-logo.png" 
                      alt="Farmace Logo" 
                      className="company-logo h-12 print:h-8 bg-white/10 rounded-lg p-2"
                    />
                    <div>
                      <h1 className="text-2xl font-bold print:text-base">FARMACE</h1>
                      <p className="text-white/90 text-sm print:text-xs">Portal de Benefícios</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold print:text-sm">VOUCHER DE BENEFÍCIO</h2>
                    <p className="text-white/90 text-sm print:text-xs">Comprovante de Solicitação</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="voucher-content p-6 print:p-4">
                {/* Saudação personalizada */}
                <div className="mb-6 print:mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 print:text-lg">
                    Olá, {formData.nomeCompleto.split(' ')[0]}! Seu voucher foi gerado com sucesso!
                  </h3>
                  <p className="text-gray-600 mt-1 print:text-xs">
                    Apresente este comprovante para resgatar seu benefício
                  </p>
                </div>

                {/* Box principal destacado */}
                <div className="voucher-main-box border-2 border-primary rounded-xl p-6 print:p-4 mb-6 print:mb-4 bg-gradient-to-br from-primary/5 via-white to-primary/10">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:gap-4">
                    <div className="lg:col-span-2 space-y-4 print:space-y-2">
                      <div>
                        <span className="text-sm text-gray-500 print:text-xs block mb-1">Número do Voucher</span>
                        <p className="text-4xl font-bold text-primary print:text-2xl tracking-wide">{voucherId}</p>
                        <span className="text-xs text-gray-400 print:text-xs">Este é o valor que você precisa apresentar</span>
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 print:p-2 border border-gray-100">
                        <span className="text-sm text-gray-500 print:text-xs block">Código Verificador</span>
                        <p className="text-xl font-bold text-gray-800 print:text-lg font-mono">{verificationCode}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 print:space-y-2">
                      <div className="bg-white/60 rounded-lg p-3 print:p-2 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600 print:text-xs">Valor do Benefício</span>
                        </div>
                        <p className="text-2xl font-bold text-primary print:text-lg">R$ {formData.valor}</p>
                      </div>
                      
                      <div className="bg-white/60 rounded-lg p-3 print:p-2 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600 print:text-xs">Data de Vencimento</span>
                        </div>
                        <p className="font-bold text-gray-800 print:text-sm">
                          {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações detalhadas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4 mb-6 print:mb-4">
                  <div className="bg-gray-50 rounded-lg p-4 print:p-3">
                    <h4 className="font-bold text-gray-800 text-lg print:text-sm mb-3 print:mb-2 flex items-center">
                      <div className="w-1 h-6 bg-primary rounded mr-3"></div>
                      Dados do Colaborador
                    </h4>
                    <div className="space-y-3 print:space-y-1">
                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600 print:text-xs">Nome Completo:</span>
                        <span className="font-semibold text-right print:text-xs">{formData.nomeCompleto}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600 print:text-xs">CPF:</span>
                        <span className="font-semibold print:text-xs">{formData.cpf}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600 print:text-xs">E-mail:</span>
                        <span className="font-semibold text-right print:text-xs">{formData.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 print:text-xs">Telefone:</span>
                        <span className="font-semibold print:text-xs">{formData.telefone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 print:p-3">
                    <h4 className="font-bold text-gray-800 text-lg print:text-sm mb-3 print:mb-2 flex items-center">
                      <div className="w-1 h-6 bg-green-500 rounded mr-3"></div>
                      Detalhes do Benefício
                    </h4>
                    <div className="space-y-3 print:space-y-1">
                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600 print:text-xs">Tipo de Benefício:</span>
                        <span className="font-semibold text-right print:text-xs">{formData.tipoBeneficio}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600 print:text-xs">Categoria:</span>
                        <span className="font-semibold print:text-xs">{formData.categoria}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600 print:text-xs">Data de Emissão:</span>
                        <span className="font-semibold print:text-xs">{new Date().toLocaleDateString('pt-BR')}</span>
                      </div>
                      {formData.observacoes && (
                        <div className="pt-2 print:pt-1">
                          <span className="text-gray-600 print:text-xs block mb-1">Observações:</span>
                          <p className="text-sm font-medium bg-white rounded p-2 print:text-xs print:p-1">{formData.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seção QR Code e instruções */}
                <div className="border-t-2 border-gray-100 pt-6 print:pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg print:text-sm mb-4 print:mb-2 flex items-center">
                        <div className="w-1 h-6 bg-blue-500 rounded mr-3"></div>
                        Instruções de Uso
                      </h4>
                      <div className="bg-blue-50 rounded-lg p-4 print:p-3 border border-blue-200">
                        <ul className="space-y-2 print:space-y-1 text-sm print:text-xs">
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>Apresente este voucher no local de resgate</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>Use o QR Code para verificação rápida</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>Tenha em mãos um documento com foto</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>Voucher válido por 30 dias</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="mt-4 print:mt-2 bg-yellow-50 border border-yellow-300 rounded-lg p-3 print:p-2">
                        <p className="text-xs text-yellow-800 print:text-xs">
                          <strong>⚠️ Importante:</strong> Este voucher é intransferível e de uso pessoal. Não compartilhe os códigos.
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center bg-gray-50 rounded-lg p-4 print:p-3">
                      <h4 className="font-bold text-gray-800 text-lg print:text-sm mb-3 print:mb-2">
                        Pagamento via QR Code
                      </h4>
                      <div className="bg-white rounded-lg p-4 print:p-3 inline-block border-2 border-gray-200">
                        <div className="qr-code-print">
                          <img 
                            src={qrCodeDataURL} 
                            alt="QR Code do Voucher" 
                            className="w-32 h-32 print:w-24 print:h-24 mx-auto"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 print:text-xs font-mono">
                        Escaneie o QR Code acima para validar o benefício. Seu limite será liberado em até 24h.
                      </p>
                      <div className="mt-2 bg-white rounded p-2 border">
                        <p className="text-xs font-mono text-gray-600 print:text-xs">
                          Código: {verificationCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-4 print:pt-2 mt-6 print:mt-4 bg-gray-50 rounded-lg p-4 print:p-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 print:text-xs font-medium">
                      AUTENTICAÇÃO MECÂNICA FICHA DE COMPENSAÇÃO
                    </p>
                    <p className="text-xs text-gray-400 print:text-xs mt-1">
                      Documento gerado automaticamente em {new Date().toLocaleString('pt-BR')} | Para dúvidas, contate o RH
                    </p>
                    <div className="flex justify-center items-center mt-2 space-x-4">
                      <div className="text-xs text-gray-400">ID: {voucherId}</div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="text-xs text-gray-400">Portal Farmace v2.0</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="print-hidden flex flex-col sm:flex-row gap-4 mt-6">
              <Button
                onClick={() => window.print()}
                className="flex-1 bg-primary hover:bg-primary/90 shadow-lg"
                size="lg"
              >
                <FileText className="mr-2 h-5 w-5" />
                Imprimir Voucher
              </Button>
              <Button
                onClick={copyVoucherData}
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/10"
                size="lg"
              >
                <Copy className="mr-2 h-5 w-5" />
                Copiar Dados
              </Button>
              <Button
                onClick={resetForm}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Nova Solicitação
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Navigation Buttons */}
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2"
              onClick={handleNextStep}
              disabled={currentStep === 1 && (!formData.nomeCompleto || !formData.cpf || !formData.email)}
            >
              <span>{currentStep === 3 ? "Gerar Voucher" : "Próximo"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitarBeneficio;