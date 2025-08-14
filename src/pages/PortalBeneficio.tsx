import { Gift, DollarSign, Clock, Utensils, Car, GraduationCap, Home, Plus, Users, QrCode, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const PortalBeneficio = () => {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("Início");

  const navigationButtons = [
    { name: "Início", icon: Home },
    { name: "Solicitar Voucher", icon: Plus },
    { name: "Dashboard RH", icon: Users },
    { name: "Scanner Parceiro", icon: QrCode },
    { name: "Resgates", icon: Download },
    { name: "Faturas", icon: DollarSign },
    { name: "Auditoria", icon: Eye }
  ];

  const statsData = [{
    title: "Vouchers Ativos",
    value: "1",
    description: "Disponíveis para uso",
    icon: Gift,
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    customBorderColor: "#1E3A8A"
  }, {
    title: "Valor Total",
    value: "R$ 500,00",
    description: "Em vouchers ativos",
    icon: DollarSign,
    color: "bg-green-500",
    borderColor: "border-green-500"
  }, {
    title: "Solicitações Pendentes",
    value: "0",
    description: "Aguardando aprovação",
    icon: Clock,
    color: "bg-yellow-500",
    borderColor: "border-yellow-500"
  }];
  const programasDisponiveis = [{
    title: "Vale Alimentação",
    description: "Benefício para alimentação e refeições",
    value: "R$ 500,00",
    icon: Utensils
  }, {
    title: "Vale Transporte",
    description: "Auxílio para deslocamento urbano",
    value: "R$ 150,00",
    icon: Car
  }, {
    title: "Vale Educação",
    description: "Investimento em cursos e capacitação",
    value: "R$ 1.000,00",
    icon: GraduationCap
  }];
  const meusVouchers = [{
    title: "Vale Alimentação",
    value: "R$ 500,00",
    expiry: "14/02/2024",
    status: "Emitido",
    statusColor: "bg-blue-100 text-blue-800"
  }, {
    title: "Vale Transporte",
    value: "R$ 150,00",
    expiry: "09/02/2024",
    status: "Resgatado",
    statusColor: "bg-blue-100 text-blue-800"
  }];
  return <div className="min-h-screen bg-background">
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
            {navigationButtons.map((button, index) => (
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
                {button.icon && <button.icon className="w-4 h-4 mr-2" />}
                {button.name}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao Portal de Benefícios
          </h1>
          <p className="text-gray-600 mb-6">
            Gerencie seus vouchers de benefícios de forma simples e rápida
          </p>
          <Button 
            style={{
              backgroundColor: "#1E3A8A"
            }} 
            className="text-white hover:opacity-90"
            onClick={() => navigate('/solicitarbeneficio')}
          >
            <Gift className="w-4 h-4 mr-2" />
            Solicitar Novo Voucher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsData.map((stat, index) => <Card key={index} className="border-b-4" style={{
          borderBottomColor: stat.customBorderColor || ""
        }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`} style={stat.title === "Vouchers Ativos" ? {
                backgroundColor: "#1E3A8A"
              } : {}}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Programas Disponíveis */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Programas Disponíveis</h2>
            <div className="space-y-4">
              {programasDisponiveis.map((programa, index) => <Card key={index} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <programa.icon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{programa.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{programa.description}</p>
                          <p className="font-bold text-gray-900">{programa.value}</p>
                        </div>
                      </div>
                      <Button style={{
                    backgroundColor: "#1E3A8A"
                  }} className="text-white hover:opacity-90">
                        Solicitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>

          {/* Meus Vouchers */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Meus Vouchers</h2>
              <Button variant="ghost" style={{
              color: "#1E3A8A"
            }} className="hover:opacity-80">
                Ver Todos
              </Button>
            </div>
            <div className="space-y-4">
              {meusVouchers.map((voucher, index) => <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{voucher.title}</h3>
                          <Badge style={{
                        backgroundColor: "#1E3A8A20",
                        color: "#1E3A8A"
                      }}>
                            {voucher.status}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-gray-900 mb-1">{voucher.value}</p>
                        <p className="text-sm text-gray-600">Expira em {voucher.expiry}</p>
                      </div>
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <Gift className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default PortalBeneficio;