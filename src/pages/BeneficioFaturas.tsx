import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Trash2,
  Check,
  XCircle,
  Home,
  Plus,
  Users,
  QrCode,
  Download
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BeneficioFaturas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFaturaId, setSelectedFaturaId] = useState<number | null>(null);

  // Dados mockados das faturas
  const [faturas, setFaturas] = useState([
    {
      id: 1,
      parceiro: "Farmacia Santa Cecilia",
      referencia: "2024-01",
      qtdVouchers: 3,
      valorTotal: 1500.00,
      status: "Em Revisão",
      dataCriacao: "31/01/2024"
    },
    {
      id: 2,
      parceiro: "Farmacia Gentil",
      referencia: "2024-01",
      qtdVouchers: 8,
      valorTotal: 2400.00,
      status: "Aprovada",
      dataCriacao: "30/01/2024"
    },
    {
      id: 3,
      parceiro: "Distribuidora Gás Butano",
      referencia: "2024-01",
      qtdVouchers: 5,
      valorTotal: 750.00,
      status: "Contestada",
      dataCriacao: "29/01/2024"
    }
  ]);

  const stats = {
    totalFaturas: faturas.length,
    valorTotal: faturas.reduce((sum, fatura) => sum + fatura.valorTotal, 0),
    contestadas: faturas.filter(f => f.status === "Contestada").length,
    aprovadas: faturas.filter(f => f.status === "Aprovada").length
  };

  const filteredFaturas = faturas.filter(fatura =>
    fatura.parceiro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContestFatura = (faturaId: number) => {
    setSelectedFaturaId(faturaId);
    setDialogOpen(true);
  };

  const confirmContestFatura = () => {
    if (selectedFaturaId !== null) {
      setFaturas(prevFaturas =>
        prevFaturas.map(fatura =>
          fatura.id === selectedFaturaId
            ? { ...fatura, status: "Contestada" }
            : fatura
        )
      );
    }
    setDialogOpen(false);
    setSelectedFaturaId(null);
  };

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
                onClick={() => {
                  if (button.name === "Início") {
                    navigate("/");
                  }
                }}
              >
                <button.icon className="w-4 h-4 mr-2" />
                {button.name}
              </Button>
            ))}
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        {/* Cabeçalho da página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Faturas</h1>
          <p className="text-muted-foreground">Revise e aprove faturas de parceiros</p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Faturas
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFaturas}</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">A pagar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contestadas
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contestadas}</div>
              <p className="text-xs text-muted-foreground">Requer atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprovadas
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.aprovadas}</div>
              <p className="text-xs text-muted-foreground">Prontas para pagamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Faturas Recebidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Faturas Recebidas</CardTitle>
            <CardDescription>Lista de todas as faturas dos parceiros</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Campo de busca */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por parceiro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabela de faturas */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Qtd Vouchers</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaturas.map((fatura) => (
                    <TableRow key={fatura.id}>
                      <TableCell className="font-medium">{fatura.parceiro}</TableCell>
                      <TableCell>{fatura.referencia}</TableCell>
                      <TableCell>{fatura.qtdVouchers}</TableCell>
                      <TableCell>
                        R$ {fatura.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{getStatusBadge(fatura.status)}</TableCell>
                      <TableCell>{fatura.dataCriacao}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/beneficiofaturadetalhe/${fatura.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleContestFatura(fatura.id)}
                            disabled={fatura.status === "Contestada"}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Confirmação */}
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Contestar Fatura</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja realmente marcar esta fatura como contestada? Esta ação irá alterar o status da fatura para "Contestada".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Não</AlertDialogCancel>
              <AlertDialogAction onClick={confirmContestFatura}>
                Sim
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default BeneficioFaturas;