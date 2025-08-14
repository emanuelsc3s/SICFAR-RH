import { useState } from "react";
import { ArrowLeft, Search, ChevronDown, ChevronUp, Clock, User, FileText, Shield, Settings, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Dados do FAQ baseados no manual fornecido
const faqData = [
  {
    id: "001",
    categoria: "processo_selecao",
    pergunta: "Como funciona o processo de seleção na Farmace?",
    resposta: "Todos os processos seletivos na Farmace devem seguir fluxos específicos e são conduzidos pela equipe do RH junto aos gestores. As candidaturas são realizadas através do site www.farmace.com.br, no ícone 'Trabalhe Conosco'. O processo varia conforme o tipo de vaga.",
    palavras_chave: ["seleção", "contratação", "vaga", "processo seletivo", "candidatura"]
  },
  {
    id: "002",
    categoria: "processo_selecao",
    pergunta: "Qual a diferença entre vaga de aumento de quadro e vaga de substituição?",
    resposta: "Vaga de aumento de quadro requer autorização por escrito do gestor, Horaci e Dr. Salviano. Vaga de substituição requer apenas autorização do gestor e Horaci. Ambas seguem o mesmo fluxo após a autorização: alinhamento de perfil, processo seletivo, entrevista com gestor, fechamento salarial com Dr. Salviano e contratação.",
    palavras_chave: ["aumento quadro", "substituição", "tipos vaga", "autorização"]
  },
  {
    id: "003",
    categoria: "contratacao",
    pergunta: "Qual o prazo para contratar um candidato aprovado?",
    resposta: "Após a assinatura de Dr. Salviano validando a contratação, o candidato deve ser contratado em no máximo 15 dias. Exceções podem ocorrer em casos de não autorização da diretoria ou quando candidatos não estão disponíveis de imediato.",
    palavras_chave: ["prazo contratação", "15 dias", "assinatura", "Dr. Salviano"]
  },
  {
    id: "006",
    categoria: "jornada_trabalho",
    pergunta: "Qual é a jornada de trabalho padrão?",
    resposta: "A jornada padrão (horário comercial) é de 44 horas semanais, com 8 horas diárias. É possível compensar o sábado durante a semana (ex: 9h de segunda a quinta e 8h na sexta). O intervalo para almoço é de mínimo 1 hora e máximo 2 horas, idealmente entre a 4ª e 5ª hora trabalhada.",
    palavras_chave: ["44 horas", "jornada semanal", "8 horas", "horário comercial", "intervalo"]
  },
  {
    id: "007",
    categoria: "jornada_trabalho",
    pergunta: "Como funciona a jornada 12x36?",
    resposta: "A jornada 12x36 consiste em 12 horas de trabalho por 36 horas de descanso. Não permite horas extras. Na Farmace, são concedidos: intervalo de 15 minutos nas primeiras 6 horas, 1 hora de almoço, e mais 15 minutos nas últimas 6 horas. Turno noturno tem direito à 9ª hora (15 horas extras mensais). Trabalho em feriados é pago em dobro.",
    palavras_chave: ["12x36", "plantão", "turno noturno", "feriado", "9ª hora"]
  },
  {
    id: "008",
    categoria: "jornada_trabalho",
    pergunta: "Posso fazer horas extras?",
    resposta: "Horas extras devem ser excepcionais e limitadas a 2 horas diárias, não ultrapassando 10 horas de trabalho no dia. Devem ser solicitadas pelo gestor à diretoria com pelo menos 24 horas de antecedência usando o Anexo D. Em atividades insalubres, é necessária licença prévia das autoridades de higiene do trabalho.",
    palavras_chave: ["horas extras", "2 horas", "10 horas", "solicitação", "24 horas antecedência"]
  },
  {
    id: "010",
    categoria: "faltas",
    pergunta: "Quantos dias posso faltar quando alguém da família falece?",
    resposta: "Em caso de falecimento de cônjuge, ascendente (pais, avós), descendente (filhos, netos), irmão ou dependente econômico declarado em carteira, você tem direito a até 2 dias consecutivos de falta justificada. Deve comunicar imediatamente o gestor e apresentar a documentação no retorno.",
    palavras_chave: ["falecimento", "luto", "2 dias", "falta justificada", "família"]
  },
  {
    id: "011",
    categoria: "faltas",
    pergunta: "Quantos dias tenho direito quando meu filho nascer?",
    resposta: "No nascimento de filho, adoção ou guarda compartilhada, o pai tem direito a 5 dias consecutivos de licença, contados a partir da data de nascimento. É uma falta justificada que não desconta do salário.",
    palavras_chave: ["nascimento", "licença paternidade", "5 dias", "adoção", "guarda compartilhada"]
  },
  {
    id: "020",
    categoria: "licenca_maternidade",
    pergunta: "Quanto tempo dura a licença maternidade?",
    resposta: "A licença maternidade é de 120 dias, mesmo em caso de parto antecipado. O afastamento pode iniciar entre o 28º dia antes do parto e a data do parto, mediante atestado médico. Os períodos podem ser aumentados em 2 semanas cada com atestado. A gestante tem estabilidade até 30 dias após o parto.",
    palavras_chave: ["licença maternidade", "120 dias", "gestante", "estabilidade", "parto"]
  },
  {
    id: "023",
    categoria: "ferias",
    pergunta: "Quantos dias de férias eu tenho direito?",
    resposta: "Após 12 meses de trabalho, você tem direito a: 30 dias se tiver até 5 faltas no período; 24 dias com 6 a 14 faltas; 18 dias com 15 a 23 faltas; 12 dias com 24 a 32 faltas. As férias devem ser comunicadas com 30 dias de antecedência.",
    palavras_chave: ["férias", "30 dias", "12 meses", "período aquisitivo", "faltas"]
  },
  {
    id: "024",
    categoria: "ferias",
    pergunta: "Posso dividir minhas férias?",
    resposta: "Sim, com sua concordância, as férias podem ser divididas em até 3 períodos: um período deve ter no mínimo 14 dias corridos, e os outros dois devem ter no mínimo 5 dias corridos cada. A empresa deve comunicar com 30 dias de antecedência.",
    palavras_chave: ["dividir férias", "3 períodos", "14 dias", "5 dias", "fracionamento"]
  },
  {
    id: "032",
    categoria: "normas",
    pergunta: "Posso vender produtos dentro da empresa?",
    resposta: "Não. A comercialização de produtos no interior da empresa é estritamente proibida e pode resultar em demissão por justa causa. Esta regra se aplica a qualquer tipo de venda ou comércio nas dependências da empresa.",
    palavras_chave: ["proibido vender", "comercialização", "justa causa", "venda produtos"]
  }
];

const categorias = [
  { id: "processo_selecao", nome: "Processo de Seleção", icon: Users, cor: "bg-blue-500" },
  { id: "contratacao", nome: "Contratação", icon: User, cor: "bg-green-500" },
  { id: "jornada_trabalho", nome: "Jornada de Trabalho", icon: Clock, cor: "bg-purple-500" },
  { id: "faltas", nome: "Faltas e Licenças", icon: FileText, cor: "bg-orange-500" },
  { id: "licenca_maternidade", nome: "Licença Maternidade", icon: User, cor: "bg-pink-500" },
  { id: "ferias", nome: "Férias", icon: Settings, cor: "bg-indigo-500" },
  { id: "normas", nome: "Normas e Conduta", icon: Shield, cor: "bg-red-500" }
];

const faqRapidas = [
  { pergunta: "Onde faço a candidatura?", resposta: "www.farmace.com.br - Trabalhe Conosco" },
  { pergunta: "Prazo máximo de contratação?", resposta: "15 dias após aprovação" },
  { pergunta: "Jornada semanal padrão?", resposta: "44 horas" },
  { pergunta: "Quantos dias de licença paternidade?", resposta: "5 dias consecutivos" },
  { pergunta: "Quantos dias de licença maternidade?", resposta: "120 dias" },
  { pergunta: "Prazo para apresentar atestado?", resposta: "24 horas" },
  { pergunta: "Limite de horas extras por dia?", resposta: "2 horas (máximo 10h/dia)" },
  { pergunta: "Férias podem ser divididas?", resposta: "Sim, em até 3 períodos" }
];

const FAQ = () => {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [itemExpandido, setItemExpandido] = useState<string | null>(null);

  const perguntasFiltradas = faqData.filter(item => {
    const matchBusca = busca === "" || 
      item.pergunta.toLowerCase().includes(busca.toLowerCase()) ||
      item.resposta.toLowerCase().includes(busca.toLowerCase()) ||
      item.palavras_chave.some(palavra => palavra.toLowerCase().includes(busca.toLowerCase()));
    
    const matchCategoria = !categoriaAtiva || item.categoria === categoriaAtiva;
    
    return matchBusca && matchCategoria;
  });

  const getCategoriaInfo = (categoriaId: string) => {
    return categorias.find(cat => cat.id === categoriaId);
  };

  const toggleItem = (id: string) => {
    setItemExpandido(itemExpandido === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar ao Portal</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground mt-4">FAQ - Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-2">
            Manual de Gestão de Pessoas da Farmace - Encontre respostas para suas dúvidas
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* FAQ Rápidas */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Respostas Rápidas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {faqRapidas.map((item, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-sm text-foreground mb-2">{item.pergunta}</h3>
                <p className="text-sm text-primary font-medium">{item.resposta}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Busca */}
        <section className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar perguntas, palavras-chave ou temas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </section>

        {/* Filtros por Categoria */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Categorias</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={categoriaAtiva === null ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaAtiva(null)}
            >
              Todas
            </Button>
            {categorias.map((categoria) => {
              const Icon = categoria.icon;
              return (
                <Button
                  key={categoria.id}
                  variant={categoriaAtiva === categoria.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoriaAtiva(categoria.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {categoria.nome}
                </Button>
              );
            })}
          </div>
        </section>

        {/* Lista de Perguntas */}
        <section>
          <div className="space-y-4">
            {perguntasFiltradas.map((item) => {
              const categoriaInfo = getCategoriaInfo(item.categoria);
              const isExpanded = itemExpandido === item.id;
              
              return (
                <Card key={item.id} className="overflow-hidden">
                  <div
                    className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {categoriaInfo && (
                            <Badge variant="secondary" className="text-xs">
                              {categoriaInfo.nome}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground text-lg leading-tight">
                          {item.pergunta}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-border pt-4">
                        <p className="text-muted-foreground leading-relaxed">
                          {item.resposta}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1">
                          {item.palavras_chave.map((palavra, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {palavra}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {perguntasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground">
                Tente usar outros termos de busca ou entre em contato com o RH para mais informações.
              </p>
            </div>
          )}
        </section>

        {/* Informações de Contato */}
        <section className="mt-12 pt-8 border-t border-border">
          <Card className="p-6 bg-muted/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Não encontrou sua resposta?</h2>
            <p className="text-muted-foreground mb-4">
              Para dúvidas não contempladas neste FAQ, entre em contato com:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span><strong>RH:</strong> Para questões sobre procedimentos e políticas</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span><strong>Segurança do Trabalho:</strong> Para acidentes e questões de segurança</span>
              </li>
              <li className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <span><strong>Diretoria:</strong> Para aprovações especiais</span>
              </li>
            </ul>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default FAQ;