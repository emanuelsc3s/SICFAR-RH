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
  nome_social: string | null;
  dtnascimento: string | null;
  lotacao: string | null;
  admissao_data: string | null;
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

      // Buscar funcionários ativos (sem rescisão) com aniversário no mês atual
      const { data, error: supabaseError } = await supabase
        .from('tbfuncionario')
        .select('funcionario_id, matricula, nome, nome_social, dtnascimento, lotacao, admissao_data')
        .eq('ativo', true)
        .is('dt_rescisao', null)
        .not('dtnascimento', 'is', null);

      if (supabaseError) {
        console.error('❌ Erro ao buscar aniversariantes:', supabaseError);
        setError('Erro ao carregar aniversariantes');
        setAniversariantes([]);
        return;
      }

      if (!data || data.length === 0) {
        setAniversariantes([]);
        return;
      }

      // Filtrar pelo mês atual e dia >= dia atual, então mapear para o formato BirthdayPerson
      const aniversariantesDoMes = (data as FuncionarioAniversariante[])
        .filter(funcionario => {
          if (!funcionario.dtnascimento) return false;
          const dataNascimento = new Date(funcionario.dtnascimento);
          const mesNascimento = dataNascimento.getMonth() + 1;
          const diaNascimento = dataNascimento.getDate();
          // Filtrar: mesmo mês E dia >= dia atual (aniversários que ainda vão acontecer ou são hoje)
          return mesNascimento === mesAtual && diaNascimento >= diaAtual;
        })
        .map(funcionario => {
          const dataNascimento = new Date(funcionario.dtnascimento!);
          const dia = String(dataNascimento.getDate()).padStart(2, '0');
          const mes = String(dataNascimento.getMonth() + 1).padStart(2, '0');

          // Priorizar nome_social, se existir
          const nomeExibicao = funcionario.nome_social || funcionario.nome || 'Nome não informado';

          return {
            name: nomeExibicao,
            department: funcionario.lotacao || 'Setor não informado',
            date: `${dia}/${mes}`,
            avatar: '',
            admissionDate: funcionario.admissao_data || '',
            birthDate: funcionario.dtnascimento || '',
            matricula: funcionario.matricula || undefined,
          } as BirthdayPerson;
        })
        // Ordenar por dia do aniversário
        .sort((a, b) => {
          const diaA = parseInt(a.date.split('/')[0], 10);
          const diaB = parseInt(b.date.split('/')[0], 10);
          return diaA - diaB;
        });

      setAniversariantes(aniversariantesDoMes);
      console.log(`✅ ${aniversariantesDoMes.length} aniversariante(s) encontrado(s) no mês`);
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

