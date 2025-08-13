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
  { name: "Carlos Santos", department: "TI", date: "15/08", fullDate: "15 de Agosto", avatar: "", admissionDate: "15/03/2020" },
  { name: "Maria João", department: "Marketing", date: "22/08", fullDate: "22 de Agosto", avatar: "", admissionDate: "10/01/2019" },
  { name: "Pedro Costa", department: "Vendas", date: "28/08", fullDate: "28 de Agosto", avatar: "", admissionDate: "05/07/2021" },
  { name: "Ana Silva", department: "RH", date: "05/09", fullDate: "05 de Setembro", avatar: "", admissionDate: "22/11/2018" },
  { name: "João Pereira", department: "Financeiro", date: "12/09", fullDate: "12 de Setembro", avatar: "", admissionDate: "08/04/2017" },
  { name: "Sandra Oliveira", department: "Operações", date: "18/09", fullDate: "18 de Setembro", avatar: "", admissionDate: "14/09/2022" },
  { name: "Ricardo Ferreira", department: "TI", date: "25/09", fullDate: "25 de Setembro", avatar: "", admissionDate: "30/06/2020" },
  { name: "Patrícia Lima", department: "Marketing", date: "02/10", fullDate: "02 de Outubro", avatar: "", admissionDate: "12/02/2023" },
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