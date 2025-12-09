/**
 * Hook para buscar aniversariantes do mês da tabela tbfuncionario
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { BirthdayPerson } from '@/types/aniversariante';

interface UseBirthdayDataReturn {
  aniversariantes: BirthdayPerson[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Interface para dados brutos do Supabase
interface FuncionarioAniversariante {
  funcionario_id: number;
  matricula: string | null;
  nome: string | null;
  dtnascimento: string | Date | null;
  lotacao: string | null;
  admissao_data: string | null;
}

/**
 * Extrai ano, mês e dia de uma data (string ou Date object)
 * Retorna null se não conseguir extrair
 */
function extrairDataSegura(valor: string | Date | null): { ano: number; mes: number; dia: number } | null {
  if (!valor) return null;

  try {
    // Se for Date object, converter para ISO string
    const dataStr = valor instanceof Date
      ? valor.toISOString()
      : String(valor);

    // Extrair apenas "YYYY-MM-DD" (primeiros 10 caracteres)
    const parteData = dataStr.substring(0, 10);
    const partes = parteData.split('-');

    if (partes.length !== 3) return null;

    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const dia = parseInt(partes[2], 10);

    // Validar se são números válidos
    if (isNaN(ano) || isNaN(mes) || isNaN(dia)) return null;
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;

    return { ano, mes, dia };
  } catch {
    return null;
  }
}

/**
 * Hook para buscar aniversariantes do mês atual
 * Filtra funcionários ativos com aniversário no mês corrente
 */
export function useBirthdayData(): UseBirthdayDataReturn {
  const [aniversariantes, setAniversariantes] = useState<BirthdayPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAniversariantes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1; // JavaScript meses são 0-indexed
      const diaAtual = hoje.getDate();

      // Buscar funcionários sem rescisão usando paginação para contornar limite de 1000
      const todosFuncionarios: FuncionarioAniversariante[] = [];
      const tamanhoPagina = 1000;
      let pagina = 0;
      let temMais = true;

      while (temMais) {
        const inicio = pagina * tamanhoPagina;
        const fim = inicio + tamanhoPagina - 1;

        const { data, error: supabaseError } = await supabase
          .from('tbfuncionario')
          .select('funcionario_id, matricula, nome, dtnascimento, lotacao, admissao_data')
          .is('dt_rescisao', null)
          .not('dtnascimento', 'is', null)
          .range(inicio, fim);

        if (supabaseError) {
          console.error('❌ Erro ao buscar aniversariantes:', supabaseError);
          setError('Erro ao carregar aniversariantes');
          setAniversariantes([]);
          return;
        }

        if (data && data.length > 0) {
          todosFuncionarios.push(...(data as FuncionarioAniversariante[]));
          temMais = data.length === tamanhoPagina; // Continua se retornou página cheia
          pagina++;
        } else {
          temMais = false;
        }
      }

      if (todosFuncionarios.length === 0) {
        setAniversariantes([]);
        return;
      }

      // Filtrar por mês atual e dia >= dia atual, então mapear para o formato BirthdayPerson
      const aniversariantesDoMes = todosFuncionarios
        .filter(funcionario => {
          const dataExtraida = extrairDataSegura(funcionario.dtnascimento);
          if (!dataExtraida) return false;

          const { mes: mesNascimento, dia: diaNascimento } = dataExtraida;

          // Filtrar: mesmo mês E dia >= dia atual (aniversários que ainda vão acontecer ou são hoje)
          return mesNascimento === mesAtual && diaNascimento >= diaAtual;
        })
        .map(funcionario => {
          const dataExtraida = extrairDataSegura(funcionario.dtnascimento)!;
          const dia = String(dataExtraida.dia).padStart(2, '0');
          const mes = String(dataExtraida.mes).padStart(2, '0');

          // Usar nome diretamente conforme requisito
          const nomeExibicao = funcionario.nome || 'Nome não informado';

          // Converter dtnascimento para string se for Date object
          const birthDateStr = funcionario.dtnascimento instanceof Date
            ? funcionario.dtnascimento.toISOString().substring(0, 10)
            : String(funcionario.dtnascimento || '');

          return {
            name: nomeExibicao,
            department: funcionario.lotacao || 'Setor não informado',
            date: `${dia}/${mes}`,
            avatar: '',
            admissionDate: funcionario.admissao_data || '',
            birthDate: birthDateStr,
            matricula: funcionario.matricula || undefined,
          } as BirthdayPerson;
        })
        // Ordenar por dia do aniversário, depois por nome
        .sort((a, b) => {
          const diaA = parseInt(a.date.split('/')[0], 10);
          const diaB = parseInt(b.date.split('/')[0], 10);

          // Primeiro ordena por dia
          if (diaA !== diaB) {
            return diaA - diaB;
          }

          // Se mesmo dia, ordena por nome
          return a.name.localeCompare(b.name, 'pt-BR');
        });

      setAniversariantes(aniversariantesDoMes);
    } catch (err) {
      console.error('❌ Erro inesperado ao buscar aniversariantes:', err);
      setError('Erro inesperado ao carregar aniversariantes');
      setAniversariantes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAniversariantes();
  }, []);

  return {
    aniversariantes,
    isLoading,
    error,
    refetch: fetchAniversariantes,
  };
}

