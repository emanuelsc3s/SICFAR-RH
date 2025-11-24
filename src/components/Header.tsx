import { Search, Bell, Settings, User, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { NotificacaoSolicitacao, gerarNotificacoesExemplo } from "@/types/notificacao";

const Header = () => {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<NotificacaoSolicitacao[]>(gerarNotificacoesExemplo());
  const [isNotificacoesOpen, setIsNotificacoesOpen] = useState(false);

  // Contar notificações não lidas
  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  // Função para obter o ícone e cor do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Rejeitada':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Função para obter badge do status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">{status}</Badge>;
      case 'Pendente':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">{status}</Badge>;
      case 'Rejeitada':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Função para formatar data
  const formatarData = (dataStr: string): string => {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
  };

  // Função para marcar notificação como lida
  const marcarComoLida = (id: string) => {
    setNotificacoes(prev =>
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    );
  };

  return (
    <header className="bg-card border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo e Title */}
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg flex items-center justify-center p-1" style={{ width: '149.98px', height: '68.97px' }}>
            <img src="/farmace-logo.png" alt="Farmace Logo" className="object-contain" style={{
            width: '149.98px',
            height: '68.97px'
          }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Portal Corporativo</h1>
            <p className="text-sm text-muted-foreground">Intranet & Recursos Humanos</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Buscar funcionários, documentos, políticas..." className="pl-10 bg-muted/50 border-border/50" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Botão de Notificações com Popover */}
          <Popover open={isNotificacoesOpen} onOpenChange={setIsNotificacoesOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6" />
                {notificacoesNaoLidas > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
                    {notificacoesNaoLidas}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[800px] p-0" align="end">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Notificações de Solicitações</h3>
                <p className="text-sm text-muted-foreground">
                  {notificacoesNaoLidas > 0
                    ? `Você tem ${notificacoesNaoLidas} notificação${notificacoesNaoLidas > 1 ? 'ões' : ''} não lida${notificacoesNaoLidas > 1 ? 's' : ''}`
                    : 'Todas as notificações foram lidas'
                  }
                </p>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Matrícula</TableHead>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Solicitação</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[100px]">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notificacoes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhuma notificação disponível
                        </TableCell>
                      </TableRow>
                    ) : (
                      notificacoes.map((notificacao) => (
                        <TableRow
                          key={notificacao.id}
                          className={`cursor-pointer ${!notificacao.lida ? 'bg-muted/30' : ''}`}
                          onClick={() => marcarComoLida(notificacao.id)}
                        >
                          <TableCell className="font-mono text-sm">{notificacao.matricula}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {!notificacao.lida && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                              {notificacao.colaborador}
                            </div>
                          </TableCell>
                          <TableCell>{notificacao.solicitacao}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(notificacao.status)}
                              {getStatusBadge(notificacao.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatarData(notificacao.datasolicitacao)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {notificacoes.length > 0 && (
                <div className="p-3 border-t bg-muted/20 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
                    }}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={() => navigate('/configuracao')}>
            <Settings className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-3 pl-3 border-l border-border/50">
            <div className="text-right">
              <p className="text-sm font-medium">Emanuel Silva</p>
              <p className="text-xs text-muted-foreground">Gerente de TI</p>
            </div>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">AS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;