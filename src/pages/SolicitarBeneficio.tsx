import { useState, useEffect } from "react";
import { Home, Plus, Users, QrCode, Download, DollarSign, Eye, ArrowLeft, ArrowRight, Flame, Pill, Car, Heart, Bus, Fuel } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";

const SolicitarBeneficio = () => {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("Solicitar Voucher");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBeneficios, setSelectedBeneficios] = useState<string[]>([]);
  const [showVoucher, setShowVoucher] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  
  // Form data for step 2
  const [formData, setFormData] = useState({
    justificativa: "",
    urgencia: "",
    informacoesAdicionais: ""
  });

  const navigationButtons = [
    { name: "Início", icon: Home },
    { name: "Solicitar Voucher", icon: Plus },
    { name: "Dashboard RH", icon: Users },
    { name: "Scanner Parceiro", icon: QrCode },
    { name: "Resgates", icon: Download },
    { name: "Faturas", icon: DollarSign },
    { name: "Auditoria", icon: Eye }
  ];

  const beneficios = [
    {
      id: "vale-gas",
      title: "Vale Gás",
      description: "Benefício para compra de gás de cozinha",
      value: "R$ 125,00",
      icon: Flame
    },
    {
      id: "vale-farmacia-santa-cecilia",
      title: "Vale Farmácia Santa Cecília",
      description: "Benefício para compras na Farmácia Santa Cecília",
      value: "Máx R$ 300,00",
      icon: Pill
    },
    {
      id: "vale-farmacia-gentil",
      title: "Vale Farmácia Gentil",
      description: "Benefício para compras na Farmácia Gentil",
      value: "Máx R$ 300,00",
      icon: Pill
    },
    {
      id: "vale-combustivel",
      title: "Vale Combustível",
      description: "Benefício para abastecimento de veículos",
      value: "Consultar valor",
      icon: Fuel
    },
    {
      id: "plano-saude",
      title: "Plano de Saúde",
      description: "Cobertura de assistência médica e hospitalar",
      value: "R$ 79,00",
      icon: Heart
    },
    {
      id: "vale-transporte",
      title: "Vale Transporte",
      description: "Auxílio para deslocamento urbano",
      value: "R$ 35,00",
      icon: Bus
    }
  ];

  const steps = [
    { number: 1, title: "Escolher Programa", subtitle: "Selecione o tipo de voucher", active: currentStep === 1 },
    { number: 2, title: "Preencher Detalhes", subtitle: "Informações adicionais", active: currentStep === 2 },
    { number: 3, title: "Revisar e Confirmar", subtitle: "Conferir dados antes do envio", active: currentStep === 3 }
  ];

  const handleBeneficioToggle = (beneficioId: string) => {
    setSelectedBeneficios(prev => {
      if (prev.includes(beneficioId)) {
        return prev.filter(id => id !== beneficioId);
      } else {
        return [...prev, beneficioId];
      }
    });
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateVoucherNumber = () => {
    return `VOU${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
  };

  const generateQRCode = async (voucherNumber: string) => {
    const qrData = JSON.stringify({
      voucher: voucherNumber,
      beneficios: selectedBeneficios,
      data: new Date().toISOString(),
      empresa: "Farmace Benefícios"
    });
    
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1E3A8A',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  const handleConfirmSolicitation = () => {
    const voucherNumber = generateVoucherNumber();
    generateQRCode(voucherNumber);
    setShowVoucher(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="text-white px-6 py-2" style={{
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

      {showVoucher ? (
        /* Voucher Screen */
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setShowVoucher(false)}
              className="flex items-center text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>

          {/* Voucher Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header - Blue gradient like the primary theme */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Voucher Gerado</h1>
                    <p className="text-blue-100">Farmace Benefícios</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Data de geração</p>
                  <p className="text-lg font-semibold">{new Date().toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </div>

            {/* Voucher Details */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Parabéns! Seu voucher foi aprovado!
                </h2>
                <p className="text-gray-600">
                  Utilize as informações abaixo para resgatar seus benefícios
                </p>
              </div>

              {/* Main Voucher Info */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200 mb-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Número do Voucher</p>
                    <p className="text-3xl font-bold text-blue-600">{generateVoucherNumber()}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Este é o seu código de identificação
                    </p>
                    
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total de benefícios:</span>
                        <span className="font-semibold text-gray-900">{selectedBeneficios.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Aprovado
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Validade:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* QR Code Section */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      {qrCodeUrl ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="QR Code do Voucher" 
                          className="w-40 h-40"
                        />
                      ) : (
                        <div className="w-40 h-40 bg-gray-100 flex items-center justify-center rounded-lg">
                          <QrCode className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Escaneie para validar
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits List */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefícios Aprovados</h3>
                <div className="space-y-3">
                  {selectedBeneficios.map((beneficioId) => {
                    const beneficio = beneficios.find(b => b.id === beneficioId);
                    if (!beneficio) return null;
                    const IconComponent = beneficio.icon;
                    
                    return (
                      <div key={beneficioId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{beneficio.title}</p>
                            <p className="text-sm text-gray-600">{beneficio.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{beneficio.value}</p>
                          <p className="text-xs text-gray-500">Disponível</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Request Details */}
              <div className="border-t border-gray-200 pt-6 mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Detalhes da Solicitação</h4>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Urgência:</p>
                    <p className="text-gray-900 font-medium">{formData.urgencia || "Normal"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Data de Solicitação:</p>
                    <p className="text-gray-900 font-medium">{new Date().toLocaleDateString("pt-BR")}</p>
                  </div>
                  {formData.justificativa && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600 mb-1">Justificativa:</p>
                      <p className="text-gray-900">{formData.justificativa}</p>
                    </div>
                  )}
                  {formData.informacoesAdicionais && (
                    <div className="md:col-span-2">
                      <p className="text-gray-600 mb-1">Informações Adicionais:</p>
                      <p className="text-gray-900">{formData.informacoesAdicionais}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.print()}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Imprimir Voucher
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/portalbeneficio")}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Portal
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowVoucher(false);
                    setCurrentStep(1);
                    setSelectedBeneficios([]);
                    setFormData({
                      justificativa: "",
                      urgencia: "",
                      informacoesAdicionais: ""
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Solicitação
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-6">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/portalbeneficio')}
                className="flex items-center text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Solicitar Voucher
            </h1>
            <p className="text-gray-600 mb-8">
              Siga os passos abaixo para solicitar um novo voucher
            </p>
          </div>

          {/* Steps Header */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-2 ${
                      step.active ? 'bg-blue-600' : currentStep > step.number ? 'bg-gray-400' : 'bg-gray-300'
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold text-sm ${step.active ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-gray-400 text-xs">{step.subtitle}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-px bg-gray-300 ml-8 mr-8 mt-[-40px]"></div>
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Escolher Programa */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Escolha o Programa</h2>
              
              <div className="space-y-4">
                {beneficios.map((beneficio) => (
                  <Card 
                    key={beneficio.id}
                    className={`border transition-all cursor-pointer ${
                      selectedBeneficios.includes(beneficio.id) 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleBeneficioToggle(beneficio.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            selectedBeneficios.includes(beneficio.id) ? 'bg-blue-600' : 'bg-gray-100'
                          }`}>
                            <beneficio.icon className={`w-6 h-6 ${
                              selectedBeneficios.includes(beneficio.id) ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{beneficio.title}</h3>
                            <p className="text-sm text-blue-600 mb-2">{beneficio.description}</p>
                            <p className="font-bold text-gray-900">Valor: {beneficio.value}</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedBeneficios.includes(beneficio.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedBeneficios.includes(beneficio.id) && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/portalbeneficio')}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                
                <Button 
                  onClick={handleNextStep}
                  disabled={selectedBeneficios.length === 0}
                  className="flex items-center text-white"
                  style={{ backgroundColor: "#1E3A8A" }}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Detalhes da Solicitação */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Detalhes da Solicitação</h2>
              
              <div className="space-y-6">
                {/* Justificativa */}
                <div className="space-y-2">
                  <Label htmlFor="justificativa" className="text-sm font-medium text-gray-900">
                    Justificativa para Solicitação Mensal Excedente
                  </Label>
                  <Textarea
                    id="justificativa"
                    placeholder="Explique o motivo da solicitação..."
                    value={formData.justificativa}
                    onChange={(e) => setFormData({...formData, justificativa: e.target.value})}
                    className="min-h-[120px] resize-none bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Urgência */}
                <div className="space-y-2">
                  <Label htmlFor="urgencia" className="text-sm font-medium text-gray-900">
                    Urgência
                  </Label>
                  <Select value={formData.urgencia} onValueChange={(value) => setFormData({...formData, urgencia: value})}>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Normal" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Informações Adicionais */}
                <div className="space-y-2">
                  <Label htmlFor="informacoesAdicionais" className="text-sm font-medium text-gray-900">
                    Informações Adicionais
                  </Label>
                  <Textarea
                    id="informacoesAdicionais"
                    placeholder="Informações complementares (opcional)..."
                    value={formData.informacoesAdicionais}
                    onChange={(e) => setFormData({...formData, informacoesAdicionais: e.target.value})}
                    className="min-h-[120px] resize-none bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8">
                <Button 
                  variant="ghost" 
                  onClick={handlePrevStep}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                
                <Button 
                  onClick={handleNextStep}
                  className="flex items-center text-white"
                  style={{ backgroundColor: "#1E3A8A" }}
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Revisar e Confirmar */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Header Card - Fatura Style */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Resumo da Solicitação</h2>
                    <p className="text-blue-100">Olá! Sua solicitação está quase pronta!</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Data da solicitação</p>
                    <p className="font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              {/* Main Summary Card */}
              <div className="bg-white rounded-lg border-2 border-blue-200 p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Benefícios Solicitados</h3>
                    <div className="space-y-3">
                      {selectedBeneficios.map(beneficioId => {
                        const beneficio = beneficios.find(b => b.id === beneficioId);
                        if (!beneficio) return null;
                        const IconComponent = beneficio.icon;
                        return (
                          <div key={beneficioId} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{beneficio.title}</p>
                              <p className="text-sm text-blue-600">{beneficio.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total de benefícios</p>
                      <p className="text-3xl font-bold text-gray-900">{selectedBeneficios.length}</p>
                      <p className="text-sm text-gray-500">itens selecionados</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                        <p className="text-sm font-medium text-gray-900">Status da solicitação</p>
                      </div>
                      <p className="text-sm text-gray-600">Aguardando confirmação</p>
                    </div>
                  </div>
                </div>

                {/* Form Data Summary */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Detalhes da Solicitação</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Justificativa:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {formData.justificativa || "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Urgência:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {formData.urgencia || "Normal"}
                      </p>
                    </div>
                  </div>
                  {formData.informacoesAdicionais && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Informações Adicionais:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {formData.informacoesAdicionais}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    onClick={handlePrevStep}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar e Editar
                  </Button>
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/portalbeneficio')}
                      className="flex items-center"
                    >
                      Cancelar
                    </Button>
                    
                    <Button 
                      className="flex items-center text-white px-8"
                      style={{ backgroundColor: "#1E3A8A" }}
                      onClick={handleConfirmSolicitation}
                    >
                      Confirmar Solicitação
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SolicitarBeneficio;