import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  DollarSign,
  Calendar,
  User,
  FileText,
  Download,
  Home,
  Plus,
  Users,
  QrCode,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { buscarVouchersPorParceiro } from "@/utils/voucherStorage";

// Interface para o tipo Voucher
interface Voucher {
  id: string;
  funcionario: string;
  cpf: string;
  valor: number;
  dataResgate: string;
  horaResgate: string;
}

const BeneficioFaturaDetalhe = () => {
  const { faturaId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [motivoContestacao, setMotivoContestacao] = useState("");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // Dados mockados da fatura específica - Apenas Farmacia Santa Cecilia
  const [faturaInfo, setFaturaInfo] = useState({
    1: {
      parceiro: "Farmacia Santa Cecilia",
      referencia: "2024-01",
      valorTotal: 1500.00,
      status: "Em Revisão",
      dataCriacao: "31/01/2024"
    }
  });

  const fatura = faturaInfo[Number(faturaId) as keyof typeof faturaInfo];

  // Carregar vouchers do localStorage quando o componente montar ou faturaId mudar
  useEffect(() => {
    // Dados mockados de fallback (caso não haja vouchers no localStorage)
    const vouchersMockados: Voucher[] = [
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
    ];

    const carregarVouchers = () => {
      if (Number(faturaId) === 1) {
        // Buscar vouchers da Farmacia Santa Cecilia no localStorage
        const vouchersLocalStorage = buscarVouchersPorParceiro("Farmacia Santa Cecilia");

        // Também buscar por variações do nome
        const vouchersVariacao1 = buscarVouchersPorParceiro("Vale Farmácia Santa Cecília");
        const vouchersVariacao2 = buscarVouchersPorParceiro("Farmácia Santa Cecília");

        // Combinar todos os vouchers encontrados
        const todosVouchers = [
          ...vouchersLocalStorage,
          ...vouchersVariacao1,
          ...vouchersVariacao2
        ];

        // Remover duplicatas baseado no ID
        const vouchersUnicos = todosVouchers.filter((voucher, index, self) =>
          index === self.findIndex((v) => v.id === voucher.id)
        );

        if (vouchersUnicos.length > 0) {
          console.log(`✅ ${vouchersUnicos.length} vouchers carregados do localStorage para Farmacia Santa Cecilia`);
          setVouchers(vouchersUnicos);
        } else {
          console.log('⚠️ Nenhum voucher encontrado no localStorage. Usando dados mockados.');
          setVouchers(vouchersMockados);
        }
      } else {
        // Para outras faturas (se houver no futuro), usar array vazio
        setVouchers([]);
      }
    };

    carregarVouchers();

    // Configurar listener para atualizar quando novos vouchers forem emitidos
    const handleVoucherEmitido = () => {
      console.log('🔄 Novo voucher emitido, recarregando lista...');
      carregarVouchers();
    };

    window.addEventListener('voucherEmitido', handleVoucherEmitido);

    return () => {
      window.removeEventListener('voucherEmitido', handleVoucherEmitido);
    };
  }, [faturaId]);

  const handleContestFatura = () => {
    setDialogOpen(true);
  };

  const confirmContestFatura = () => {
    if (motivoContestacao.trim()) {
      setFaturaInfo(prevFaturaInfo => ({
        ...prevFaturaInfo,
        [Number(faturaId)]: {
          ...prevFaturaInfo[Number(faturaId) as keyof typeof prevFaturaInfo],
          status: "Contestada"
        }
      }));
      setDialogOpen(false);
      setMotivoContestacao("");
    }
  };

  const exportToCSV = () => {
    // Cabeçalho do CSV
    const headers = [
      "Parceiro",
      "Referência",
      "Status Fatura",
      "Data Criação",
      "Valor Total Fatura",
      "ID Voucher",
      "Funcionário",
      "CPF",
      "Valor Voucher",
      "Data Resgate",
      "Hora Resgate"
    ];

    // Dados da fatura combinados com vouchers
    const csvData = vouchers.map(voucher => [
      fatura.parceiro,
      fatura.referencia,
      fatura.status,
      fatura.dataCriacao,
      `R$ ${fatura.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      voucher.id,
      voucher.funcionario,
      voucher.cpf,
      `R$ ${voucher.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      voucher.dataResgate,
      voucher.horaResgate
    ]);

    // Criar conteúdo CSV
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `fatura_${fatura.parceiro.replace(/\s+/g, "_")}_${fatura.referencia}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/beneficiofaturas")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Faturas
            </Button>
            
            <div className="flex space-x-3">
              {fatura.status !== "Contestada" && (
                <Button 
                  variant="outline" 
                  className="mb-4 bg-orange-600 text-white border-orange-600 hover:bg-orange-700 hover:border-orange-700"
                  onClick={handleContestFatura}
                >
                  Contestar Fatura
                </Button>
              )}
              
              <Button 
                className="mb-4 text-white hover:opacity-90"
                style={{ backgroundColor: "#1E3A8A" }}
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
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
                        {voucher.dataResgate ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {voucher.dataResgate}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {voucher.horaResgate ? (
                          voucher.horaResgate
                        ) : (
                          <span className="text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
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

        {/* Modal de Contestação */}
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Contestar Fatura</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja realmente contestar esta fatura? Por favor, informe o motivo da contestação.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="motivo" className="text-sm font-medium">
                Motivo da Contestação
              </Label>
              <Textarea
                id="motivo"
                placeholder="Descreva o motivo da contestação..."
                value={motivoContestacao}
                onChange={(e) => setMotivoContestacao(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDialogOpen(false);
                setMotivoContestacao("");
              }}>
                Não
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmContestFatura}
                disabled={!motivoContestacao.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Sim, Contestar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default BeneficioFaturaDetalhe;