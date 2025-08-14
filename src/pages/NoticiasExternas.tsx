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

  // Função para buscar notícias de um feed RSS via proxy
  const fetchRSSFeed = async (source: RSSSource): Promise<NewsItem[]> => {
    try {
      // Usando um proxy CORS para acessar os feeds RSS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (!data.contents) {
        console.warn(`Não foi possível obter conteúdo de ${source.name}`);
        return [];
      }

      // Parse simples do XML RSS
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      
      const newsItems: NewsItem[] = [];
      
      items.forEach(item => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        
        // Filtrar apenas conteúdo farmacêutico relevante
        if (isPharmaceuticalContent(title + " " + description)) {
          newsItems.push({
            title: title.trim(),
            link: link.trim(),
            pubDate,
            description: description.replace(/<[^>]*>/g, '').trim(), // Remove HTML tags
            source: source.name,
            category: getContentCategory(title, description),
            contentSnippet: description.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
          });
        }
      });
      
      return newsItems;
    } catch (error) {
      console.error(`Erro ao buscar feed ${source.name}:`, error);
      return [];
    }
  };

  // Função para buscar todas as notícias
  const fetchAllNews = async () => {
    setLoading(true);
    try {
      const allNewsPromises = rssSources.map(source => fetchRSSFeed(source));
      const allNewsArrays = await Promise.all(allNewsPromises);
      
      // Combinar e ordenar por data
      const combinedNews = allNewsArrays.flat().sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
      
      setNews(combinedNews);
      setFilteredNews(combinedNews);
      setLastUpdate(new Date());
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

  // Buscar notícias ao carregar o componente
  useEffect(() => {
    fetchAllNews();
  }, []);

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