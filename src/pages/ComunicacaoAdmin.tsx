import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { NoticiaInterna } from '@/types/comunicacao';
import { getNoticiasInternas, salvarNoticiaInterna, deletarNoticiaInterna } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';

const ComunicacaoAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [noticias, setNoticias] = useState<NoticiaInterna[]>([]);
  const [busca, setBusca] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noticiaEditando, setNoticiaEditando] = useState<NoticiaInterna | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    resumo: '',
    conteudo: '',
    categoria: 'Comunicados' as 'RH' | 'TI' | 'Corporativo' | 'Comunicados' | 'Eventos',
    prioridade: 'media' as 'baixa' | 'media' | 'alta',
    status: 'rascunho' as 'rascunho' | 'publicado' | 'arquivado',
    autor: 'Administrador'
  });

  useEffect(() => {
    carregarNoticias();
  }, []);

  const carregarNoticias = () => {
    const todasNoticias = getNoticiasInternas();
    setNoticias(todasNoticias.sort((a, b) => 
      new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime()
    ));
  };

  const noticiasFiltradas = noticias.filter(noticia => 
    noticia.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    noticia.resumo.toLowerCase().includes(busca.toLowerCase()) ||
    noticia.autor.toLowerCase().includes(busca.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      titulo: '',
      resumo: '',
      conteudo: '',
      categoria: 'Comunicados' as 'RH' | 'TI' | 'Corporativo' | 'Comunicados' | 'Eventos',
      prioridade: 'media' as 'baixa' | 'media' | 'alta',
      status: 'rascunho' as 'rascunho' | 'publicado' | 'arquivado',
      autor: 'Administrador'
    });
    setNoticiaEditando(null);
  };

  const handleSalvar = () => {
    if (!formData.titulo.trim() || !formData.resumo.trim() || !formData.conteudo.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const agora = new Date().toISOString();
    const noticia: NoticiaInterna = {
      id: noticiaEditando?.id || crypto.randomUUID(),
      titulo: formData.titulo,
      resumo: formData.resumo,
      conteudo: formData.conteudo,
      categoria: formData.categoria,
      prioridade: formData.prioridade,
      status: formData.status,
      autor: formData.autor,
      dataPublicacao: (formData.status === 'publicado' && !noticiaEditando) ? agora : (noticiaEditando?.dataPublicacao || agora),
      dataCriacao: noticiaEditando?.dataCriacao || agora,
      dataAtualizacao: agora,
      visualizacoes: noticiaEditando?.visualizacoes || 0
    };

    salvarNoticiaInterna(noticia);
    carregarNoticias();
    setIsDialogOpen(false);
    resetForm();

    toast({
      title: "Sucesso",
      description: `Notícia ${noticiaEditando ? 'atualizada' : 'criada'} com sucesso!`
    });
  };

  const handleEditar = (noticia: NoticiaInterna) => {
    setNoticiaEditando(noticia);
    setFormData({
      titulo: noticia.titulo,
      resumo: noticia.resumo,
      conteudo: noticia.conteudo,
      categoria: noticia.categoria,
      prioridade: noticia.prioridade,
      status: noticia.status,
      autor: noticia.autor
    });
    setIsDialogOpen(true);
  };

  const handleDeletar = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta notícia?')) {
      deletarNoticiaInterna(id);
      carregarNoticias();
      toast({
        title: "Sucesso",
        description: "Notícia deletada com sucesso!"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publicado': return 'bg-success text-success-foreground';
      case 'rascunho': return 'bg-warning text-warning-foreground';
      case 'arquivado': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-destructive text-destructive-foreground';
      case 'media': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/comunicacao')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-foreground">Administração - Comunicação</h1>
              <p className="text-muted-foreground">Gerencie notícias internas e comunicados</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notícias..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Notícia
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {noticiaEditando ? 'Editar Notícia' : 'Nova Notícia'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                      placeholder="Título da notícia"
                    />
                  </div>

                  <div>
                    <Label htmlFor="resumo">Resumo *</Label>
                    <Textarea
                      id="resumo"
                      value={formData.resumo}
                      onChange={(e) => setFormData({...formData, resumo: e.target.value})}
                      placeholder="Resumo da notícia (máx. 200 caracteres)"
                      maxLength={200}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="conteudo">Conteúdo *</Label>
                    <Textarea
                      id="conteudo"
                      value={formData.conteudo}
                      onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                      placeholder="Conteúdo completo da notícia"
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Categoria</Label>
                      <Select 
                        value={formData.categoria} 
                        onValueChange={(value: any) => setFormData({...formData, categoria: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RH">RH</SelectItem>
                          <SelectItem value="TI">TI</SelectItem>
                          <SelectItem value="Corporativo">Corporativo</SelectItem>
                          <SelectItem value="Comunicados">Comunicados</SelectItem>
                          <SelectItem value="Eventos">Eventos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Prioridade</Label>
                      <Select 
                        value={formData.prioridade} 
                        onValueChange={(value: any) => setFormData({...formData, prioridade: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: any) => setFormData({...formData, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rascunho">Rascunho</SelectItem>
                          <SelectItem value="publicado">Publicado</SelectItem>
                          <SelectItem value="arquivado">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="autor">Autor</Label>
                      <Input
                        id="autor"
                        value={formData.autor}
                        onChange={(e) => setFormData({...formData, autor: e.target.value})}
                        placeholder="Nome do autor"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSalvar}>
                      {noticiaEditando ? 'Atualizar' : 'Salvar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Notícias ({noticiasFiltradas.length})</h2>
          </div>

          {noticiasFiltradas.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma notícia encontrada</h3>
              <p className="text-muted-foreground">
                {noticias.length === 0 
                  ? 'Comece criando sua primeira notícia interna.'
                  : 'Tente ajustar a busca para encontrar notícias.'
                }
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {noticiasFiltradas.map((noticia) => (
                <Card key={noticia.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2">
                        <Badge variant="outline">{noticia.categoria}</Badge>
                        <Badge className={getStatusColor(noticia.status)}>
                          {noticia.status}
                        </Badge>
                        <Badge className={getPrioridadeColor(noticia.prioridade)}>
                          {noticia.prioridade}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditar(noticia)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeletar(noticia.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{noticia.titulo}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {noticia.resumo}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex gap-4">
                        <span>Por: {noticia.autor}</span>
                        <span>Criado: {formatarData(noticia.dataCriacao)}</span>
                        {noticia.dataAtualizacao !== noticia.dataCriacao && (
                          <span>Atualizado: {formatarData(noticia.dataAtualizacao)}</span>
                        )}
                      </div>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {noticia.visualizacoes}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ComunicacaoAdmin;