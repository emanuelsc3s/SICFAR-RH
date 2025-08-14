import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Search, 
  DollarSign, 
  Calendar,
  User,
  FileText,
  Home,
  Plus,
  Users,
  QrCode,
  Download,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BeneficioFaturaDetalhe = () => {
  const { faturaId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Dados mockados da fatura específica
  const faturaInfo = {
    1: {
      parceiro: "Farmacia Santa Cecilia",
      referencia: "2024-01",
      valorTotal: 1500.00,
      status: "Em Revisão",
      dataCriacao: "31/01/2024"
    },
    2: {
      parceiro: "Farmacia Gentil", 
      referencia: "2024-01",
      valorTotal: 2400.00,
      status: "Aprovada",
      dataCriacao: "30/01/2024"
    },
    3: {
      parceiro: "Distribuidora Gás Butano",
      referencia: "2024-01", 
      valorTotal: 750.00,
      status: "Contestada",
      dataCriacao: "29/01/2024"
    }
  };

  // Dados mockados dos vouchers por fatura
  const vouchersPorFatura = {
    1: [
      {
        id: "VCH-00154832",
        funcionario: "Ana Silva Santos",
        cpf: "123.456.789-00",
        valor: 500.00,
        dataResgate: "15/01/2024",
        horaResgate: "14:30"
      },
      {
        id: "VCH-00154833", 
        funcionario: "Carlos Eduardo Lima",
        cpf: "987.654.321-00",
        valor: 500.00,
        dataResgate: "16/01/2024",
        horaResgate: "10:15"
      },
      {
        id: "VCH-00154834",
        funcionario: "Maria José Oliveira", 
        cpf: "456.789.123-00",
        valor: 500.00,
        dataResgate: "18/01/2024",
        horaResgate: "16:45"
      }
    ],
    2: [
      {
        id: "VCH-00154835",
        funcionario: "João Pedro Souza",
        cpf: "321.654.987-00", 
        valor: 300.00,
        dataResgate: "12/01/2024",
        horaResgate: "09:20"
      },
      {
        id: "VCH-00154836",
        funcionario: "Fernanda Costa Alves",
        cpf: "789.123.456-00",
        valor: 300.00,
        dataResgate: "14/01/2024", 
        horaResgate: "11:30"
      },
      {
        id: "VCH-00154837",
        funcionario: "Roberto Silva Nunes",
        cpf: "159.753.486-00",
        valor: 300.00,
        dataResgate: "15/01/2024",
        horaResgate: "13:15"
      },
      {
        id: "VCH-00154838",
        funcionario: "Juliana Santos Lima",
        cpf: "654.987.321-00",
        valor: 300.00,
        dataResgate: "17/01/2024",
        horaResgate: "15:45"
      },
      {
        id: "VCH-00154839",
        funcionario: "André Oliveira Costa",
        cpf: "852.741.963-00",
        valor: 300.00,
        dataResgate: "19/01/2024",
        horaResgate: "08:30"
      },
      {
        id: "VCH-00154840",
        funcionario: "Patricia Lima Santos",
        cpf: "741.852.963-00",
        valor: 300.00,
        dataResgate: "20/01/2024",
        horaResgate: "12:00"
      },
      {
        id: "VCH-00154841",
        funcionario: "Ricardo Souza Alves",
        cpf: "963.852.741-00",
        valor: 300.00,
        dataResgate: "22/01/2024",
        horaResgate: "17:20"
      },
      {
        id: "VCH-00154842",
        funcionario: "Camila Costa Oliveira",
        cpf: "147.258.369-00",
        valor: 300.00,
        dataResgate: "25/01/2024",
        horaResgate: "14:10"
      }
    ],
    3: [
      {
        id: "VCH-00154843",
        funcionario: "Eduardo Santos Silva",
        cpf: "258.369.147-00",
        valor: 150.00,
        dataResgate: "10/01/2024",
        horaResgate: "10:00"
      },
      {
        id: "VCH-00154844", 
        funcionario: "Luciana Alves Costa",
        cpf: "369.147.258-00",
        valor: 150.00,
        dataResgate: "11/01/2024",
        horaResgate: "16:30"
      },
      {
        id: "VCH-00154845",
        funcionario: "Marcos Lima Souza",
        cpf: "147.369.258-00",
        valor: 150.00,
        dataResgate: "13/01/2024",
        horaResgate: "09:45"
      },
      {
        id: "VCH-00154846",
        funcionario: "Gabriela Costa Santos",
        cpf: "258.147.369-00",
        valor: 150.00,
        dataResgate: "16/01/2024",
        horaResgate: "11:15"
      },
      {
        id: "VCH-00154847",
        funcionario: "Felipe Oliveira Lima",
        cpf: "369.258.147-00",
        valor: 150.00,
        dataResgate: "21/01/2024",
        horaResgate: "15:00"
      }
    ]
  };

  const fatura = faturaInfo[Number(faturaId) as keyof typeof faturaInfo];
  const vouchers = vouchersPorFatura[Number(faturaId) as keyof typeof vouchersPorFatura] || [];

  const filteredVouchers = vouchers.filter(voucher =>
    voucher.funcionario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalVouchers: vouchers.length,
    valorTotal: vouchers.reduce((sum, voucher) => sum + voucher.valor, 0),
    funcionarios: new Set(vouchers.map(v => v.funcionario)).size
  };

  if (!fatura) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Fatura não encontrada</h1>
            <Button onClick={() => navigate("/beneficiofaturas")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Faturas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Em Revisão":
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Em Revisão</Badge>;
      case "Aprovada":
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Aprovada</Badge>;
      case "Contestada":
        return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Contestada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
            {[
              { name: "Início", icon: Home },
              { name: "Solicitar Voucher", icon: Plus },
              { name: "Dashboard RH", icon: Users },
              { name: "Scanner Parceiro", icon: QrCode },
              { name: "Resgates", icon: Download },
              { name: "Faturas", icon: DollarSign },
              { name: "Auditoria", icon: Eye }
            ].map((button, index) => (
              <Button 
                key={index}
                variant="ghost" 
                className={`transition-colors px-3 py-2 text-sm ${
                  button.name === "Faturas"
                    ? "bg-white/30 text-white border-b-2 border-white/60" 
                    : "text-white hover:bg-white/20 hover:text-white"
                }`}
              >
                <button.icon className="w-4 h-4 mr-2" />
                {button.name}
              </Button>
            ))}
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        {/* Breadcrumb e botão voltar */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/beneficiofaturas")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Faturas
          </Button>
        </div>

        {/* Informações da Fatura */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{fatura.parceiro}</CardTitle>
                <CardDescription className="text-lg">
                  Referência: {fatura.referencia} • Criada em {fatura.dataCriacao}
                </CardDescription>
              </div>
              <div className="text-right">
                {getStatusBadge(fatura.status)}
                <div className="text-2xl font-bold mt-2">
                  R$ {fatura.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Cards de estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Vouchers
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVouchers}</div>
              <p className="text-xs text-muted-foreground">Vouchers resgatados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Valor dos vouchers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Funcionários
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.funcionarios}</div>
              <p className="text-xs text-muted-foreground">Funcionários únicos</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Vouchers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Vouchers Resgatados</CardTitle>
            <CardDescription>Detalhes de todos os vouchers desta fatura</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Campo de busca */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por funcionário ou ID do voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabela de vouchers */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Voucher</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data Resgate</TableHead>
                    <TableHead>Hora Resgate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell className="font-medium font-mono">{voucher.id}</TableCell>
                      <TableCell>{voucher.funcionario}</TableCell>
                      <TableCell className="font-mono">{voucher.cpf}</TableCell>
                      <TableCell className="font-medium">
                        R$ {voucher.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {voucher.dataResgate}
                        </div>
                      </TableCell>
                      <TableCell>{voucher.horaResgate}</TableCell>
                    </TableRow>
                  ))}
                  {filteredVouchers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum voucher encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BeneficioFaturaDetalhe;