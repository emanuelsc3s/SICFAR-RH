import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Calendar, Search, Filter, RefreshCw, Clock } from "lucide-react";
import Header from "@/components/Header";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  category: string;
  contentSnippet: string;
  imageUrl: string;
  readTime: string;
}

interface RSSSource {
  name: string;
  url: string;
  category: string;
  color: string;
}

const rssSources: RSSSource[] = [
  {
    name: "G1 Ciência e Saúde",
    url: "https://g1.globo.com/rss/g1/ciencia-e-saude/",
    category: "Saúde",
    color: "bg-red-500"
  },
  {
    name: "Estadão Saúde",
    url: "https://estadao.com.br/arc/outboundfeed/rss/saude/",
    category: "Saúde", 
    color: "bg-blue-500"
  },
  {
    name: "Estadão Ciência",
    url: "https://estadao.com.br/arc/outboundfeed/rss/ciencia/",
    category: "Ciência",
    color: "bg-green-500"
  },
  {
    name: "R7 Notícias",
    url: "https://noticias.r7.com/feed.xml",
    category: "Geral",
    color: "bg-orange-500"
  }
];

// Termos farmacêuticos para filtrar notícias relevantes
const pharmaceuticalTerms = [
  "medicamento", "medicamentos", "remédio", "remédios", "fármaco", "fármacos",
  "anvisa", "registro", "aprovação", "laboratório", "laboratórios", "indústria farmacêutica",
  "genérico", "genéricos", "similar", "similares", "biológico", "biológicos",
  "princípio ativo", "bula", "posologia", "contraindicação", "efeito colateral",
  "vacina", "vacinas", "imunização", "sus", "ministério da saúde",
  "cmed", "preço", "patente", "oncologia", "cardiologia", "diabetes",
  "antibiótico", "anti-inflamatório", "analgésico", "antidepressivo"
];

const NoticiasExternas = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Função para verificar se uma notícia contém termos farmacêuticos
  const isPharmaceuticalContent = (text: string): boolean => {
    const normalizedText = text.toLowerCase();
    return pharmaceuticalTerms.some(term => normalizedText.includes(term.toLowerCase()));
  };

  // Função para obter categoria baseada no conteúdo
  const getContentCategory = (title: string, description: string): string => {
    const content = (title + " " + description).toLowerCase();
    
    if (content.includes("anvisa") || content.includes("registro") || content.includes("aprovação")) {
      return "Regulatório";
    }
    if (content.includes("medicamento") || content.includes("fármaco") || content.includes("remédio")) {
      return "Medicamentos";
    }
    if (content.includes("vacina") || content.includes("imunização")) {
      return "Vacinas";
    }
    if (content.includes("pesquisa") || content.includes("estudo") || content.includes("ensaio clínico")) {
      return "Pesquisa";
    }
    return "Saúde Geral";
  };

