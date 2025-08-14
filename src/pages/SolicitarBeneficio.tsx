import { useState } from "react";
import { Home, Plus, Users, QrCode, Download, DollarSign, Eye, Utensils, Car, GraduationCap, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SolicitarBeneficio = () => {
  const [activeButton, setActiveButton] = useState("Solicitar Voucher");
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

  const handleProgramSelection = (programTitle: string) => {
    setSelectedPrograms(prev => 
      prev.includes(programTitle) 
        ? prev.filter(p => p !== programTitle)
        : [...prev, programTitle]
    );
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
    { number: 1, title: "Escolher Programa", subtitle: "Selecione o tipo de voucher", active: true },
    { number: 2, title: "Preencher Detalhes", subtitle: "Informações adicionais", active: false },
    { number: 3, title: "Revisar e Confirmar", subtitle: "Conferir dados antes do envio", active: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="text-white px-6 py-2" style={{
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Solicitar Voucher
          </h1>
          <p className="text-gray-600">
            Siga os passos abaixo para solicitar um novo voucher
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center mb-8 space-x-8">
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

        {/* Program Selection */}
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

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>
          <Button 
            style={{
              backgroundColor: "#1E3A8A"
            }}
            className="text-white hover:opacity-90 flex items-center space-x-2"
            disabled={selectedPrograms.length === 0}
          >
            <span>Próximo</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SolicitarBeneficio;