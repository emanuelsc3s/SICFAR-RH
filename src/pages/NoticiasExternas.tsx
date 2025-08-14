import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Calendar, Search, Filter, RefreshCw } from "lucide-react";
import Header from "@/components/Header";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  category: string;
  contentSnippet: string;
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
        title: "ANVISA aprova novo medicamento para tratamento de diabetes tipo 2",
        link: "#",
        pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: "A Agência Nacional de Vigilância Sanitária (ANVISA) aprovou registro de novo medicamento para diabetes desenvolvido por laboratório brasileiro.",
        source: "G1 Ciência e Saúde",
        category: "Regulatório",
        contentSnippet: "A Agência Nacional de Vigilância Sanitária (ANVISA) aprovou registro de novo medicamento para diabetes desenvolvido por laboratório brasileiro..."
      },
      {
        title: "Ministério da Saúde amplia distribuição de medicamentos genéricos",
        link: "#",
        pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        description: "Programa nacional de acesso a medicamentos genéricos será expandido para mais 200 municípios brasileiros este ano.",
        source: "Estadão Saúde",
        category: "Medicamentos",
        contentSnippet: "Programa nacional de acesso a medicamentos genéricos será expandido para mais 200 municípios brasileiros este ano..."
      },
      {
        title: "Nova vacina contra COVID-19 desenvolvida no Brasil entra em fase de testes",
        link: "#",
        pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        description: "Instituto Butantan inicia ensaios clínicos de nova vacina nacional contra COVID-19 com tecnologia inovadora.",
        source: "R7 Notícias",
        category: "Vacinas",
        contentSnippet: "Instituto Butantan inicia ensaios clínicos de nova vacina nacional contra COVID-19 com tecnologia inovadora..."
      },
      {
        title: "Pesquisa brasileira desenvolve novo tratamento para câncer de mama",
        link: "#",
        pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        description: "Estudo clínico multicêntrico testa eficácia de nova terapia desenvolvida em universidade paulista para oncologia.",
        source: "Estadão Ciência",
        category: "Pesquisa",
        contentSnippet: "Estudo clínico multicêntrico testa eficácia de nova terapia desenvolvida em universidade paulista para oncologia..."
      },
      {
        title: "ANVISA suspende lote de medicamento por contaminação",
        link: "#",
        pubDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        description: "Agência determina recolhimento imediato de lotes de anti-inflamatório após detecção de substâncias não autorizadas.",
        source: "G1 Ciência e Saúde",
        category: "Regulatório",
        contentSnippet: "Agência determina recolhimento imediato de lotes de anti-inflamatório após detecção de substâncias não autorizadas..."
      },
      {
        title: "Laboratório nacional lança primeiro biológico para artrite reumatoide",
        link: "#",
        pubDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        description: "Medicamento biológico desenvolvido no Brasil oferece nova opção terapêutica para pacientes com artrite reumatoide.",
        source: "Estadão Saúde",
        category: "Medicamentos",
        contentSnippet: "Medicamento biológico desenvolvido no Brasil oferece nova opção terapêutica para pacientes com artrite reumatoide..."
      },
      {
        title: "SUS incorpora novo tratamento para hepatite C",
        link: "#",
        pubDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: "Sistema Único de Saúde passa a oferecer gratuitamente novo medicamento para hepatite C com eficácia de 95%.",
        source: "R7 Notícias",
        category: "Saúde Geral",
        contentSnippet: "Sistema Único de Saúde passa a oferecer gratuitamente novo medicamento para hepatite C com eficácia de 95%..."
      },
      {
        title: "Pesquisadores brasileiros descobrem novo princípio ativo antiviral",
        link: "#",
        pubDate: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        description: "Estudo da UNICAMP identifica composto natural com potencial para desenvolvimento de novos antivirais.",
        source: "Estadão Ciência",
        category: "Pesquisa",
        contentSnippet: "Estudo da UNICAMP identifica composto natural com potencial para desenvolvimento de novos antivirais..."
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
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg leading-tight">
                      {item.title}
                    </CardTitle>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Badge variant="outline">{item.source}</Badge>
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(item.pubDate)}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 text-sm">
                    {item.contentSnippet}
                  </CardDescription>
                  <Button variant="outline" size="sm" asChild>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ler Notícia Completa
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default NoticiasExternas;