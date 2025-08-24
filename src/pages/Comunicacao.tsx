import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Filter, Newspaper, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoticiaInterna } from '@/types/comunicacao';
import { getNoticiasInternas, incrementarVisualizacao } from '@/utils/localStorage';
import NewsCard from '@/components/NewsCard';

const Comunicacao = () => {
  const navigate = useNavigate();
  const [noticiasInternas, setNoticiasInternas] = useState<NoticiaInterna[]>([]);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [prioridadeFiltro, setPrioridadeFiltro] = useState('todas');

  useEffect(() => {
    carregarNoticias();
  }, []);

  const carregarNoticias = () => {
    const noticias = getNoticiasInternas().filter(n => n.status === 'publicado');
    setNoticiasInternas(noticias);
  };

  const noticiasFiltradas = useMemo(() => {
    return noticiasInternas.filter(noticia => {
      const matchBusca = noticia.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                        noticia.resumo.toLowerCase().includes(busca.toLowerCase());
      const matchCategoria = categoriaFiltro === 'todas' || noticia.categoria === categoriaFiltro;
      const matchPrioridade = prioridadeFiltro === 'todas' || noticia.prioridade === prioridadeFiltro;
      
      return matchBusca && matchCategoria && matchPrioridade;
    }).sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime());
  }, [noticiasInternas, busca, categoriaFiltro, prioridadeFiltro]);

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-destructive text-destructive-foreground';
      case 'media': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleVisualizarNoticia = (noticia: NoticiaInterna) => {
    incrementarVisualizacao(noticia.id);
    // Aqui você pode adicionar navegação para página detalhada da notícia
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comunicação</h1>
              <p className="text-muted-foreground">Centro de comunicação interna e externa</p>
            </div>
            
            <Button 
              onClick={() => navigate('/comunicacao/admin')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Área Administrativa
            </Button>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar notícias..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Categorias</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="Corporativo">Corporativo</SelectItem>
                    <SelectItem value="Comunicados">Comunicados</SelectItem>
                    <SelectItem value="Eventos">Eventos</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={prioridadeFiltro} onValueChange={setPrioridadeFiltro}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Prioridades</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="internas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="internas">Notícias Internas</TabsTrigger>
            <TabsTrigger value="externas">Notícias Externas</TabsTrigger>
          </TabsList>

          <TabsContent value="internas" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Notícias Internas ({noticiasFiltradas.length})</h2>
              <Button 
                onClick={() => navigate('/comunicacao/admin')}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Notícia
              </Button>
            </div>
            
            {noticiasFiltradas.length === 0 ? (
              <Card className="p-8 text-center">
                <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma notícia encontrada</h3>
                <p className="text-muted-foreground">
                  {noticiasInternas.length === 0 
                    ? 'Ainda não há notícias internas publicadas.'
                    : 'Tente ajustar os filtros para encontrar notícias.'
                  }
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {noticiasFiltradas.map((noticia) => (
                  <Card 
                    key={noticia.id} 
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleVisualizarNoticia(noticia)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2">
                          <Badge variant="outline">{noticia.categoria}</Badge>
                          <Badge className={getPrioridadeColor(noticia.prioridade)}>
                            {noticia.prioridade === 'alta' && 'Alta'}
                            {noticia.prioridade === 'media' && 'Média'}
                            {noticia.prioridade === 'baixa' && 'Baixa'}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatarData(noticia.dataPublicacao)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                        {noticia.titulo}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {noticia.resumo}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Por: {noticia.autor}</span>
                        <span>{noticia.visualizacoes} visualizações</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="externas">
            <div className="max-w-sm">
              <NewsCard />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Comunicacao;