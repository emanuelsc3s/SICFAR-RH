import { ArrowLeft, BookOpen, Download, Share2, Search, Users, Clock, Calendar, Shield, AlertTriangle, FileText, Home, CheckCircle2, Phone, Building2, Heart, Briefcase, Scale, UserCheck, Timer, Gavel, LogOut, FileCheck, ClipboardCheck, UserPlus, Stethoscope, Coffee, Plane, Settings, ScrollText } from "lucide-react";
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
    titulo: "Manual do Gestor",
    empresa: "Farmace",
    slogan: "Compromisso com a saúde!",
    data: "Setembro/2024",
    versao: "1.0",
    secoes: [{
      id: "introducao",
      titulo: "Introdução",
      icone: BookOpen,
      numero: 1,
      cor: "bg-slate-600"
    }, {
      id: "processo_selecao",
      titulo: "Processo de Seleção",
      icone: Search,
      numero: 2,
      cor: "bg-blue-600"
    }, {
      id: "processo_contratacao",
      titulo: "Processo de Contratação",
      icone: UserPlus,
      numero: 3,
      cor: "bg-green-600"
    }, {
      id: "avaliacao_experiencia",
      titulo: "Avaliação de Experiência",
      icone: ClipboardCheck,
      numero: 4,
      cor: "bg-purple-600"
    }, {
      id: "jornada_trabalho",
      titulo: "Jornada de Trabalho",
      icone: Clock,
      numero: 5,
      cor: "bg-orange-600"
    }, {
      id: "faltas",
      titulo: "Faltas",
      icone: Calendar,
      numero: 6,
      cor: "bg-red-600"
    }, {
      id: "afastamento",
      titulo: "Afastamento",
      icone: Stethoscope,
      numero: 7,
      cor: "bg-teal-600"
    }, {
      id: "horas_extras",
      titulo: "Horas Extras e Ponto",
      icone: Timer,
      numero: 8,
      cor: "bg-indigo-600"
    }, {
      id: "licencas",
      titulo: "Licenças",
      icone: Heart,
      numero: 9,
      cor: "bg-pink-600"
    }, {
      id: "ferias",
      titulo: "Férias",
      icone: Plane,
      numero: 10,
      cor: "bg-cyan-600"
    }, {
      id: "medidas_disciplinares",
      titulo: "Medidas Disciplinares",
      icone: Scale,
      numero: 11,
      cor: "bg-amber-600"
    }, {
      id: "desligamento",
      titulo: "Processo de Desligamento",
      icone: LogOut,
      numero: 12,
      cor: "bg-rose-600"
    }, {
      id: "normas_gerais",
      titulo: "Normas Gerais",
      icone: ScrollText,
      numero: 13,
      cor: "bg-emerald-600"
    }]
  };
  const renderSumario = () => <div className="space-y-12">
      {/* Header com logo e info */}
      <div className="text-center">
        
        <h1 className="text-5xl font-bold text-foreground mb-4">{manualData.titulo}</h1>
        
        <p className="text-xl text-muted-foreground italic mb-6">{manualData.slogan}</p>
        <div className="flex items-center justify-center space-x-6 text-muted-foreground">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {manualData.data}
          </span>
          <span>•</span>
          <span>Versão {manualData.versao}</span>
        </div>
      </div>

      {/* Sumário */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-10">
          <h2 className="text-3xl font-bold mb-10 text-center text-foreground">Índice de Conteúdo</h2>
          <div className="grid gap-3 max-w-4xl mx-auto">
            {manualData.secoes.map(secao => {
            const IconComponent = secao.icone;
            return <div key={secao.id} onClick={() => setActiveSection(secao.id)} className="flex items-center justify-between p-6 rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-muted-foreground/20">
                  <div className="flex items-center space-x-6">
                    <div className={`w-14 h-14 ${secao.cor} rounded-lg flex items-center justify-center text-white shadow-md`}>
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-slate-600 transition-colors">
                        {secao.numero}. {secao.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Seção {secao.numero}
                      </p>
                    </div>
                  </div>
                  
                </div>;
          })}
          </div>
        </CardContent>
      </Card>
    </div>;
  const renderIntroducao = () => <div className="space-y-8">
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-slate-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <BookOpen className="h-10 w-10" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-foreground">Introdução</h1>
            <p className="text-lg text-muted-foreground mt-2">Seção 1</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-foreground">Bem-vindo ao Manual de Gestão</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Este manual visa propiciar aos gestores da Farmace informações básicas sobre as formas de condução das relações trabalhistas com os empregados dos seus respectivos setores.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Este manual é uma ferramenta essencial para garantir que todos os processos de gestão de pessoas sejam conduzidos de forma padronizada, legal e eficiente em toda a empresa.
              </p>
            </div>
            <div className="bg-slate-50 p-8 rounded-xl">
              <h4 className="text-xl font-semibold text-foreground mb-6">Como usar este manual</h4>
              <div className="space-y-4">
                {["Navegue pelos tópicos usando o menu superior", "Cada seção contém fluxogramas e procedimentos detalhados", "Os anexos mencionados devem ser solicitados ao RH", "Em caso de dúvidas, consulte sempre o departamento de RH"].map((item, index) => <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-relaxed">{item}</span>
                  </div>)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
  const renderSecao = (secaoId: string) => {
    const secao = manualData.secoes.find(s => s.id === secaoId);
    if (!secao) return null;
    const IconComponent = secao.icone;
    return <div className="space-y-8">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-6">
            <div className={`w-20 h-20 ${secao.cor} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <IconComponent className="h-10 w-10" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-foreground">{secao.titulo}</h1>
              <p className="text-lg text-muted-foreground mt-2">Seção {secao.numero}</p>
            </div>
          </div>
        </div>

        {/* Conteúdo da seção baseado no JSON */}
        {secaoId === "processo_contratacao" && <div className="space-y-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <Clock className="h-8 w-8 text-slate-600" />
                      <h3 className="text-2xl font-semibold text-foreground">Prazo de Contratação</h3>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Após a assinatura de Dr. Salviano, o candidato será contratado em no máximo <span className="font-semibold text-slate-900">15 dias úteis</span>.
                    </p>
                    
                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-800 mb-2">Observação Importante</h4>
                          <p className="text-amber-700 leading-relaxed">
                            Haverá exceções em casos de não autorização da diretoria e candidatos que não estão disponíveis de imediato.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-8 rounded-xl">
                    <div className="flex items-center space-x-3 mb-8">
                      <FileCheck className="h-8 w-8 text-slate-600" />
                      <h4 className="text-xl font-semibold text-foreground">Fluxo do Processo</h4>
                    </div>
                    
                    <div className="space-y-6">
                      {[{
                    texto: "Assinatura de Dr. Salviano validando contratação",
                    responsavel: "GESTOR",
                    cor: "slate"
                  }, {
                    texto: "Solicitação de documentação",
                    responsavel: "RH",
                    cor: "blue"
                  }, {
                    texto: "Integração",
                    responsavel: "RH + GESTOR",
                    cor: "purple"
                  }, {
                    texto: "Exame admissional e início",
                    responsavel: "CANDIDATO",
                    cor: "green"
                  }].map((item, index) => <div key={index} className="flex items-start space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${item.cor === 'slate' ? 'bg-slate-500' : item.cor === 'blue' ? 'bg-blue-500' : item.cor === 'purple' ? 'bg-purple-500' : 'bg-green-500'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-foreground leading-snug">{item.texto}</p>
                            <p className={`text-sm font-medium mt-1 ${item.cor === 'slate' ? 'text-slate-600' : item.cor === 'blue' ? 'text-blue-600' : item.cor === 'purple' ? 'text-purple-600' : 'text-green-600'}`}>
                              {item.responsavel}
                            </p>
                          </div>
                        </div>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline visual */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-foreground mb-8 text-center">Timeline do Processo</h3>
                <div className="flex items-center justify-between relative max-w-4xl mx-auto">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
                  
                  {[{
                titulo: "Aprovação",
                dias: "Dia 0",
                cor: "slate"
              }, {
                titulo: "Documentação",
                dias: "Dias 1-5",
                cor: "blue"
              }, {
                titulo: "Integração",
                dias: "Dias 6-10",
                cor: "purple"
              }, {
                titulo: "Início",
                dias: "Até dia 15",
                cor: "green"
              }].map((etapa, index) => <div key={index} className="flex flex-col items-center relative z-10 bg-background px-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ${etapa.cor === 'slate' ? 'bg-slate-500' : etapa.cor === 'blue' ? 'bg-blue-500' : etapa.cor === 'purple' ? 'bg-purple-500' : 'bg-green-500'}`}>
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-foreground mt-4 text-center text-sm">{etapa.titulo}</h4>
                      <p className="text-xs text-muted-foreground text-center mt-1">{etapa.dias}</p>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>}
        
        {secaoId === "processo_selecao" && <div className="space-y-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Todos os processos seletivos devem ser abertos seguindo os fluxos estabelecidos e serão conduzidos pela equipe do RH junto aos gestores.
                </p>
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Portal de Candidaturas
                  </h4>
                  <p className="text-blue-700">www.farmace.com.br - ícone Trabalhe Conosco</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Users className="h-8 w-8 text-green-600" />
                    <h3 className="text-xl font-semibold text-foreground">Vagas de Aumento de Quadro</h3>
                  </div>
                  <div className="space-y-4">
                    {["Autorização por escrito, assinada pelo gestor, Horaci e Dr. Salviano (Anexo A)", "Alinhamento de perfil", "Processo seletivo", "Entrevista com o gestor", "Fechamento do salário com Dr. Salviano", "Fechamento da contratação"].map((item, index) => <div key={index} className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{item}</p>
                      </div>)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <UserCheck className="h-8 w-8 text-blue-600" />
                    <h3 className="text-xl font-semibold text-foreground">Vagas de Substituição</h3>
                  </div>
                  <div className="space-y-4">
                    {["Autorização por escrito, assinada pelo gestor e Horaci (Anexo A)", "Alinhamento de perfil", "Processo seletivo", "Entrevista com o gestor", "Fechamento do salário com Dr. Salviano", "Fechamento da contratação"].map((item, index) => <div key={index} className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{item}</p>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>}
      </div>;
  };
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <BookOpen className="h-8 w-8 text-slate-600 mr-3" />
                Manual do Gestor
              </h1>
              <p className="text-muted-foreground mt-1">
                {manualData.titulo} • {manualData.empresa}
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
        <div className="flex flex-wrap gap-3 mb-12 p-1 bg-muted/30 rounded-lg">
          <Button variant={activeSection === "sumario" ? "default" : "ghost"} onClick={() => setActiveSection("sumario")} size="sm" className="h-9">
            <Home className="h-4 w-4 mr-2" />
            Sumário
          </Button>
          {manualData.secoes.map(secao => {
          const IconComponent = secao.icone;
          return <Button key={secao.id} variant={activeSection === secao.id ? "default" : "ghost"} onClick={() => setActiveSection(secao.id)} size="sm" className="h-9">
                <IconComponent className="h-4 w-4 mr-2" />
                {secao.titulo}
              </Button>;
        })}
        </div>

        {/* Content */}
        {activeSection === "sumario" && renderSumario()}
        {activeSection === "introducao" && renderIntroducao()}
        {activeSection !== "sumario" && activeSection !== "introducao" && renderSecao(activeSection)}
      </main>
    </div>;
};
export default ManualGestor;