// Dados mock de notícias farmacêuticas brasileiras
  const generateMockNews = (): NewsItem[] => {
    const mockNews: NewsItem[] = [
      {
        title: "Primeiras canetas emagrecedoras nacionais estarão disponíveis em agosto",
        link: "https://summitsaude.estadao.com.br/tecnologia-na-saude/primeiras-canetas-emagrecedoras-nacionais-estarao-disponiveis-em-agosto/",
        pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: "Lançamento marca um passo inédito da indústria farmacêutica brasileira no combate à obesidade. A farmacêutica EMS prevê lançar em agosto as primeiras versões brasileiras de canetas para tratamento de diabetes tipo 2 e obesidade.",
        source: "Estadão Saúde",
        category: "Medicamentos",
        contentSnippet: "Lançamento marca um passo inédito da indústria farmacêutica brasileira no combate à obesidade. A farmacêutica EMS prevê lançar em agosto as primeiras versões brasileiras de canetas para tratamento de diabetes tipo 2 e obesidade com produção autorizada pela ANVISA...",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        readTime: "3 min"
      },
      {
        title: "Fiocruz fecha acordo para produzir canetas emagrecedoras no Brasil",
        link: "https://www.potiguarnoticias.com.br/noticias/61536/fiocruz-fecha-acordo-para-produzir-canetas-emagrecedoras-no-brasil",
        pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        description: "A Fundação Oswaldo Cruz (Fiocruz) e a farmacêutica EMS firmaram dois acordos de parceria para a produção de liraglutida e de semaglutida, princípios ativos de medicamentos agonistas GLP-1.",
        source: "Potiguar Notícias",
        category: "Regulatório",
        contentSnippet: "A Fundação Oswaldo Cruz (Fiocruz) e a farmacêutica EMS firmaram dois acordos de parceria para a produção de liraglutida e de semaglutida, princípios ativos de medicamentos agonistas GLP-1, popularmente conhecidos como canetas emagrecedoras...",
        imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        readTime: "4 min"
      },
      {
        title: "ANVISA apreende lotes de medicamentos falsos para diabetes e doença pulmonar",
        link: "https://bacananews.com.br/anvisa-apreende-lotes-de-medicamentos-falsos-para-diabetes-e-doenca-pulmonar/",
        pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        description: "A Agência Nacional de Vigilância Sanitária (ANVISA) ordenou a apreensão de lotes falsificados de dois medicamentos essenciais: Rybelsus, usado no tratamento de diabetes tipo 2, e Ofev, indicado para fibrose pulmonar.",
        source: "Bacana News",
        category: "Regulatório",
        contentSnippet: "Agência alerta sobre riscos de remédios falsificados e orienta como identificar produtos irregulares. A ANVISA ordenou a apreensão de lotes falsificados de Rybelsus e Ofev, medicamentos para diabetes e fibrose pulmonar...",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        readTime: "2 min"
      },
      {
        title: "ANVISA aprova primeira insulina semanal para tratar diabetes 1 e 2",
        link: "https://www.poder360.com.br/poder-saude/anvisa-aprova-1a-insulina-semanal-para-tratar-diabetes-1-e-2/",
        pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        description: "A ANVISA aprovou a primeira insulina semanal do mundo para o tratamento de pacientes adultos com diabetes tipo 1 e 2. Trata-se da medicação Awiqli, produzida pela farmacêutica Novo Nordisk.",
        source: "Poder360",
        category: "Medicamentos",
        contentSnippet: "Ainda não há data para lançamento no Brasil; farmacêutica afirma que programa demonstrou eficácia do medicamento. A ANVISA aprovou a primeira insulina semanal do mundo para diabetes tipo 1 e 2...",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        readTime: "5 min"
      },
      {
        title: "ANVISA assume posição de liderança em grupos do ICH e reforça protagonismo internacional",
        link: "https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2025/anvisa-assume-posicao-de-lideranca-em-grupos-do-ich-e-reforca-protagonismo-internacional",
        pubDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        description: "Agência passa a exercer um papel-chave nos debates sobre diretrizes internacionais que impactam diretamente o desenvolvimento, a avaliação e o uso seguro e eficaz de medicamentos em escala global.",
        source: "ANVISA",
        category: "Regulatório",
        contentSnippet: "A ANVISA assumiu a posição de Regulatory Chair em dois importantes grupos do ICH, reforçando o protagonismo brasileiro nas discussões sobre harmonização internacional de medicamentos...",
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        readTime: "4 min"
      },
      {
        title: "Ministério da Saúde amplia distribuição de medicamentos genéricos no SUS",
        link: "#",
        pubDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        description: "Sistema Único de Saúde expande programa de acesso a medicamentos genéricos, beneficiando milhões de brasileiros com tratamentos mais acessíveis.",
        source: "G1 Saúde",
        category: "Saúde Geral",
        contentSnippet: "Sistema Único de Saúde expande programa de acesso a medicamentos genéricos, beneficiando milhões de brasileiros com tratamentos mais acessíveis e de qualidade comprovada...",
        imageUrl: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        readTime: "3 min"
      },
      {
        title: "Nova vacina brasileira contra COVID-19 mostra resultados promissores",
        link: "#",
        pubDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: "Instituto Butantan apresenta resultados positivos dos ensaios clínicos da nova vacina nacional, com eficácia superior a 90% contra variantes circulantes.",
        source: "Estadão Ciência",
        category: "Vacinas",
        contentSnippet: "Instituto Butantan apresenta resultados positivos dos ensaios clínicos da nova vacina nacional, com eficácia superior a 90% contra variantes circulantes do vírus...",
        imageUrl: "https://images.unsplash.com/photo-1632053002881-b2eea14738b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        readTime: "6 min"
      },
      {
        title: "Pesquisa brasileira desenvolve novo medicamento para Alzheimer",
        link: "#",
        pubDate: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        description: "Universidade de São Paulo (USP) desenvolve composto inovador que demonstra eficácia na redução do declínio cognitivo em pacientes com Alzheimer inicial.",
        source: "R7 Ciência",
        category: "Pesquisa",
        contentSnippet: "Universidade de São Paulo desenvolve composto inovador que demonstra eficácia na redução do declínio cognitivo em pacientes com Alzheimer inicial, abrindo novas perspectivas terapêuticas...",
        imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        readTime: "7 min"
      }
    ];

    return mockNews;
  };

  // Função para salvar dados no localStorage
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  // Função para carregar dados do localStorage
  const loadFromLocalStorage = (key: string, defaultValue: any = null) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return defaultValue;
    }
  };

  // Função para buscar todas as notícias (usando dados mock)
  const fetchAllNews = async () => {
    setLoading(true);
    try {
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se há dados salvos no localStorage
      const savedNews = loadFromLocalStorage('farmace_noticias_externas');
      
      let newsData: NewsItem[];
      if (savedNews && savedNews.length > 0) {
        newsData = savedNews;
      } else {
        // Gerar dados mock e salvar no localStorage
        newsData = generateMockNews();
        saveToLocalStorage('farmace_noticias_externas', newsData);
      }
      
      setNews(newsData);
      setFilteredNews(newsData);
      setLastUpdate(new Date());
      saveToLocalStorage('farmace_last_update', new Date().toISOString());
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar notícias baseado nos critérios selecionados
  useEffect(() => {
    let filtered = news;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSource !== "all") {
      filtered = filtered.filter(item => item.source === selectedSource);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredNews(filtered);
  }, [searchTerm, selectedSource, selectedCategory, news]);

  // Buscar notícias ao carregar o componente e carregar preferências do localStorage
  useEffect(() => {
    fetchAllNews();
    
    // Carregar preferências de filtros do localStorage
    const savedSearchTerm = loadFromLocalStorage('farmace_search_term', '');
    const savedSource = loadFromLocalStorage('farmace_selected_source', 'all');
    const savedCategory = loadFromLocalStorage('farmace_selected_category', 'all');
    
    setSearchTerm(savedSearchTerm);
    setSelectedSource(savedSource);
    setSelectedCategory(savedCategory);
    
    // Carregar última data de atualização
    const savedLastUpdate = loadFromLocalStorage('farmace_last_update');
    if (savedLastUpdate) {
      setLastUpdate(new Date(savedLastUpdate));
    }
  }, []);

  // Salvar preferências de filtros no localStorage quando alteradas
  useEffect(() => {
    saveToLocalStorage('farmace_search_term', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    saveToLocalStorage('farmace_selected_source', selectedSource);
  }, [selectedSource]);

  useEffect(() => {
    saveToLocalStorage('farmace_selected_category', selectedCategory);
  }, [selectedCategory]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Regulatório": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "Medicamentos": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "Vacinas": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Pesquisa": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const uniqueSources = [...new Set(news.map(item => item.source))];
  const uniqueCategories = [...new Set(news.map(item => item.category))];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Notícias Farmacêuticas Externas
          </h1>
          <p className="text-muted-foreground">
            Monitoramento de notícias farmacêuticas de portais brasileiros via RSS
          </p>
          {lastUpdate && (
            <p className="text-sm text-muted-foreground mt-2">
              Última atualização: {lastUpdate.toLocaleString('pt-BR')}
            </p>
          )}
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Fontes</SelectItem>
                  {uniqueSources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={fetchAllNews} disabled={loading} className="w-full">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{filteredNews.length}</div>
              <div className="text-sm text-muted-foreground">Notícias Filtradas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{news.length}</div>
              <div className="text-sm text-muted-foreground">Total de Notícias</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{uniqueSources.length}</div>
              <div className="text-sm text-muted-foreground">Fontes Ativas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{uniqueCategories.length}</div>
              <div className="text-sm text-muted-foreground">Categorias</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Notícias */}
        <div className="space-y-4">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : filteredNews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhuma notícia encontrada com os filtros aplicados.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNews.map((item, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col md:flex-row">
                  {/* Imagem de Capa */}
                  <div className="md:w-80 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={getCategoryColor(item.category)} variant="secondary">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Conteúdo da Notícia */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {item.source}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.pubDate)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {item.readTime}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {item.contentSnippet}
                    </p>
                    
                    <Button variant="outline" size="sm" asChild className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ler Notícia Completa
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default NoticiasExternas;