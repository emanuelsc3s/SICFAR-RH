import { ArrowLeft, BookOpen, Download, Share2, Search, Users, Clock, Calendar, Shield, AlertTriangle, FileText, Home, CheckCircle2, Phone, Building2, Heart, Briefcase, Scale, UserCheck, Timer, Gavel, LogOut, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";

const ManualGestor = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("sumario");

  const manualData = {
    titulo: "Manual Básico de Gestão de Pessoas",
    empresa: "Farmace",
    slogan: "Compromisso com a saúde!",
    data: "Setembro/2024",
    versao: "1.0",
    secoes: [
      {
        id: "introducao",
        titulo: "Introdução",
        icone: "📘",
        numero: 1,
        cor: "from-blue-500 to-blue-600"
      },
      {
        id: "processo_selecao",
        titulo: "Processo de Seleção",
        icone: "🔍",
        numero: 2,
        cor: "from-orange-500 to-orange-600"
      },
      {
        id: "processo_contratacao",
        titulo: "Processo de Contratação",
        icone: "✍️",
        numero: 3,
        cor: "from-purple-500 to-purple-600"
      },
      {
        id: "avaliacao_experiencia",
        titulo: "Avaliação de Experiência",
        icone: "📊",
        numero: 4,
        cor: "from-green-500 to-green-600"
      },
      {
        id: "jornada_trabalho",
        titulo: "Jornada de Trabalho",
        icone: "⏰",
        numero: 5,
        cor: "from-red-500 to-red-600"
      },
      {
        id: "faltas",
        titulo: "Faltas",
        icone: "📅",
        numero: 6,
        cor: "from-indigo-500 to-indigo-600"
      },
      {
        id: "afastamento",
        titulo: "Afastamento",
        icone: "🏥",
        numero: 7,
        cor: "from-pink-500 to-pink-600"
      },
      {
        id: "horas_extras",
        titulo: "Horas Extras e Ponto",
        icone: "⏱️",
        numero: 8,
        cor: "from-teal-500 to-teal-600"
      },
      {
        id: "licencas",
        titulo: "Licenças",
        icone: "👶",
        numero: 9,
        cor: "from-amber-500 to-amber-600"
      },
      {
        id: "ferias",
        titulo: "Férias",
        icone: "🏖️",
        numero: 10,
        cor: "from-cyan-500 to-cyan-600"
      },
      {
        id: "medidas_disciplinares",
        titulo: "Medidas Disciplinares",
        icone: "⚖️",
        numero: 11,
        cor: "from-violet-500 to-violet-600"
      },
      {
        id: "desligamento",
        titulo: "Processo de Desligamento",
        icone: "🚪",
        numero: 12,
        cor: "from-rose-500 to-rose-600"
      },
      {
        id: "normas_gerais",
        titulo: "Normas Gerais",
        icone: "📋",
        numero: 13,
        cor: "from-emerald-500 to-emerald-600"
      }
    ]
  };

  const renderSumario = () => (
    <div className="space-y-8">
      {/* Header com logo e info */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {manualData.empresa.charAt(0)}
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">{manualData.titulo}</h1>
        <p className="text-xl text-primary mb-2">{manualData.empresa}</p>
        <p className="text-lg text-muted-foreground italic">{manualData.slogan}</p>
        <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-muted-foreground">
          <span>{manualData.data}</span>
          <span>•</span>
          <span>Versão {manualData.versao}</span>
        </div>
      </div>

      {/* Sumário */}
      <Card className="p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">SUMÁRIO</h2>
        <div className="grid gap-4">
          {manualData.secoes.map((secao) => (
            <div 
              key={secao.id}
              onClick={() => setActiveSection(secao.id)}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center space-x-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${secao.cor} rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                  {secao.numero}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {secao.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {secao.icone} Seção {secao.numero}
                  </p>
                </div>
              </div>
              <div className="w-8 h-[2px] bg-muted-foreground/30"></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderIntroducao = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6">
          1
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">INTRODUÇÃO</h1>
        <div className="text-2xl">📘</div>
      </div>

      <Card className="p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Bem-vindo ao Manual de Gestão!</h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Este manual visa propiciar aos gestores da Farmace informações básicas sobre as formas de condução das relações trabalhistas com os empregados dos seus respectivos setores.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Este manual é uma ferramenta essencial para garantir que todos os processos de gestão de pessoas sejam conduzidos de forma padronizada, legal e eficiente em toda a empresa.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-foreground mb-4">Como usar este manual:</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Navegue pelos tópicos usando o menu lateral</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Cada seção contém fluxogramas e procedimentos detalhados</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Os anexos mencionados devem ser solicitados ao RH</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Em caso de dúvidas, consulte sempre o departamento de RH</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSecao = (secaoId: string) => {
    const secao = manualData.secoes.find(s => s.id === secaoId);
    if (!secao) return null;

    // Conteúdo completo baseado no JSON fornecido
    const conteudoCompleto: { [key: string]: any } = {
      processo_selecao: {
        descricao: "Todos os processos seletivos devem ser abertos seguindo os fluxos estabelecidos e serão conduzidos pela equipe do RH junto aos gestores.",
        portal: "www.farmace.com.br - ícone Trabalhe Conosco",
        tipos: [
          {
            titulo: "Vagas de Aumento de Quadro",
            fluxo: [
              "Autorização por escrito, assinada pelo gestor, Horaci e Dr. Salviano (Anexo A)",
              "Alinhamento de perfil",
              "Processo seletivo",
              "Entrevista com o gestor",
              "Fechamento do salário com Dr. Salviano",
              "Fechamento da contratação"
            ]
          },
          {
            titulo: "Vagas de Substituição",
            fluxo: [
              "Autorização por escrito, assinada pelo gestor e Horaci (Anexo A)",
              "Alinhamento de perfil",
              "Processo seletivo",
              "Entrevista com o gestor",
              "Fechamento do salário com Dr. Salviano",
              "Fechamento da contratação"
            ]
          }
        ]
      }
    };

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <div className={`w-24 h-24 bg-gradient-to-br ${secao.cor} rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6`}>
            {secao.numero}
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{secao.titulo.toUpperCase()}</h1>
          <div className="text-2xl">{secao.icone}</div>
        </div>

        {/* Conteúdo da seção baseado no JSON */}
        {secaoId === "processo_contratacao" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                    <Clock className="h-6 w-6 text-blue-600 mr-2" />
                    Prazo de Contratação
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    Após a assinatura de Dr. Salviano, o candidato será contratado em no máximo <span className="font-bold text-primary">15 dias</span>.
                  </p>
                  
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-1">Observação Importante</h4>
                        <p className="text-amber-700 text-sm">
                          Haverá exceções em casos de não autorização da diretoria e candidatos que não estão disponíveis de imediato.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
                  <h4 className="text-xl font-bold text-foreground mb-6 flex items-center">
                    <FileCheck className="h-6 w-6 text-purple-600 mr-2" />
                    Fluxo do Processo
                  </h4>
                  <ol className="space-y-4">
                    {[
                      {
                        texto: "Assinatura de Dr. Salviano validando contratação",
                        responsavel: "GESTOR",
                        cor: "green"
                      },
                      {
                        texto: "Solicitação de documentação",
                        responsavel: "RH",
                        cor: "blue"
                      },
                      {
                        texto: "Integração",
                        responsavel: "RH + GESTOR",
                        cor: "purple"
                      },
                      {
                        texto: "Exame admissional e início",
                        responsavel: "CANDIDATO",
                        cor: "orange"
                      }
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0 ${
                          item.cor === 'green' ? 'bg-green-500' :
                          item.cor === 'blue' ? 'bg-blue-500' :
                          item.cor === 'purple' ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.texto}</p>
                          <p className={`text-xs font-bold mt-1 ${
                            item.cor === 'green' ? 'text-green-600' :
                            item.cor === 'blue' ? 'text-blue-600' :
                            item.cor === 'purple' ? 'text-purple-600' :
                            'text-orange-600'
                          }`}>
                            ({item.responsavel})
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Card>

            {/* Timeline visual */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">Timeline do Processo de Contratação</h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-200 via-blue-200 via-purple-200 to-orange-200 -translate-y-1/2 z-0"></div>
                
                {[
                  { titulo: "Aprovação", dias: "Dia 0", cor: "green" },
                  { titulo: "Documentação", dias: "Dias 1-5", cor: "blue" },
                  { titulo: "Integração", dias: "Dias 6-10", cor: "purple" },
                  { titulo: "Início", dias: "Até dia 15", cor: "orange" }
                ].map((etapa, index) => (
                  <div key={index} className="flex flex-col items-center relative z-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                      etapa.cor === 'green' ? 'bg-green-500' :
                      etapa.cor === 'blue' ? 'bg-blue-500' :
                      etapa.cor === 'purple' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-foreground mt-3 text-center">{etapa.titulo}</h4>
                    <p className="text-sm text-muted-foreground text-center">{etapa.dias}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
        
        {secaoId === "processo_selecao" && (
          <div className="space-y-6">
            <Card className="p-6">
              <p className="text-lg text-muted-foreground mb-4">
                Todos os processos seletivos devem ser abertos seguindo os fluxos estabelecidos e serão conduzidos pela equipe do RH junto aos gestores.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Portal de Candidaturas:</h4>
                <p className="text-muted-foreground">www.farmace.com.br - ícone Trabalhe Conosco</p>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                  <Users className="h-6 w-6 text-green-600 mr-2" />
                  Vagas de Aumento de Quadro
                </h3>
                <ol className="space-y-3">
                  {[
                    "Autorização por escrito, assinada pelo gestor, Horaci e Dr. Salviano (Anexo A)",
                    "Alinhamento de perfil",
                    "Processo seletivo",
                    "Entrevista com o gestor",
                    "Fechamento do salário com Dr. Salviano",
                    "Fechamento da contratação"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                  <UserCheck className="h-6 w-6 text-blue-600 mr-2" />
                  Vagas de Substituição
                </h3>
                <ol className="space-y-3">
                  {[
                    "Autorização por escrito, assinada pelo gestor e Horaci (Anexo A)",
                    "Alinhamento de perfil",
                    "Processo seletivo",
                    "Entrevista com o gestor",
                    "Fechamento do salário com Dr. Salviano",
                    "Fechamento da contratação"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          </div>
        )}

        {/* Adicione mais seções aqui conforme necessário */}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <BookOpen className="h-8 w-8 text-primary mr-3" />
                Manual do Gestor
              </h1>
              <p className="text-muted-foreground mt-1">
                {manualData.titulo} - {manualData.empresa}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeSection === "sumario" ? "default" : "outline"}
            onClick={() => setActiveSection("sumario")}
            size="sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Sumário
          </Button>
          {manualData.secoes.map((secao) => (
            <Button
              key={secao.id}
              variant={activeSection === secao.id ? "default" : "outline"}
              onClick={() => setActiveSection(secao.id)}
              size="sm"
            >
              <span className="mr-2">{secao.icone}</span>
              {secao.titulo}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeSection === "sumario" && renderSumario()}
        {activeSection === "introducao" && renderIntroducao()}
        {activeSection !== "sumario" && activeSection !== "introducao" && renderSecao(activeSection)}
      </main>
    </div>
  );
};

export default ManualGestor;