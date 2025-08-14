import { ArrowLeft, Cake, Users, Calendar, Gift, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import Header from "@/components/Header";

interface BirthdayPerson {
  name: string;
  department: string;
  date: string;
  fullDate: string;
  avatar?: string;
  admissionDate?: string;
}

const allBirthdayData: BirthdayPerson[] = [
  { name: "GLEDSON GUSTAVO DE SOUSA SILVA", department: "EMBALAGEM SPEPII", date: "02/08", fullDate: "02 de Agosto", avatar: "", admissionDate: "04/06/2024" },
  { name: "SAULO MENDES TEIXEIRA", department: "CONSTRUÇÃO II", date: "02/08", fullDate: "02 de Agosto", avatar: "", admissionDate: "13/04/2021" },
  { name: "DONILTON ALVES DOS SANTOS", department: "EMBALAGEM SPEPII", date: "02/08", fullDate: "02 de Agosto", avatar: "", admissionDate: "01/12/2012" },
  { name: "LUANA EVELYN BORGES DA CUNHA", department: "Controle de Qualidade - Matéria Prima", date: "02/08", fullDate: "02 de Agosto", avatar: "", admissionDate: "05/08/2024" },
  { name: "VINICIUS CRUZ PEREIRA", department: "EMBALAGEM SPEPII", date: "02/09", fullDate: "02 de Setembro", avatar: "", admissionDate: "21/05/2024" },
  { name: "CLAUDINEIDE RODRIGUES BARBOSA ALCANTARA PEREIRA", department: "Cred / Cobrança", date: "02/09", fullDate: "02 de Setembro", avatar: "", admissionDate: "02/01/2012" },
  { name: "JAIR BATISTA", department: "Almoxarifado", date: "02/09", fullDate: "02 de Setembro", avatar: "", admissionDate: "08/04/2020" },
  { name: "AKSSA HEMMILY AMARAL LIMA", department: "Microbiológico", date: "02/09", fullDate: "02 de Setembro", avatar: "", admissionDate: "10/02/2023" },
  { name: "GLEIDSON DAVID DE SOUSA OLIVEIRA", department: "EMBALAGEM SPEPII", date: "02/09", fullDate: "02 de Setembro", avatar: "", admissionDate: "08/04/2019" },
  { name: "MILENA DE OLIVEIRA RAMOS", department: "Embalagem SPPV Vidro", date: "02/09", fullDate: "02 de Setembro", avatar: "", admissionDate: "16/07/2024" },
  { name: "JOSE WANDERLEY PEREIRA", department: "CONSTRUÇÃO II", date: "02/09", fullDate: "02 de Setembro", avatar: "", admissionDate: "22/11/2021" },
  { name: "MARIA CLEONICE FERREIRA", department: "UAN", date: "02/09", fullDate: "02 de Setembro", avatar: "", admissionDate: "04/11/2024" },
  { name: "LUCAS GABRIEL PINHEIRO MENDES", department: "Embalagem SPEP I", date: "03/08", fullDate: "03 de Agosto", avatar: "", admissionDate: "05/07/2022" },
  { name: "MARIA DAS GRACAS UCHOA", department: "LOGÍSTICA", date: "03/08", fullDate: "03 de Agosto", avatar: "", admissionDate: "01/07/2005" },
  { name: "MARIA VIVIANE CORREIA DE SOUSA", department: "Garantia da Qualidade", date: "03/08", fullDate: "03 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "ROMANNE ALVES GONÇALVES GALDINO", department: "Preparação líquidos", date: "03/08", fullDate: "03 de Agosto", avatar: "", admissionDate: "20/05/2019" },
  { name: "DAVI DE SOUSA ALCANTARA", department: "Microbiológico", date: "03/09", fullDate: "03 de Setembro", avatar: "", admissionDate: "02/08/2021" },
  { name: "IANCA CLARA BATISTA", department: "EMBALAGEM SPEPII", date: "03/09", fullDate: "03 de Setembro", avatar: "", admissionDate: "03/07/2023" },
  { name: "ARLEY LUNA BARROS SAMPAIO", department: " DEM Manutenção", date: "03/09", fullDate: "03 de Setembro", avatar: "", admissionDate: "13/02/2025" },
  { name: "FRANCISCO CESAR OLIVEIRA SOUSA JUNIOR", department: "EMBALAGEM SPEPII", date: "03/09", fullDate: "03 de Setembro", avatar: "", admissionDate: "07/10/2024" },
  { name: "ANA ERICA ROCHA SANTOS", department: "Embalagem liquidos", date: "03/09", fullDate: "03 de Setembro", avatar: "", admissionDate: "03/07/2023" },
  { name: "UCLEIVSON DA SILVA NASCIMENTO", department: "Envase líquidos", date: "03/09", fullDate: "03 de Setembro", avatar: "", admissionDate: "01/07/2008" },
  { name: "HELOISA CALIXTA DA SILVA NUNES", department: "ENVASE SPEP II", date: "03/09", fullDate: "03 de Setembro", avatar: "", admissionDate: "20/09/2022" },
  { name: "MONARA GALEGA DE SOUSA", department: "Garantia da Qualidade", date: "03/09", fullDate: "03 de Setembro", avatar: "", admissionDate: "03/09/2020" },
  { name: "JOEL MARCOS SALVIANO DE BRITO", department: "Almoxarifado", date: "04/08", fullDate: "04 de Agosto", avatar: "", admissionDate: "03/01/2023" },
  { name: "ANA PAULA CIPRIANO", department: "UAN", date: "04/08", fullDate: "04 de Agosto", avatar: "", admissionDate: "05/10/2022" },
  { name: "RISOMAR FEITOZA SANTANA", department: "CONSTRUÇÃO II", date: "04/08", fullDate: "04 de Agosto", avatar: "", admissionDate: "01/09/2021" },
  { name: "IRIS SOUSA ALCANTARA", department: "EMBALAGEM SPEPII", date: "04/08", fullDate: "04 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "JOAO EUDES ALVES TEIXEIRA", department: "Embalagem SPEP I", date: "04/08", fullDate: "04 de Agosto", avatar: "", admissionDate: "06/12/2021" },
  { name: "PALOMA PARENTE SILVA", department: "UAN", date: "04/08", fullDate: "04 de Agosto", avatar: "", admissionDate: "01/06/2022" },
  { name: "JOSEMILSON JUSTINO DE FREITAS", department: "Envase SPPV Vidro", date: "04/09", fullDate: "04 de Setembro", avatar: "", admissionDate: "02/01/2023" },
  { name: "ISAC LIMEIRA DE LIMA", department: "MANUTENÇÃO PREDIAL", date: "04/09", fullDate: "04 de Setembro", avatar: "", admissionDate: "02/01/2013" },
  { name: "ANTONIO DE PADUA ALVES FILGUEIRAS", department: "SPP - BOMBONAS", date: "04/09", fullDate: "04 de Setembro", avatar: "", admissionDate: "01/02/2010" },
  { name: "MARIA DAS DORES SILVA", department: "EMBALAGEM SPEPII", date: "04/09", fullDate: "04 de Setembro", avatar: "", admissionDate: "07/04/2017" },
  { name: "ELLEN CAROLINY PEREIRA DE OLIVEIRA", department: "Financeiro", date: "04/09", fullDate: "04 de Setembro", avatar: "", admissionDate: "01/09/2005" },
  { name: "LUIZ FELIPE LIRA MANGUEIRA", department: " DEM Manutenção", date: "05/08", fullDate: "05 de Agosto", avatar: "", admissionDate: "20/05/2015" },
  { name: "CICERO HEMERSON DA SILVA LIMA", department: "EMBALAGEM SPEP III", date: "05/08", fullDate: "05 de Agosto", avatar: "", admissionDate: "20/09/2022" },
  { name: "REBECA VIEIRA DA COSTA", department: "QUALIFICAÇÃO", date: "05/08", fullDate: "05 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "REGINALDO SEBASTIAO VIEIRA", department: "EMBALAGEM SPEPII", date: "05/08", fullDate: "05 de Agosto", avatar: "", admissionDate: "01/10/2012" },
  { name: "ANTONINA JESSICA DAMASCENO LUCIANO", department: "Físico Químico", date: "05/08", fullDate: "05 de Agosto", avatar: "", admissionDate: "03/07/2023" },
  { name: "JONATHAN BENTO DE OLIVEIRA", department: "Embalagem SPEP I", date: "05/08", fullDate: "05 de Agosto", avatar: "", admissionDate: "04/12/2021" },
  { name: "JACIO ARAUJO DA SILVA", department: "EMBALAGEM SPEPII", date: "05/08", fullDate: "05 de Agosto", avatar: "", admissionDate: "02/01/2023" },
  { name: "GILMA DOS SANTOS RAFAEL", department: "SERVIÇOS GERAIS INTERNO", date: "05/08", fullDate: "05 de Agosto", avatar: "", admissionDate: "20/06/2016" },
  { name: "JEFFERSON DAVI DOS SANTOS SANTIAGO", department: "EMBALAGEM SPEP III", date: "05/09", fullDate: "05 de Setembro", avatar: "", admissionDate: "02/02/2023" },
  { name: "ROBERIO DIAS AVELINO", department: "EMBALAGEM SPEPII", date: "05/09", fullDate: "05 de Setembro", avatar: "", admissionDate: "13/07/2015" },
  { name: "CRISTOVAO BARROS DOS SANTOS", department: "EMBALAGEM SPEP III", date: "06/08", fullDate: "06 de Agosto", avatar: "", admissionDate: "03/10/2016" },
  { name: "JOSE JOSIVAN DA SILVA", department: "EMBALAGEM SPEP III", date: "06/08", fullDate: "06 de Agosto", avatar: "", admissionDate: "14/02/2023" },
  { name: "THIAGO NICHOLAS RIBEIRO MARCOS", department: "EMBALAGEM SPEPII", date: "06/08", fullDate: "06 de Agosto", avatar: "", admissionDate: "23/03/2020" },
  { name: "MAURO ADRIANO DOS SANTOS", department: "Almoxarifado", date: "06/08", fullDate: "06 de Agosto", avatar: "", admissionDate: "07/10/2019" },
  { name: "DALVAN PINHEIRO DA SILVA", department: "Envase SPEP I", date: "06/08", fullDate: "06 de Agosto", avatar: "", admissionDate: "06/12/2021" },
  { name: "ALANA DOS SANTOS PEREIRA", department: "SESMT", date: "06/08", fullDate: "06 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "WILKER LUCAS DA SILVA", department: "Microbiológico", date: "06/09", fullDate: "06 de Setembro", avatar: "", admissionDate: "05/08/2024" },
  { name: "JOSE MARCONDES DO NASCIMENTO", department: "CONSTRUÇÃO I", date: "06/09", fullDate: "06 de Setembro", avatar: "", admissionDate: "01/09/2016" },
  { name: "MARIA APARECIDA IZIDRO SERAFIM", department: "Embalagem SPPV Vidro", date: "06/09", fullDate: "06 de Setembro", avatar: "", admissionDate: "01/07/2005" },
  { name: "MARIA EDUARDA MEDEIROS MIRANDA", department: "Envase SPPV Vidro", date: "06/09", fullDate: "06 de Setembro", avatar: "", admissionDate: "01/09/2022" },
  { name: "LUANA DE SOUSA SILVA", department: "Envase SPPV Vidro", date: "07/08", fullDate: "07 de Agosto", avatar: "", admissionDate: "07/10/2019" },
  { name: "DOMYCEL VINICIUS FONSECA SANTOS", department: "Microbiológico", date: "07/08", fullDate: "07 de Agosto", avatar: "", admissionDate: "11/07/2022" },
  { name: "PABLO DIEGO CRUZ VASQUES", department: "SPP - BOMBONAS", date: "07/08", fullDate: "07 de Agosto", avatar: "", admissionDate: "22/04/2025" },
  { name: "GLAYDSON DA SILVA BEZERRA", department: "Validação", date: "07/08", fullDate: "07 de Agosto", avatar: "", admissionDate: "01/07/2020" },
  { name: "MIGUEL NEANGELO ALVES DOS SANTOS", department: "EMBALAGEM SPEPII", date: "07/08", fullDate: "07 de Agosto", avatar: "", admissionDate: "04/04/2022" },
  { name: "CRISTONY DUARTE PALMEIRA", department: "Transporte Pessoal", date: "07/08", fullDate: "07 de Agosto", avatar: "", admissionDate: "01/03/2022" },
  { name: "FRANCISCO ALAN ARAUJO DE SOUZA", department: "Gestão de Projetos", date: "07/08", fullDate: "07 de Agosto", avatar: "", admissionDate: "15/03/2021" },
  { name: "JOSE TAVARES BATISTA", department: "Embalagem SPEP I", date: "07/09", fullDate: "07 de Setembro", avatar: "", admissionDate: "06/12/2021" },
  { name: "ALICE MARIA DE SOUSA RIBEIRO", department: "Embalagem SPEP I", date: "07/09", fullDate: "07 de Setembro", avatar: "", admissionDate: "10/01/2025" },
  { name: "DEGIELLY LOHANIA FELIX RODRIGUES", department: "Contabilidade", date: "07/09", fullDate: "07 de Setembro", avatar: "", admissionDate: "14/05/2018" },
  { name: "CICERO GOMES PEREIRA", department: "Transportes de Cargas - Entrega", date: "07/09", fullDate: "07 de Setembro", avatar: "", admissionDate: "17/07/2023" },
  { name: "ANTONIO WILSON DE SOUZA JUNIOR", department: "CONSTRUÇÃO I", date: "07/09", fullDate: "07 de Setembro", avatar: "", admissionDate: "01/02/2017" },
  { name: "FELISBERTO FARIAS SANTOS", department: "QUALIFICAÇÃO", date: "08/08", fullDate: "08 de Agosto", avatar: "", admissionDate: "01/09/2021" },
  { name: "RIKAELA ALVES DE LIMA", department: "EMBALAGEM SPEPII", date: "08/08", fullDate: "08 de Agosto", avatar: "", admissionDate: "03/01/2023" },
  { name: "GILSON HENRIQUE SANTOS DO NASCIMENTO", department: "EMBALAGEM SPEP III", date: "08/08", fullDate: "08 de Agosto", avatar: "", admissionDate: "02/01/2023" },
  { name: "CICERO EDILANIO TAVARES ARAUJO", department: " DEM Manutenção", date: "08/08", fullDate: "08 de Agosto", avatar: "", admissionDate: "03/09/2001" },
  { name: "JONAS VINICIUS DE BRITO SILVA", department: "Almoxarifado", date: "08/09", fullDate: "08 de Setembro", avatar: "", admissionDate: "08/01/2018" },
  { name: "MARIA ALANIA ELIAS SANTANA", department: "EMBALAGEM SPEPII", date: "08/09", fullDate: "08 de Setembro", avatar: "", admissionDate: "10/01/2025" },
  { name: "MARIA LUCINARA FERREIRA XAVIER", department: "Garantia da Qualidade", date: "08/09", fullDate: "08 de Setembro", avatar: "", admissionDate: "10/01/2023" },
  { name: "LUIZ CARLOS ALVES DE SOUZA", department: "CONSTRUÇÃO II", date: "08/09", fullDate: "08 de Setembro", avatar: "", admissionDate: "21/05/2024" },
  { name: "ERNANDES CRUZ DOS SANTOS FILHO", department: "Validação", date: "08/09", fullDate: "08 de Setembro", avatar: "", admissionDate: "03/01/2023" },
  { name: "EVERTON SOUSA DOS SANTOS", department: "Transporte Pessoal", date: "08/09", fullDate: "08 de Setembro", avatar: "", admissionDate: "02/05/2007" },
  { name: "JOSIVAN DE FARIAS SALES", department: "SPP - BOMBONAS", date: "08/09", fullDate: "08 de Setembro", avatar: "", admissionDate: "01/07/2021" },
  { name: "FRANCISCO CLEMATO NILTOM DE SA BARRETO", department: "CONSTRUÇÃO I", date: "08/09", fullDate: "08 de Setembro", avatar: "", admissionDate: "03/12/2018" },
  { name: "RONALDA CRISTINA GOMES FERREIRA", department: "Embalagem SPEP I", date: "08/09", fullDate: "08 de Setembro", avatar: "", admissionDate: "04/10/2010" },
  { name: "ADILANE PEREIRA DA SILVA", department: "Microbiológico", date: "08/09", fullDate: "08 de Setembro", avatar: "", admissionDate: "03/11/2009" },
  { name: "AMANDA CARLOS DA PAIXAO", department: "EMBALAGEM SPEP III", date: "09/08", fullDate: "09 de Agosto", avatar: "", admissionDate: "10/01/2023" },
  { name: "KAANDA DA COSTA SANTANA", department: "Embalagem SPEP I", date: "09/08", fullDate: "09 de Agosto", avatar: "", admissionDate: "03/07/2023" },
  { name: "VANDERLELEY PEREIRA DA SILVA", department: "EMBALAGEM SPEPII", date: "09/08", fullDate: "09 de Agosto", avatar: "", admissionDate: "20/09/2021" },
  { name: "WILLIANE FONSECA DANTAS", department: "Comercial", date: "09/08", fullDate: "09 de Agosto", avatar: "", admissionDate: "02/02/2015" },
  { name: "ANTERO ALVES DE SOUZA NETO", department: "SPP - BOMBONAS", date: "09/08", fullDate: "09 de Agosto", avatar: "", admissionDate: "01/02/2010" },
  { name: "MARIA RAIRES DA SILVA BENTO", department: "EMBALAGEM SPEPII", date: "09/08", fullDate: "09 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "JEFERSON BARBOSA DE OLIVEIRA", department: "EMBALAGEM SPEP III", date: "09/08", fullDate: "09 de Agosto", avatar: "", admissionDate: "10/01/2023" },
  { name: "CICERO HELBER DE AMORIM", department: "Transporte Pessoal", date: "09/08", fullDate: "09 de Agosto", avatar: "", admissionDate: "04/03/2025" },
  { name: "CICERO FELIPE PEREIRA DA SILVA", department: "Almoxarifado", date: "09/08", fullDate: "09 de Agosto", avatar: "", admissionDate: "02/08/2021" },
  { name: "GILBERTO FRANCISCO DO NASCIMENTO", department: "Transportes de Cargas - Entrega", date: "09/08", fullDate: "09 de Agosto", avatar: "", admissionDate: "02/07/2018" },
  { name: "JOSE RICARDO VIEIRA COELHO", department: "Transportes de Cargas - Entrega", date: "09/09", fullDate: "09 de Setembro", avatar: "", admissionDate: "15/10/2007" },
  { name: "PAULO MARQUES BERTO", department: "Embalagem liquidos", date: "09/09", fullDate: "09 de Setembro", avatar: "", admissionDate: "03/10/2016" },
  { name: "MARINA BARBOZA DOS SANTOS", department: "EMBALAGEM SPEPII", date: "09/09", fullDate: "09 de Setembro", avatar: "", admissionDate: "20/05/2024" },
  { name: "ANDERSON DE OLIVEIRA SOUZA", department: "Envase líquidos", date: "09/09", fullDate: "09 de Setembro", avatar: "", admissionDate: "01/10/2013" },
  { name: "MANOEL FELIX DE SOUSA", department: "CONSTRUÇÃO II", date: "09/09", fullDate: "09 de Setembro", avatar: "", admissionDate: "04/10/2021" },
  { name: "ANTONIO TEOFILO DOS SANTOS ALEXANDRE", department: "ENVASE SPEP II", date: "09/09", fullDate: "09 de Setembro", avatar: "", admissionDate: "01/10/2010" },
  { name: "FABIO LUDGERIO DE SOUZA", department: "Envase SPPV Vidro", date: "09/09", fullDate: "09 de Setembro", avatar: "", admissionDate: "20/11/2000" },
  { name: "WELDER DOUGLAS PEREIRA CORREA", department: "EMBALAGEM SPEP III", date: "09/09", fullDate: "09 de Setembro", avatar: "", admissionDate: "02/10/2024" },
  { name: "LINDOMAR DA SILVA", department: "SERVIÇOS GERAIS INTERNO", date: "10/08", fullDate: "10 de Agosto", avatar: "", admissionDate: "05/02/2020" },
  { name: "JOAO FERNANDES DE SOUSA", department: "CONSTRUÇÃO II", date: "10/08", fullDate: "10 de Agosto", avatar: "", admissionDate: "16/06/2021" },
  { name: "JOSE GUTEMBERG DOS SANTOS GOMES", department: "Expedição Geral", date: "10/08", fullDate: "10 de Agosto", avatar: "", admissionDate: "02/05/2001" },
  { name: "JACKSON CARVALHO GARCIA", department: "Garantia da Qualidade", date: "10/08", fullDate: "10 de Agosto", avatar: "", admissionDate: "01/11/2012" },
  { name: "RODRIGO SILVA ANDRADE", department: "EMBALAGEM SPEPII", date: "10/09", fullDate: "10 de Setembro", avatar: "", admissionDate: "02/08/2021" },
  { name: "ALAN MOREIRA ALVES", department: "EMBALAGEM SPEPII", date: "10/09", fullDate: "10 de Setembro", avatar: "", admissionDate: "04/09/2023" },
  { name: "GILVANILDO ALVINO DOS SANTOS", department: "Embalagem SPEP I", date: "10/09", fullDate: "10 de Setembro", avatar: "", admissionDate: "05/05/2001" },
  { name: "OSMAR PEDRO DA SILVA", department: "Físico Químico", date: "10/09", fullDate: "10 de Setembro", avatar: "", admissionDate: "10/02/2015" },
  { name: "CASSIANA RODRIGUES PEREIRA AGUIAR", department: "Garantia da Qualidade", date: "10/09", fullDate: "10 de Setembro", avatar: "", admissionDate: "06/05/2019" },
  { name: "FABIO DE CASTRO BOAVENTURA", department: "C P H D", date: "10/09", fullDate: "10 de Setembro", avatar: "", admissionDate: "16/10/2023" },
  { name: "PAULO VICTOR DA SILVA ARAUJO", department: "EMBALAGEM SPEPII", date: "10/09", fullDate: "10 de Setembro", avatar: "", admissionDate: "24/05/2017" },
  { name: "ALEXANDRE AMARO DE ALENCAR COUTINHO", department: "EMBALAGEM SPEP III", date: "10/09", fullDate: "10 de Setembro", avatar: "", admissionDate: "01/02/2023" },
  { name: "MARIA DANIELLE RAMALHO", department: "Microbiológico", date: "11/08", fullDate: "11 de Agosto", avatar: "", admissionDate: "09/02/2023" },
  { name: "FRANCISCO ASSIS ALMEIDA", department: "Transportes de Cargas - Entrega", date: "11/08", fullDate: "11 de Agosto", avatar: "", admissionDate: "01/07/2015" },
  { name: "CICERA LUCIANA VIEIRA BEZERRA CORNELIO", department: "Financeiro", date: "11/08", fullDate: "11 de Agosto", avatar: "", admissionDate: "01/02/2006" },
  { name: "MOISES CANCILDO LUNA MARTINS", department: "Almoxarifado", date: "11/08", fullDate: "11 de Agosto", avatar: "", admissionDate: "02/12/2002" },
  { name: "ERIVANO NASCIMENTO DA SILVA", department: " DEM Manutenção", date: "11/08", fullDate: "11 de Agosto", avatar: "", admissionDate: "01/06/2023" },
  { name: "JOHN WEBERT CRUZ FRANCELINO", department: "Físico Químico", date: "11/09", fullDate: "11 de Setembro", avatar: "", admissionDate: "01/08/2011" },
  { name: "GLEDSON DA SILVA", department: "Embalagem SPEP I", date: "11/09", fullDate: "11 de Setembro", avatar: "", admissionDate: "17/01/2022" },
  { name: "RAFAEL MAGNO ALVES DOS SANTOS", department: "Expedição Geral", date: "11/09", fullDate: "11 de Setembro", avatar: "", admissionDate: "21/08/2015" },
  { name: "ALICE MARIA ALVES DE ALMEIDA", department: "Embalagem SPPV Vidro", date: "12/08", fullDate: "12 de Agosto", avatar: "", admissionDate: "03/04/2023" },
  { name: "SAMUEL DAVID PEREIRA DE SA BARRETO", department: "Envase SPEP I", date: "12/08", fullDate: "12 de Agosto", avatar: "", admissionDate: "01/07/2009" },
  { name: "RICARDO RONIEL DE OLIVEIRA LIMA", department: "Físico Químico", date: "12/08", fullDate: "12 de Agosto", avatar: "", admissionDate: "11/12/2018" },
  { name: "ANTONIO FRANCISCO DA SILVA", department: "Tecnologia da Informação", date: "12/08", fullDate: "12 de Agosto", avatar: "", admissionDate: "04/11/2024" },
  { name: "CICERO ROBERIO RODRIGUES SILVA", department: "Almoxarifado", date: "12/08", fullDate: "12 de Agosto", avatar: "", admissionDate: "01/06/2013" },
  { name: "EDILSON JOSE DA SILVA", department: "Expedição Geral", date: "12/08", fullDate: "12 de Agosto", avatar: "", admissionDate: "03/04/2009" },
  { name: "WALDELANYO FURTADO LANDIM", department: "LOGÍSTICA", date: "12/09", fullDate: "12 de Setembro", avatar: "", admissionDate: "01/09/2016" },
  { name: "RAFAEL LIRA MANGUEIRA", department: " DEM Manutenção", date: "12/09", fullDate: "12 de Setembro", avatar: "", admissionDate: "01/11/2017" },
  { name: "MARIA LENI DOS SANTOS", department: "Embalagem SPPV Vidro", date: "12/09", fullDate: "12 de Setembro", avatar: "", admissionDate: "12/04/2004" },
  { name: "YGOR DE MELO COSTA", department: "Embalagem liquidos", date: "12/09", fullDate: "12 de Setembro", avatar: "", admissionDate: "02/08/2021" },
  { name: "TALES CAUA DOS SANTOS QUEIROZ", department: "Embalagem SPPV Vidro", date: "12/09", fullDate: "12 de Setembro", avatar: "", admissionDate: "21/10/2024" },
  { name: "JOSIANA GONCALVES DA SILVA", department: "EMBALAGEM SPEPII", date: "12/09", fullDate: "12 de Setembro", avatar: "", admissionDate: "19/09/2022" },
  { name: "MARIA RIBEIRO DA CRUZ", department: "Embalagem liquidos", date: "13/08", fullDate: "13 de Agosto", avatar: "", admissionDate: "01/11/2001" },
  { name: "JOSE MARCONY DA SILVA BATISTA", department: "Preparação líquidos", date: "13/09", fullDate: "13 de Setembro", avatar: "", admissionDate: "01/07/2021" },
  { name: "JOSE VINICIUS DE CARVALHO", department: "EMBALAGEM SPEP III", date: "13/09", fullDate: "13 de Setembro", avatar: "", admissionDate: "21/10/2024" },
  { name: "MARIA DEUZANIRA BRAGA SILVA", department: "UAN", date: "13/09", fullDate: "13 de Setembro", avatar: "", admissionDate: "01/02/2008" },
  { name: "CICERA RENATA PATRICIO SILVA SANTOS", department: "Envase SPEP I", date: "13/09", fullDate: "13 de Setembro", avatar: "", admissionDate: "02/06/1997" },
  { name: "ADERLANDIO PEREIRA DA SILVA SANTOS", department: "Embalagem SPEP I", date: "13/09", fullDate: "13 de Setembro", avatar: "", admissionDate: "01/10/2010" },
  { name: "EDILANIO JOSE DE OLIVEIRA", department: "Embalagem SPEP I", date: "13/09", fullDate: "13 de Setembro", avatar: "", admissionDate: "01/07/2009" },
  { name: "FRANCISCO ARLAN DE SOUZA VIEIRA", department: "UAN", date: "13/09", fullDate: "13 de Setembro", avatar: "", admissionDate: "16/03/2017" },
  { name: "JOSE RIBAMAR GOMES DA SILVA", department: "SPP - BOMBONAS", date: "13/09", fullDate: "13 de Setembro", avatar: "", admissionDate: "03/11/2009" },
  { name: "FRANCISCO EUDES MAGALHAES FILHO", department: "Microbiológico", date: "14/08", fullDate: "14 de Agosto", avatar: "", admissionDate: "08/04/2024" },
  { name: "CICERA ALVES DA SILVA", department: "SPP-FRASCOS E AMPOLAS", date: "14/08", fullDate: "14 de Agosto", avatar: "", admissionDate: "15/07/2005" },
  { name: "JOSINALDO FERREIRA DOS SANTOS", department: "Embalagem SPEP I", date: "14/08", fullDate: "14 de Agosto", avatar: "", admissionDate: "01/03/2022" },
  { name: "JOSE DANIEL BARBOSA CARDOSO", department: "C P H D", date: "14/09", fullDate: "14 de Setembro", avatar: "", admissionDate: "04/12/2017" },
  { name: "JOVANILDO BATISTA SILVEIRA", department: "Esterilização SPPV Vidro", date: "14/09", fullDate: "14 de Setembro", avatar: "", admissionDate: "08/07/2021" },
  { name: "MARIA IVINA COELHO GONÇALVES", department: "Validação", date: "14/09", fullDate: "14 de Setembro", avatar: "", admissionDate: "18/05/2020" },
  { name: "JOSE SALVANI MACEDO", department: "Transporte Administração", date: "14/09", fullDate: "14 de Setembro", avatar: "", admissionDate: "01/02/2006" },
  { name: "RUANN KARLLOS DE OLIVEIRA LIMA", department: "EMBALAGEM SPEPII", date: "14/09", fullDate: "14 de Setembro", avatar: "", admissionDate: "03/07/2023" },
  { name: "EDNALDO ROCHA DOS SANTOS", department: "Embalagem SPEP I", date: "14/09", fullDate: "14 de Setembro", avatar: "", admissionDate: "04/06/2024" },
  { name: "VIVIAN EDUARDA QUEIROZ ALVES", department: "Embalagem SPPV Vidro", date: "15/08", fullDate: "15 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "RANIELE MARIA FIRMINO SATURNINO", department: "Comercial", date: "15/08", fullDate: "15 de Agosto", avatar: "", admissionDate: "01/08/2009" },
  { name: "DHERYCK LUCAS DO NASCIMENTO ARIMATEA", department: "EMBALAGEM SPEPII", date: "15/08", fullDate: "15 de Agosto", avatar: "", admissionDate: "01/07/2014" },
  { name: "ALEF GABRIEL NUNES MACEDO", department: "SPP - BOMBONAS", date: "15/08", fullDate: "15 de Agosto", avatar: "", admissionDate: "22/08/2023" },
  { name: "SARA DOS SANTOS VIEIRA", department: "Físico Químico", date: "15/08", fullDate: "15 de Agosto", avatar: "", admissionDate: "25/08/2014" },
  { name: "MARIA PATRICIA DE OLIVEIRA", department: "EMBALAGEM SPEP III", date: "15/08", fullDate: "15 de Agosto", avatar: "", admissionDate: "19/09/2022" },
  { name: "ADRIANA DA SILVA PEREIRA", department: "Serviços Médicos", date: "15/08", fullDate: "15 de Agosto", avatar: "", admissionDate: "10/02/2023" },
  { name: "MARCIEL MICHAEL SENA DO NASCIMENTO", department: "SPP - EXTRUSÃO", date: "15/08", fullDate: "15 de Agosto", avatar: "", admissionDate: "01/07/2015" },
  { name: "FANOEL FONSECA DA SILVA", department: "EMBALAGEM SPEPII", date: "15/09", fullDate: "15 de Setembro", avatar: "", admissionDate: "20/09/2022" },
  { name: "EMANUELA DOS SANTOS ROCHA", department: "Garantia da Qualidade", date: "15/09", fullDate: "15 de Setembro", avatar: "", admissionDate: "01/12/2012" },
  { name: "HELOISA ALVES DE MOURA FREIRE", department: "Envase SPPV Vidro", date: "15/09", fullDate: "15 de Setembro", avatar: "", admissionDate: "20/05/2019" },
  { name: "REGINA RODRIGUES DE SOUSA", department: "R H", date: "15/09", fullDate: "15 de Setembro", avatar: "", admissionDate: "22/10/2012" },
  { name: "ANDREA VANESSA NASCIMENTO SILVA", department: "Microbiológico", date: "15/09", fullDate: "15 de Setembro", avatar: "", admissionDate: "12/09/2024" },
  { name: "JORDAN DAVI BERNARDES DE SOUSA", department: "EMBALAGEM SPEP III", date: "15/09", fullDate: "15 de Setembro", avatar: "", admissionDate: "02/01/2023" },
  { name: "DANIELE CRISTINA DOS SANTOS AZEVEDO", department: "Garantia da Qualidade", date: "15/09", fullDate: "15 de Setembro", avatar: "", admissionDate: "15/07/2005" },
  { name: "IONARA SINEZIO DO NASCIMENTO SILVA", department: "Controle de Qualidade - Matéria Prima", date: "15/09", fullDate: "15 de Setembro", avatar: "", admissionDate: "10/01/2025" },
  { name: "CICERO ELU SILVA DOS SANTOS", department: "SPEP - MANUTENÇAO E OPERAÇÃO", date: "15/09", fullDate: "15 de Setembro", avatar: "", admissionDate: "02/05/2005" },
  { name: "ALLAN FRANCISCO PEREIRA BEZERRA", department: "Físico Químico", date: "16/08", fullDate: "16 de Agosto", avatar: "", admissionDate: "01/08/2012" },
  { name: "MATEUS DE SOUZA MENDES", department: "PESQUISA, DESENVOLVIMENTO E INOVAÇÃO", date: "16/08", fullDate: "16 de Agosto", avatar: "", admissionDate: "14/07/2025" },
  { name: "MARIA ELISANGELA DE SOUZA BEZERRA", department: "EMBALAGEM SPEPII", date: "16/08", fullDate: "16 de Agosto", avatar: "", admissionDate: "01/12/2010" },
  { name: "AIRTON CARLOS DE SANTANA", department: "SPP - EXTRUSÃO", date: "16/08", fullDate: "16 de Agosto", avatar: "", admissionDate: "03/02/2014" },
  { name: "ELIAS RICARTE DA SILVA", department: "EMBALAGEM SPEP III", date: "16/08", fullDate: "16 de Agosto", avatar: "", admissionDate: "18/08/2021" },
  { name: "ERICLES SILVA SANTOS", department: "ENVASE SPEP III", date: "16/08", fullDate: "16 de Agosto", avatar: "", admissionDate: "02/02/2023" },
  { name: "JAQUELINE COSME DA SILVA", department: "Serviços Médicos", date: "16/08", fullDate: "16 de Agosto", avatar: "", admissionDate: "12/02/2020" },
  { name: "ROMARIO VICTOR GOMES", department: "EMBALAGEM SPEPII", date: "16/08", fullDate: "16 de Agosto", avatar: "", admissionDate: "09/07/2018" },
  { name: "ADELANIO SANTANA DE OLIVEIRA", department: "SPP - BOMBONAS", date: "16/09", fullDate: "16 de Setembro", avatar: "", admissionDate: "01/08/2016" },
  { name: "DAVI RODRIGUES DA SILVA", department: "EMBALAGEM SPEP III", date: "16/09", fullDate: "16 de Setembro", avatar: "", admissionDate: "06/07/2016" },
  { name: "PAULO HENRIQUE GONZAGA CUNHA", department: "Envase SPEP I", date: "16/09", fullDate: "16 de Setembro", avatar: "", admissionDate: "20/05/2024" },
  { name: "ROGERIO SILVINO ARAUJO RODRIGUES", department: "C P H D", date: "16/09", fullDate: "16 de Setembro", avatar: "", admissionDate: "01/07/2021" },
  { name: "MARIA WISLAYNE PEREIRA FERREIRA", department: "Controle de Qualidade - Matéria Prima", date: "17/08", fullDate: "17 de Agosto", avatar: "", admissionDate: "01/08/2023" },
  { name: "CICERA JOELMA FERREIRA DUARTE", department: "EMBALAGEM SPEPII", date: "17/08", fullDate: "17 de Agosto", avatar: "", admissionDate: "01/07/2009" },
  { name: "YARA DA SILVA SANTOS", department: "EMBALAGEM SPEPII", date: "17/08", fullDate: "17 de Agosto", avatar: "", admissionDate: "03/06/2024" },
  { name: "GILLIARD GUALBERTO RODRIGUES BRANDÃO", department: "Almoxarifado", date: "17/08", fullDate: "17 de Agosto", avatar: "", admissionDate: "01/07/2005" },
  { name: "CICERA ERILANE DE SOUSA FERREIRA", department: "Embalagem SPPV Vidro", date: "17/08", fullDate: "17 de Agosto", avatar: "", admissionDate: "07/10/2019" },
  { name: "TEREZINHA SOUZA DOS SANTOS", department: "UAN", date: "17/08", fullDate: "17 de Agosto", avatar: "", admissionDate: "01/02/2008" },
  { name: "CICERO VICENTE DOS SANTOS", department: "Envase SPPV Vidro", date: "17/08", fullDate: "17 de Agosto", avatar: "", admissionDate: "01/03/2022" },
  { name: "ALINE DE LIMA NEVES", department: "EMBALAGEM SPEP III", date: "17/09", fullDate: "17 de Setembro", avatar: "", admissionDate: "05/12/2023" },
  { name: "VIRNA LUANA DE SOUSA GRANGEIRO", department: "EMBALAGEM SPEP III", date: "17/09", fullDate: "17 de Setembro", avatar: "", admissionDate: "02/08/2024" },
  { name: "ALEXANDRE FRAZÃO MARIANO", department: "Embalagem SPPV Vidro", date: "17/09", fullDate: "17 de Setembro", avatar: "", admissionDate: "06/07/2020" },
  { name: "JONATA ISRAEL DOS SANTOS PEREIRA", department: "EMBALAGEM SPEP III", date: "17/09", fullDate: "17 de Setembro", avatar: "", admissionDate: "05/11/2024" },
  { name: "CICERA JONIAN FILGUEIRA TELES SILVA", department: "EMBALAGEM SPEP III", date: "18/08", fullDate: "18 de Agosto", avatar: "", admissionDate: "02/08/2024" },
  { name: "MARIA PORFIRIO DE SOUSA", department: "SPP - BOMBONAS", date: "18/08", fullDate: "18 de Agosto", avatar: "", admissionDate: "01/07/2004" },
  { name: "MARIA DO SOCORRO LUCIANO NOGUEIRA", department: "Envase SPEP I", date: "18/08", fullDate: "18 de Agosto", avatar: "", admissionDate: "06/03/2017" },
  { name: "LUCAS MARIANO DA SILVA", department: "EMBALAGEM SPEP III", date: "18/09", fullDate: "18 de Setembro", avatar: "", admissionDate: "17/04/2024" },
  { name: "LUYANN LIVINO FERREIRA", department: "Garantia da Qualidade", date: "18/09", fullDate: "18 de Setembro", avatar: "", admissionDate: "20/07/2023" },
  { name: "VICTOR HUGO DA SILVA TEOFILO", department: "EMBALAGEM SPEP III", date: "18/09", fullDate: "18 de Setembro", avatar: "", admissionDate: "20/09/2022" },
  { name: "CICERO HELIO FERREIRA DOS SANTOS", department: "CONSTRUÇÃO I", date: "18/09", fullDate: "18 de Setembro", avatar: "", admissionDate: "14/05/2018" },
  { name: "PAULO SERGIO DA SILVA", department: "EMBALAGEM SPEPII", date: "18/09", fullDate: "18 de Setembro", avatar: "", admissionDate: "06/12/2021" },
  { name: "LINDECY DOS SANTOS ALVES", department: "Embalagem liquidos", date: "19/08", fullDate: "19 de Agosto", avatar: "", admissionDate: "06/11/2023" },
  { name: "JOSE WELINGTON BALDOINO MATIAS", department: "EMBALAGEM SPEPII", date: "19/08", fullDate: "19 de Agosto", avatar: "", admissionDate: "01/03/2006" },
  { name: "CICERO BERNARDO CORREIA", department: "CONSTRUÇÃO I", date: "19/08", fullDate: "19 de Agosto", avatar: "", admissionDate: "21/07/2025" },
  { name: "ACACIO DOS SANTOS TAVARES DO NASCIMENTO", department: "Caldeira", date: "19/09", fullDate: "19 de Setembro", avatar: "", admissionDate: "02/08/2017" },
  { name: "FRANCISCO SAULO BATISTA LIMA", department: "SPP - BOMBONAS", date: "19/09", fullDate: "19 de Setembro", avatar: "", admissionDate: "01/04/2008" },
  { name: "CAIO ADRIANO ELIAS COSTA", department: "Embalagem SPEP I", date: "19/09", fullDate: "19 de Setembro", avatar: "", admissionDate: "04/04/2022" },
  { name: "MARIA SUZANNE FERREIRA SILVA", department: "Embalagem liquidos", date: "20/08", fullDate: "20 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "MARIA HELOISA DA SILVA LOPES", department: "Embalagem liquidos", date: "20/08", fullDate: "20 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "ROGERIO CARLOS LOIOLA JUNIOR", department: "Tecnologia da Informação", date: "20/08", fullDate: "20 de Agosto", avatar: "", admissionDate: "19/09/2022" },
  { name: "JERFFERSON DE SOUZA SILVA", department: "Controle de Qualidade - Matéria Prima", date: "20/08", fullDate: "20 de Agosto", avatar: "", admissionDate: "01/02/2024" },
  { name: "JOSE ATILA ALEXANDRE DO NASCIMENTO", department: "Embalagem SPPV Vidro", date: "20/08", fullDate: "20 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "FRANCISCO ROBERTO DE SOUSA", department: "CONSTRUÇÃO II", date: "20/08", fullDate: "20 de Agosto", avatar: "", admissionDate: "01/04/2009" },
  { name: "LEONARDO VITORINO SANTOS", department: "Garantia da Qualidade", date: "20/08", fullDate: "20 de Agosto", avatar: "", admissionDate: "01/03/2022" },
  { name: "SEVERINA MARIA ELIAS", department: "UAN", date: "20/08", fullDate: "20 de Agosto", avatar: "", admissionDate: "01/04/2010" },
  { name: "MARIA LARISSE ROCHA SANTANA", department: "Embalagem SPEP I", date: "20/08", fullDate: "20 de Agosto", avatar: "", admissionDate: "01/04/2017" },
  { name: "GONALDO CALIXTA DA SILVA", department: "Embalagem SPEP I", date: "20/09", fullDate: "20 de Setembro", avatar: "", admissionDate: "01/08/2002" },
  { name: "GISELE JOISK LEITE GONÇALVES", department: "Garantia da Qualidade", date: "20/09", fullDate: "20 de Setembro", avatar: "", admissionDate: "22/10/2018" },
  { name: "JADERSON DE SOUSA SABINO", department: "Envase SPPV Vidro", date: "20/09", fullDate: "20 de Setembro", avatar: "", admissionDate: "01/10/2013" },
  { name: "JOSE BARBOSA DE AGUIAR FILHO", department: " DEM Manutenção", date: "20/09", fullDate: "20 de Setembro", avatar: "", admissionDate: "12/09/2024" },
  { name: "CICERA SILVA DOS SANTOS", department: "UAN", date: "21/08", fullDate: "21 de Agosto", avatar: "", admissionDate: "02/12/2013" },
  { name: "DAYANNE ALVES DE LIMA", department: "EMBALAGEM SPEPII", date: "21/08", fullDate: "21 de Agosto", avatar: "", admissionDate: "22/10/2012" },
  { name: "ANDRE DE SOUZA", department: "C P H D", date: "21/08", fullDate: "21 de Agosto", avatar: "", admissionDate: "03/01/2011" },
  { name: "LAYONS GOMES EVANGELISTA", department: "Garantia da Qualidade", date: "21/08", fullDate: "21 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "GABRIELA LOPES DE CARVALHO", department: "Garantia da Qualidade", date: "21/08", fullDate: "21 de Agosto", avatar: "", admissionDate: "26/08/2020" },
  { name: "ANGELA BEATRIZ SILVA GALDINO", department: "Envase SPPV Vidro", date: "21/09", fullDate: "21 de Setembro", avatar: "", admissionDate: "02/10/2023" },
  { name: "FABIOLA LOPES ALMINO DE LIMA", department: "Contabilidade", date: "21/09", fullDate: "21 de Setembro", avatar: "", admissionDate: "03/06/2019" },
  { name: "JOSE NAYRON DUARTE DE OLIVEIRA", department: "EMBALAGEM SPEP III", date: "21/09", fullDate: "21 de Setembro", avatar: "", admissionDate: "01/03/2022" },
  { name: "CICERO ANTONIO DOS SANTOS COELHO", department: "Transporte Pessoal", date: "21/09", fullDate: "21 de Setembro", avatar: "", admissionDate: "01/09/2014" },
  { name: "RENATO SILVINO DOS SANTOS", department: "CONSTRUÇÃO I", date: "21/09", fullDate: "21 de Setembro", avatar: "", admissionDate: "02/05/2014" },
  { name: "VICENTE IRANILSON BATISTA", department: "Envase SPPV Vidro", date: "21/09", fullDate: "21 de Setembro", avatar: "", admissionDate: "02/01/2023" },
  { name: "MARIA ELISETE DANTAS RODRIGUES VELOZO", department: "Físico Químico", date: "21/09", fullDate: "21 de Setembro", avatar: "", admissionDate: "01/03/1997" },
  { name: "ALEX RODRIGUES SOARES", department: "Embalagem SPPV Vidro", date: "21/09", fullDate: "21 de Setembro", avatar: "", admissionDate: "12/08/2024" },
  { name: "LUCAS TAVARES DE QUEIROZ", department: "Envase SPPV Vidro", date: "21/09", fullDate: "21 de Setembro", avatar: "", admissionDate: "02/07/2018" },
  { name: "INGRID DA COSTA CABOCLO SILVA", department: "Embalagem SPEP I", date: "22/08", fullDate: "22 de Agosto", avatar: "", admissionDate: "20/09/2022" },
  { name: "JUAREZ DOMINGOS ALEXANDRE QUEIROZ LUCAS", department: "Embalagem SPPV Vidro", date: "22/08", fullDate: "22 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "CLEITON BENTO DE BRITO", department: "EMBALAGEM SPEPII", date: "22/08", fullDate: "22 de Agosto", avatar: "", admissionDate: "05/07/2022" },
  { name: "MARCOS NATANAEL GOMES LIMA", department: "Microbiológico", date: "22/08", fullDate: "22 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "VICTOR HUGO DIAS LAURINDO", department: "Preparação líquidos", date: "22/08", fullDate: "22 de Agosto", avatar: "", admissionDate: "02/02/2015" },
  { name: "TASSO RAFAEL DA SILVA SANTOS", department: "Preparação líquidos", date: "22/08", fullDate: "22 de Agosto", avatar: "", admissionDate: "01/07/2008" },
  { name: "JOAO PAULO VIEIRA DOS SANTOS", department: "Expedição Geral", date: "22/08", fullDate: "22 de Agosto", avatar: "", admissionDate: "01/11/2010" },
  { name: "LUCAS DA SILVA", department: "EMBALAGEM SPEP III", date: "22/08", fullDate: "22 de Agosto", avatar: "", admissionDate: "10/01/2023" },
  { name: "RAFAEL SILVA DOS SANTOS", department: " DEM Manutenção", date: "22/09", fullDate: "22 de Setembro", avatar: "", admissionDate: "16/09/2024" },
  { name: "FRANCISCO ERINALDO FAUSTINO", department: "C P H D", date: "22/09", fullDate: "22 de Setembro", avatar: "", admissionDate: "03/01/2011" },
  { name: "FREDSON DA SILVA VIANA", department: "PREPARAÇÃO SPEP II", date: "22/09", fullDate: "22 de Setembro", avatar: "", admissionDate: "02/02/2023" },
  { name: "CICERO EDUARDO BELARMINO DA SILVA", department: "Embalagem SPEP I", date: "22/09", fullDate: "22 de Setembro", avatar: "", admissionDate: "01/11/2013" },
  { name: "JOAO ZAQUEU SANTOS DA SILVA", department: "Embalagem SPEP I", date: "23/08", fullDate: "23 de Agosto", avatar: "", admissionDate: "02/06/2014" },
  { name: "JOAQUIM DA COSTA ALEXANDRE", department: "Embalagem SPPV Vidro", date: "23/08", fullDate: "23 de Agosto", avatar: "", admissionDate: "15/04/2019" },
  { name: "CILENE BARBOSA DA SILVA PEREIRA", department: "LOGÍSTICA", date: "23/08", fullDate: "23 de Agosto", avatar: "", admissionDate: "01/09/2008" },
  { name: "PEDRO FELIPE VIEIRA DE SOUZA", department: "MANUTENÇÃO PREDIAL", date: "23/08", fullDate: "23 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "JOSE WESLLEY DELMIRO DOS SANTOS", department: "Garantia da Qualidade", date: "23/09", fullDate: "23 de Setembro", avatar: "", admissionDate: "05/12/2023" },
  { name: "CORINA RUTH NUNES DALENCAR NOCA", department: "Físico Químico", date: "23/09", fullDate: "23 de Setembro", avatar: "", admissionDate: "03/09/2002" },
  { name: "FRANCISCA FABRICIA SANTOS DA SILVA", department: "Físico Químico", date: "23/09", fullDate: "23 de Setembro", avatar: "", admissionDate: "03/07/2024" },
  { name: "INGRID MEDEIROS DA SILVA", department: "Embalagem SPEP I", date: "24/08", fullDate: "24 de Agosto", avatar: "", admissionDate: "03/07/2023" },
  { name: "RIVALDO DA SILVA GALVAO", department: "Embalagem SPEP I", date: "24/08", fullDate: "24 de Agosto", avatar: "", admissionDate: "01/04/2014" },
  { name: "MANOEL SALVIANO SOBRINHO", department: "Administração", date: "24/09", fullDate: "24 de Setembro", avatar: "", admissionDate: "01/02/2022" },
  { name: "IVANILTON MARTINS ALVES", department: "C P H D", date: "24/09", fullDate: "24 de Setembro", avatar: "", admissionDate: "01/06/2004" },
  { name: "WILTON VARGAS DA SILVA SANTOS", department: "EMBALAGEM SPEPII", date: "24/09", fullDate: "24 de Setembro", avatar: "", admissionDate: "03/06/2024" },
  { name: "JOSE EDILSON DE SOUZA PEREIRA", department: "STA", date: "24/09", fullDate: "24 de Setembro", avatar: "", admissionDate: "01/04/2003" },
  { name: "VALDEMIR GOMES ARNALDO", department: "Embalagem SPEP I", date: "24/09", fullDate: "24 de Setembro", avatar: "", admissionDate: "21/08/2023" },
  { name: "ARTUR GOMES DE LUNA", department: "EMBALAGEM SPEPII", date: "24/09", fullDate: "24 de Setembro", avatar: "", admissionDate: "08/07/2022" },
  { name: "PEDRO LEONARDO CANDIDO DE OLIVEIRA", department: "Controle de Qualidade - Matéria Prima", date: "25/08", fullDate: "25 de Agosto", avatar: "", admissionDate: "01/06/2022" },
  { name: "LUIZ RIBEIRO DA SILVA NETO", department: "Microbiológico", date: "25/08", fullDate: "25 de Agosto", avatar: "", admissionDate: "14/01/2019" },
  { name: "ANDRE DA SILVA DIAMANTINO", department: "Embalagem liquidos", date: "25/08", fullDate: "25 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "MARIA RAILA BARROS DOS SANTOS", department: "Embalagem SPEP I", date: "25/08", fullDate: "25 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "JULIA SILVA SOUZA", department: "Assuntos Regulatorios", date: "25/08", fullDate: "25 de Agosto", avatar: "", admissionDate: "08/04/2019" },
  { name: "SUELY CAVALCANTE SALES", department: "C P H D", date: "25/08", fullDate: "25 de Agosto", avatar: "", admissionDate: "01/08/2016" },
  { name: "ANANDA BETINHA DOS SANTOS TIMOTEO", department: "Embalagem SPEP I", date: "25/08", fullDate: "25 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "LUIZ CILUANDO LOPES SOARES", department: "EMBALAGEM SPEPII", date: "25/08", fullDate: "25 de Agosto", avatar: "", admissionDate: "19/09/2022" },
  { name: "JORGE LUIZ COSTA GOMES", department: "EMBALAGEM SPEP III", date: "25/09", fullDate: "25 de Setembro", avatar: "", admissionDate: "10/01/2023" },
  { name: "OZEIAS DE SOUZA ARAUJO", department: "EMBALAGEM SPEP III", date: "25/09", fullDate: "25 de Setembro", avatar: "", admissionDate: "02/01/2023" },
  { name: "YURI STEFANO BESERRA MOREIRA NUNES", department: "Almoxarifado", date: "25/09", fullDate: "25 de Setembro", avatar: "", admissionDate: "05/05/2025" },
  { name: "MIRIANE DE ANDRADE PEREIRA", department: "Embalagem SPEP I", date: "25/09", fullDate: "25 de Setembro", avatar: "", admissionDate: "08/01/2018" },
  { name: "CELIA GONCALVES", department: "Embalagem SPEP I", date: "25/09", fullDate: "25 de Setembro", avatar: "", admissionDate: "04/10/2010" },
  { name: "ROGERIO BRENO MATOS CIRINO", department: "C P H D", date: "26/08", fullDate: "26 de Agosto", avatar: "", admissionDate: "03/07/2023" },
  { name: "GILMAR CORDEIRO DA SILVA", department: "Embalagem SPEP I", date: "26/08", fullDate: "26 de Agosto", avatar: "", admissionDate: "01/06/2012" },
  { name: "FLAVIA LAENIA DE BRITO", department: "Microbiológico", date: "26/08", fullDate: "26 de Agosto", avatar: "", admissionDate: "08/04/2019" },
  { name: "AGNALDO JOSE DE MATOS", department: "EMBALAGEM SPEP III", date: "26/08", fullDate: "26 de Agosto", avatar: "", admissionDate: "02/12/2002" },
  { name: "MICHELLINE RATS DE SOUZA BARBOSA", department: "SESMT", date: "26/08", fullDate: "26 de Agosto", avatar: "", admissionDate: "04/01/2010" },
  { name: "MATIAS JOSE NASCIMENTO DOS SANTOS", department: "SERVIÇOS GERAIS INTERNO", date: "26/08", fullDate: "26 de Agosto", avatar: "", admissionDate: "20/02/2025" },
  { name: "MIRNA MACEDO MOREIRA", department: "Cred / Cobrança", date: "26/09", fullDate: "26 de Setembro", avatar: "", admissionDate: "18/09/2017" },
  { name: "ANDERSON TEOGENES TAVARES DA SILVA", department: "EMBALAGEM SPEPII", date: "26/09", fullDate: "26 de Setembro", avatar: "", admissionDate: "10/01/2025" },
  { name: "LUCICLEIDE EXPEDITA DE SOUZA", department: "SERVIÇOS GERAIS INTERNO", date: "26/09", fullDate: "26 de Setembro", avatar: "", admissionDate: "20/09/2021" },
  { name: "RICKSON BRENNO DE OLIVEIRA LIMA", department: "Garantia da Qualidade", date: "26/09", fullDate: "26 de Setembro", avatar: "", admissionDate: "01/09/2022" },
  { name: "MARIA GRASIELE DO NASCIMENTO PIRIS", department: "Embalagem SPPV Vidro", date: "26/09", fullDate: "26 de Setembro", avatar: "", admissionDate: "10/01/2025" },
  { name: "JOSE GILVAN DA SILVA", department: "CONSTRUÇÃO I", date: "27/08", fullDate: "27 de Agosto", avatar: "", admissionDate: "05/03/2008" },
  { name: "LETICIA DA SILVA SANTOS", department: "EMBALAGEM SPEP III", date: "27/08", fullDate: "27 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "MARIA DO SOCORRO FIDELES DA SILVA", department: "Embalagem liquidos", date: "27/08", fullDate: "27 de Agosto", avatar: "", admissionDate: "01/03/2001" },
  { name: "IRANEIDE SOUZA DE OLIVEIRA", department: "Microbiológico", date: "27/08", fullDate: "27 de Agosto", avatar: "", admissionDate: "09/02/2023" },
  { name: "FRANCICLEUDO DUARTE DE SOUSA", department: "EMBALAGEM SPEP III", date: "27/09", fullDate: "27 de Setembro", avatar: "", admissionDate: "01/03/2022" },
  { name: "JOAO PAULO PEREIRA DA CRUZ", department: "C P H D", date: "27/09", fullDate: "27 de Setembro", avatar: "", admissionDate: "06/07/2015" },
  { name: "THALYSON LORENZO CAVALCANTE ALVES", department: "Embalagem SPEP I", date: "27/09", fullDate: "27 de Setembro", avatar: "", admissionDate: "10/01/2025" },
  { name: "YANE KAMILLY SANTOS COELHO", department: "Embalagem SPEP I", date: "27/09", fullDate: "27 de Setembro", avatar: "", admissionDate: "10/01/2025" },
  { name: "MACIANO FERREIRA GONÇALVES", department: "Embalagem SPPV Vidro", date: "27/09", fullDate: "27 de Setembro", avatar: "", admissionDate: "07/10/2019" },
  { name: "ALEXANDRE BEZERRA FERNANDES", department: "EMBALAGEM SPEPII", date: "27/09", fullDate: "27 de Setembro", avatar: "", admissionDate: "02/03/2020" },
  { name: "MARIA JOSIANE DA SILVA", department: "EMBALAGEM SPEPII", date: "27/09", fullDate: "27 de Setembro", avatar: "", admissionDate: "25/08/2014" },
  { name: "MAICON DE OLIVEIRA LIMA", department: "Embalagem SPEP I", date: "28/08", fullDate: "28 de Agosto", avatar: "", admissionDate: "06/12/2021" },
  { name: "JOSE EMILSON LOPES DE SOUZA", department: "Microbiológico", date: "28/08", fullDate: "28 de Agosto", avatar: "", admissionDate: "01/07/2009" },
  { name: "MARCELO LOURENCO DE LIMA", department: "Embalagem SPEP I", date: "28/08", fullDate: "28 de Agosto", avatar: "", admissionDate: "02/01/2023" },
  { name: "ERIC CARVALHO DA SILVA VIEIRA", department: "EMBALAGEM SPEPII", date: "28/08", fullDate: "28 de Agosto", avatar: "", admissionDate: "25/08/2014" },
  { name: "MARIA LUCINEIDE SILVA", department: "C P H D", date: "28/08", fullDate: "28 de Agosto", avatar: "", admissionDate: "12/05/2025" },
  { name: "JOSE ROBERTO DE SOUSA MATOS", department: "EMBALAGEM SPEPII", date: "28/08", fullDate: "28 de Agosto", avatar: "", admissionDate: "07/10/2024" },
  { name: "CICERO FERREIRA DOS SANTOS", department: "Embalagem liquidos", date: "28/08", fullDate: "28 de Agosto", avatar: "", admissionDate: "02/01/2012" },
  { name: "GEOCLESIA LUCIANO DE OLIVEIRA", department: "Envase SPEP I", date: "28/08", fullDate: "28 de Agosto", avatar: "", admissionDate: "19/01/2024" },
  { name: "CAIO RENAN DE OLIVEIRA AMARAL", department: "ENVASE SPEP II", date: "28/09", fullDate: "28 de Setembro", avatar: "", admissionDate: "22/08/2023" },
  { name: "GABRIEL ARRAIS ALENCAR", department: " DEM Manutenção", date: "28/09", fullDate: "28 de Setembro", avatar: "", admissionDate: "01/09/2008" },
  { name: "JOSE FABIO FAUSTINO OLIVEIRA", department: "C P H D", date: "28/09", fullDate: "28 de Setembro", avatar: "", admissionDate: "02/08/2021" },
  { name: "NAARA DE LIMA QUEIROZ", department: "Contabilidade", date: "28/09", fullDate: "28 de Setembro", avatar: "", admissionDate: "01/08/2008" },
  { name: "BRUNO VIEIRA SARAIVA LIMA", department: "Transporte Pessoal", date: "28/09", fullDate: "28 de Setembro", avatar: "", admissionDate: "14/07/2025" },
  { name: "ANTONIO FLAVIO FELIX GRANGEIRO", department: "SPEP - MANUTENÇAO E OPERAÇÃO", date: "28/09", fullDate: "28 de Setembro", avatar: "", admissionDate: "01/09/2015" },
  { name: "FRANCISCO FIRMINO LOPES JUNIOR", department: "PREPARAÇÃO SPEP II", date: "28/09", fullDate: "28 de Setembro", avatar: "", admissionDate: "04/10/2007" },
  { name: "JADNAH GRAZIELLY DE SOUZA MORAIS", department: "Embalagem SPEP I", date: "28/09", fullDate: "28 de Setembro", avatar: "", admissionDate: "10/01/2025" },
  { name: "FELIPE PAGEU MARTINS DA SILVA", department: "Controle de Qualidade - Matéria Prima", date: "28/09", fullDate: "28 de Setembro", avatar: "", admissionDate: "02/08/2021" },
  { name: "RAYANE DA SILVA SALES", department: "Controle de Qualidade - Matéria Prima", date: "28/09", fullDate: "28 de Setembro", avatar: "", admissionDate: "08/06/2022" },
  { name: "FRANCISCO RIBEIRO CHAGAS", department: "EMBALAGEM SPEPII", date: "29/08", fullDate: "29 de Agosto", avatar: "", admissionDate: "07/10/2024" },
  { name: "CARLOS GERMANO BEZERRA ALVES", department: "Microbiológico", date: "29/08", fullDate: "29 de Agosto", avatar: "", admissionDate: "07/10/2019" },
  { name: "MARIA DANIELE DA SILVA SOUZA", department: "Compras", date: "29/08", fullDate: "29 de Agosto", avatar: "", admissionDate: "01/04/2014" },
  { name: "RODRIGO LEITE PAIXAO", department: "Microbiológico", date: "29/08", fullDate: "29 de Agosto", avatar: "", admissionDate: "03/07/2023" },
  { name: "CICERO BARBOSA SOBRINHO", department: "CONSTRUÇÃO I", date: "29/09", fullDate: "29 de Setembro", avatar: "", admissionDate: "01/08/2016" },
  { name: "TAMISA MARIA DA SILVA LIMA", department: "Almoxarifado", date: "29/09", fullDate: "29 de Setembro", avatar: "", admissionDate: "22/04/2024" },
  { name: "ITALO MAYKE ALVES DE SOUZA PINHEIRO", department: "Microbiológico", date: "29/09", fullDate: "29 de Setembro", avatar: "", admissionDate: "25/04/2018" },
  { name: "ISAIAS EDEMAR DAHM", department: "Embalagem SPPV Vidro", date: "29/09", fullDate: "29 de Setembro", avatar: "", admissionDate: "06/07/2022" },
  { name: "FRANCISCO NICACIO REINALDO DE LIMA", department: "Embalagem SPEP I", date: "29/09", fullDate: "29 de Setembro", avatar: "", admissionDate: "07/10/2024" },
  { name: "MARIA HELENA FERREIRA CRUZ GOMES", department: "Comercial", date: "29/09", fullDate: "29 de Setembro", avatar: "", admissionDate: "07/02/2011" },
  { name: "LEONARDO SILVA DA PAZ", department: "Embalagem SPEP I", date: "30/08", fullDate: "30 de Agosto", avatar: "", admissionDate: "11/07/2022" },
  { name: "ISABEL CLEIDE DE SOUSA FARIAS", department: "Embalagem SPEP I", date: "30/08", fullDate: "30 de Agosto", avatar: "", admissionDate: "02/07/2007" },
  { name: "FRANCISCO LUIZ DOS SANTOS NETO", department: "EMBALAGEM SPEPII", date: "30/08", fullDate: "30 de Agosto", avatar: "", admissionDate: "04/06/2024" },
  { name: "CICERO ANTONIO PEREIRA", department: "Embalagem SPEP I", date: "30/08", fullDate: "30 de Agosto", avatar: "", admissionDate: "07/10/2019" },
  { name: "LARISMAR ALVES GUIMARÃES", department: "Embalagem liquidos", date: "30/08", fullDate: "30 de Agosto", avatar: "", admissionDate: "01/11/2002" },
  { name: "ANDREIA HENRIQUE NUNES", department: "LOGÍSTICA", date: "30/08", fullDate: "30 de Agosto", avatar: "", admissionDate: "01/04/2021" },
  { name: "RENAN SARAIVA NASCIMENTO", department: "Comercial", date: "30/08", fullDate: "30 de Agosto", avatar: "", admissionDate: "01/12/2014" },
  { name: "LUIZ CARLOS DA SILVA MONTE", department: "Embalagem SPEP I", date: "30/09", fullDate: "30 de Setembro", avatar: "", admissionDate: "03/02/2014" },
  { name: "THIAGO DA SILVA CORREIA", department: "Físico Químico", date: "30/09", fullDate: "30 de Setembro", avatar: "", admissionDate: "04/07/2016" },
  { name: "MARIA LUCELIA DA SILVA", department: "Embalagem SPEP I", date: "30/09", fullDate: "30 de Setembro", avatar: "", admissionDate: "01/08/2008" },
  { name: "EDUARDO CHAGAS LOPES", department: "EMBALAGEM SPEP III", date: "30/09", fullDate: "30 de Setembro", avatar: "", admissionDate: "01/02/2023" },
  { name: "ROBERTO DE SOUZA", department: "Expedição Geral", date: "30/09", fullDate: "30 de Setembro", avatar: "", admissionDate: "01/12/2023" },
  { name: "CICERA BIANCA FERREIRA DE OLIVEIRA", department: "Financeiro", date: "30/09", fullDate: "30 de Setembro", avatar: "", admissionDate: "08/01/2018" },
  { name: "CICERA DAYANE THAIS DE SOUSA", department: "Físico Químico", date: "30/09", fullDate: "30 de Setembro", avatar: "", admissionDate: "09/02/2023" },
  { name: "EDVAN GERALDO DOS SANTOS", department: "Envase SPEP I", date: "30/09", fullDate: "30 de Setembro", avatar: "", admissionDate: "05/07/2022" },
  { name: "JOAQUIM LEITE GONÇALVES CALLOU", department: "Transportes de Cargas - Entrega", date: "30/09", fullDate: "30 de Setembro", avatar: "", admissionDate: "01/03/2008" },
  { name: "GILVAN PINHEIRO MONTE", department: "SPP - BOMBONAS", date: "30/09", fullDate: "30 de Setembro", avatar: "", admissionDate: "01/06/2007" },
  { name: "LUCIANO WLYSSES COSTA DA SILVA", department: "Garantia da Qualidade", date: "30/09", fullDate: "30 de Setembro", avatar: "", admissionDate: "04/04/2022" },
  { name: "MARIA ISABEL DA SILVA FERREIRA", department: "Embalagem liquidos", date: "31/08", fullDate: "31 de Agosto", avatar: "", admissionDate: "10/01/2025" },
  { name: "CICERO LUEDISON SILVA MEDEIROS", department: "EMBALAGEM SPEPII", date: "31/08", fullDate: "31 de Agosto", avatar: "", admissionDate: "20/05/2024" },
  { name: "CICERO ROSALVO ROCHA DA SILVA", department: "Expedição Geral", date: "31/08", fullDate: "31 de Agosto", avatar: "", admissionDate: "09/07/2018" },
  { name: "LARA NAGELA LOPES CAVALCANTE BARROS", department: "PCP", date: "31/08", fullDate: "31 de Agosto", avatar: "", admissionDate: "11/03/2024" },
  { name: "ATHIRSON PEREIRA QUIRINO", department: "C P H D", date: "31/08", fullDate: "31 de Agosto", avatar: "", admissionDate: "10/06/2019" },
  { name: "CAIKE DAVI DE MATOS VIEIRA", department: "Físico Químico", date: "31/08", fullDate: "31 de Agosto", avatar: "", admissionDate: "10/06/2019" },
];

const Aniversariantes = () => {
  const navigate = useNavigate();
  
  // Get current month
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthFormatted = String(currentMonth).padStart(2, '0');
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dayFilter, setDayFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(currentMonthFormatted);

  // Generate day and month options
  const dayOptions = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const monthOptions = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" }
  ];

  // Get unique departments
  const departments = [...new Set(allBirthdayData.map(person => person.department))];

  // Filter data based on search criteria
  const filteredData = useMemo(() => {
    return allBirthdayData.filter(person => {
      const matchesName = person.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesDepartment = !departmentFilter || departmentFilter === "all" || person.department === departmentFilter;
      
      let matchesDate = true;
      if (dayFilter || monthFilter) {
        const [day, month] = person.date.split('/');
        const matchesDay = !dayFilter || dayFilter === "all" || day === dayFilter;
        const matchesMonth = !monthFilter || monthFilter === "all" || month === monthFilter;
        matchesDate = matchesDay && matchesMonth;
      }
      
      return matchesName && matchesDepartment && matchesDate;
    });
  }, [nameFilter, departmentFilter, dayFilter, monthFilter]);

  // Group data by month
  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: BirthdayPerson[] } = {};
    filteredData.forEach(person => {
      const [_, month] = person.date.split('/');
      const monthName = monthOptions.find(opt => opt.value === month)?.label || month;
      if (!groups[monthName]) {
        groups[monthName] = [];
      }
      groups[monthName].push(person);
    });
    
    // Sort groups by month order
    const sortedGroups: { monthName: string; people: BirthdayPerson[] }[] = [];
    monthOptions.forEach(monthOption => {
      if (groups[monthOption.label]) {
        sortedGroups.push({
          monthName: monthOption.label,
          people: groups[monthOption.label].sort((a, b) => {
            const dayA = parseInt(a.date.split('/')[0]);
            const dayB = parseInt(b.date.split('/')[0]);
            return dayA - dayB;
          })
        });
      }
    });
    
    return sortedGroups;
  }, [filteredData, monthOptions]);

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
                <Cake className="h-8 w-8 text-primary mr-3" />
                Aniversariantes
              </h1>
              <p className="text-muted-foreground mt-1">
                Celebre com nossos colaboradores em seus dias especiais
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              {filteredData.length} colaboradores
            </Badge>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="h-5 w-5 text-primary mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Buscar por nome..." 
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Departamento</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os departamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os departamentos</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Dia</label>
                <Select value={dayFilter} onValueChange={setDayFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar dia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os dias</SelectItem>
                    {dayOptions.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Mês</label>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    {monthOptions.map(month => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(nameFilter || (departmentFilter && departmentFilter !== "all") || (dayFilter && dayFilter !== "all") || (monthFilter && monthFilter !== "all")) && (
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setNameFilter("");
                    setDepartmentFilter("all");
                    setDayFilter("all");
                    setMonthFilter(currentMonthFormatted);
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          {groupedByMonth.length === 0 ? (
            <Card className="tile-card">
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Nenhum colaborador encontrado com os filtros aplicados.</p>
              </CardContent>
            </Card>
          ) : (
            groupedByMonth.map((group, groupIndex) => (
              <Card key={groupIndex} className="tile-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Calendar className="h-6 w-6 text-primary mr-3" />
                    {group.monthName}
                    <Badge variant="default" className="ml-auto">
                      {group.people.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {group.people.map((person, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={person.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base truncate">{person.name}</p>
                          <p className="text-sm text-muted-foreground">{person.department}</p>
                          <div className="flex items-center mt-1">
                            <Gift className="h-3 w-3 text-primary mr-1" />
                            <span className="text-xs text-primary font-medium">{person.fullDate}</span>
                            {person.admissionDate && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (Adm: {person.admissionDate})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Aniversariantes;