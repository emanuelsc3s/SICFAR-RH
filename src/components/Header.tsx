import { Search, Bell, Settings, LogOut, CheckCircle, Clock, XCircle, ClipboardCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { NotificacaoSolicitacao } from "@/types/notificacao";
import { carregarSolicitacoes, marcarTodasComoLidas } from "@/utils/solicitacoesStorage";
import { supabase } from "@/lib/supabase";

interface UsuarioPerfil {
  nomeVisual: string; // Nome visual do usuário (de tbusuario.usuario)
  nome: string; // Nome completo do funcionário (de tbfuncionario.nome)
  cargo?: string;
  email?: string; // Email do usuário (de auth.users.email)
  matricula?: string;
}

const Header = () => {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<NotificacaoSolicitacao[]>([]);
  const [isNotificacoesOpen, setIsNotificacoesOpen] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState<UsuarioPerfil | null>(null);
  const [isPerfilCarregando, setIsPerfilCarregando] = useState(true);
  const [isPerfilMenuOpen, setIsPerfilMenuOpen] = useState(false);

  // Carregar notificações do localStorage ao montar o componente
  useEffect(() => {
    carregarNotificacoesDoStorage();

    // Listener para sincronizar mudanças do localStorage
    const handleSolicitacoesAtualizadas = () => {
      carregarNotificacoesDoStorage();
    };

    window.addEventListener('solicitacoesAtualizadas', handleSolicitacoesAtualizadas);

    return () => {
      window.removeEventListener('solicitacoesAtualizadas', handleSolicitacoesAtualizadas);
    };
  }, []);

  // Carregar dados do usuário autenticado (tbusuario + tbfuncionario)
  useEffect(() => {
    let isMounted = true;
    let fallbackPerfil: UsuarioPerfil = {
      nomeVisual: 'Usuário',
      nome: 'Usuário',
      cargo: 'Colaborador',
      email: '',
      matricula: ''
    };

    const carregarDadosUsuario = async () => {
      setIsPerfilCarregando(true);

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          navigate('/login');
          return;
        }

        fallbackPerfil = {
          nomeVisual: session.user.user_metadata?.nome || session.user.email || 'Usuário',
          nome: session.user.user_metadata?.nome || session.user.email || 'Usuário',
          cargo: session.user.user_metadata?.cargo || 'Colaborador',
          email: session.user.email || '',
          matricula: session.user.user_metadata?.matricula || ''
        };

        // Busca o usuário na tbusuario pelo user_id do Supabase Auth
        // Faz join com tbfuncionario através do funcionario_id
        const { data: usuarios, error: usuarioError } = await supabase
          .from('tbusuario')
          .select(`
            usuario_id,
            usuario,
            funcionario_id,
            perfil_id,
            deletado,
            tbfuncionario:funcionario_id (
              matricula,
              cargo,
              nome
            )
          `)
          .eq('user_id', session.user.id)
          .eq('deletado', 'N')
          .limit(1);

        console.log('🔍 Query result:', {
          usuarios,
          usuarioError,
          count: usuarios?.length
        });

        if (usuarioError) {
          console.error("Erro ao buscar usuário:", usuarioError);
          throw usuarioError;
        }

        const usuario = usuarios?.[0];
        // O join retorna um array, então pegamos o primeiro elemento
        const funcionarioArray = usuario?.tbfuncionario as any;
        const funcionario = Array.isArray(funcionarioArray) ? funcionarioArray[0] : funcionarioArray;

        // Monta o perfil com os dados corretos
        // nomeVisual: tbusuario.usuario (nome visual do usuário)
        // nome: tbfuncionario.nome (nome completo do funcionário)
        // email: session.user.email (auth.users)
        // cargo e matrícula: tbfuncionario
        const perfil: UsuarioPerfil = {
          nomeVisual: usuario?.usuario || fallbackPerfil.nomeVisual || 'Usuário',
          nome: funcionario?.nome || fallbackPerfil.nome || 'Usuário',
          cargo: funcionario?.cargo || fallbackPerfil.cargo || 'Colaborador',
          email: session.user.email || fallbackPerfil.email || '',
          matricula: funcionario?.matricula || fallbackPerfil.matricula || ''
        };

        console.log('✅ Perfil do usuário:', {
          nomeVisual: perfil.nomeVisual,
          cargo: perfil.cargo,
          email: perfil.email,
          matricula: perfil.matricula
        });

        if (isMounted) {
          setPerfilUsuario(perfil);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);

        if (isMounted) {
          setPerfilUsuario(prev => prev || fallbackPerfil);
        }
      } finally {
        if (isMounted) {
          setIsPerfilCarregando(false);
        }
      }
    };

    carregarDadosUsuario();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const carregarNotificacoesDoStorage = () => {
    const dados = carregarSolicitacoes();
    setNotificacoes(dados);
  };

  // Contar notificações não lidas
  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  // Contar solicitações pendentes (que precisam de avaliação)
  const solicitacoesPendentes = notificacoes.filter(n => n.status === 'Pendente').length;

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

  // Retorna as iniciais do nome para o Avatar
  const getInitials = (nome: string): string => {
    if (!nome) return '??';
    const partes = nome.trim().split(' ').filter(Boolean);

    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }

    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
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

  const handleLogout = async () => {
    setIsPerfilMenuOpen(false);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao sair da aplicação:", error);
    } finally {
      localStorage.removeItem('colaboradorLogado');
      navigate('/login');
    }
  };

  const nomeVisualExibicao = perfilUsuario?.nomeVisual || 'Usuário';
  const cargoExibicao = perfilUsuario?.cargo || 'Colaborador';
  const emailExibicao = perfilUsuario?.email || 'Email não encontrado';
  const matriculaExibicao = perfilUsuario?.matricula || 'Não informada';
  const avatarFallback = getInitials(nomeVisualExibicao);

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
                <div className="p-3 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      marcarTodasComoLidas();
                      carregarNotificacoesDoStorage();
                    }}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setIsNotificacoesOpen(false);
                      navigate('/autorizacaoautoatendimento');
                    }}
                    className="text-xs"
                  >
                    <ClipboardCheck className="w-4 h-4 mr-1" />
                    Avaliar Solicitações
                    {solicitacoesPendentes > 0 && (
                      <Badge className="ml-1 h-5 min-w-[20px] px-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs">
                        {solicitacoesPendentes}
                      </Badge>
                    )}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={() => navigate('/configuracao')}>
            <Settings className="h-5 w-5" />
          </Button>

          <DropdownMenu open={isPerfilMenuOpen} onOpenChange={setIsPerfilMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center space-x-3 pl-3 border-l border-border/50 hover:bg-muted/40 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {isPerfilCarregando ? 'Carregando...' : nomeVisualExibicao}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPerfilCarregando ? ' ' : cargoExibicao}
                  </p>
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none break-all">{emailExibicao}</p>
                  <p className="text-xs leading-none text-muted-foreground">Matrícula: {matriculaExibicao}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => handleLogout()}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
