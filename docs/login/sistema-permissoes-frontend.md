# 💻 Sistema de Permissões - Implementação Frontend

## 📋 Índice

1. [Hook usePermissoes](#hook-usepermissoes)
2. [Componente ProtectedByPermission](#componente-protectedbypermission)
3. [Interface de Gerenciamento](#interface-de-gerenciamento)
4. [Exemplos de Uso](#exemplos-de-uso)

---

## 🎣 Hook `usePermissoes`

Hook customizado para gerenciar permissões no frontend.

### **Arquivo: `src/hooks/usePermissoes.ts`**

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Permissao {
  recurso_nome: string;
  recurso_descricao: string;
  categoria: string;
}

export function usePermissoes() {
  const [permissoes, setPermissoes] = useState<string[]>([]);
  const [permissoesDetalhadas, setPermissoesDetalhadas] = useState<Permissao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarPermissoes();
  }, []);

  async function carregarPermissoes() {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setPermissoes([]);
        setPermissoesDetalhadas([]);
        return;
      }

      // Chama a função PostgreSQL que retorna as permissões
      const { data, error: rpcError } = await supabase.rpc('usuario_permissoes', {
        p_user_id: session.user.id
      });

      if (rpcError) {
        console.error('Erro ao carregar permissões:', rpcError);
        throw rpcError;
      }

      const listaPermissoes = data?.map((p: Permissao) => p.recurso_nome) || [];
      
      setPermissoes(listaPermissoes);
      setPermissoesDetalhadas(data || []);

      console.log('✅ Permissões carregadas:', listaPermissoes);
    } catch (err) {
      console.error('Erro ao carregar permissões:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setPermissoes([]);
      setPermissoesDetalhadas([]);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  const temPermissao = (recurso: string): boolean => {
    return permissoes.includes(recurso);
  };

  /**
   * Verifica se o usuário tem TODAS as permissões especificadas
   */
  const temTodasPermissoes = (recursos: string[]): boolean => {
    return recursos.every(recurso => permissoes.includes(recurso));
  };

  /**
   * Verifica se o usuário tem ALGUMA das permissões especificadas
   */
  const temAlgumaPermissao = (recursos: string[]): boolean => {
    return recursos.some(recurso => permissoes.includes(recurso));
  };

  /**
   * Retorna permissões agrupadas por categoria
   */
  const permissoesPorCategoria = (): Record<string, Permissao[]> => {
    return permissoesDetalhadas.reduce((acc, permissao) => {
      if (!acc[permissao.categoria]) {
        acc[permissao.categoria] = [];
      }
      acc[permissao.categoria].push(permissao);
      return acc;
    }, {} as Record<string, Permissao[]>);
  };

  return {
    permissoes,
    permissoesDetalhadas,
    isLoading,
    error,
    temPermissao,
    temTodasPermissoes,
    temAlgumaPermissao,
    permissoesPorCategoria,
    recarregar: carregarPermissoes
  };
}
```

### **Uso do Hook**

```typescript
import { usePermissoes } from '@/hooks/usePermissoes';

function MeuComponente() {
  const { temPermissao, isLoading } = usePermissoes();

  if (isLoading) {
    return <div>Carregando permissões...</div>;
  }

  return (
    <div>
      {temPermissao('funcionarios.criar') && (
        <button>Novo Funcionário</button>
      )}
    </div>
  );
}
```

---

## 🛡️ Componente `ProtectedByPermission`

Componente para proteger elementos da UI baseado em permissões.

### **Arquivo: `src/components/ProtectedByPermission.tsx`**

```typescript
import { ReactNode } from 'react';
import { usePermissoes } from '@/hooks/usePermissoes';

interface ProtectedByPermissionProps {
  /** Recurso necessário para visualizar o conteúdo */
  recurso?: string;
  
  /** Lista de recursos - usuário precisa ter TODOS */
  recursos?: string[];
  
  /** Lista de recursos - usuário precisa ter ALGUM */
  recursosOr?: string[];
  
  /** Conteúdo a ser exibido se tiver permissão */
  children: ReactNode;
  
  /** Conteúdo alternativo se não tiver permissão */
  fallback?: ReactNode;
  
  /** Mostrar loading enquanto carrega permissões */
  showLoading?: boolean;
}

export function ProtectedByPermission({
  recurso,
  recursos,
  recursosOr,
  children,
  fallback = null,
  showLoading = false
}: ProtectedByPermissionProps) {
  const { temPermissao, temTodasPermissoes, temAlgumaPermissao, isLoading } = usePermissoes();

  if (isLoading && showLoading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  let hasPermission = false;

  if (recurso) {
    hasPermission = temPermissao(recurso);
  } else if (recursos && recursos.length > 0) {
    hasPermission = temTodasPermissoes(recursos);
  } else if (recursosOr && recursosOr.length > 0) {
    hasPermission = temAlgumaPermissao(recursosOr);
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### **Exemplos de Uso**

```typescript
// Exemplo 1: Proteger um botão com uma permissão
<ProtectedByPermission recurso="funcionarios.criar">
  <button>Novo Funcionário</button>
</ProtectedByPermission>

// Exemplo 2: Mostrar mensagem alternativa
<ProtectedByPermission
  recurso="config.permissoes"
  fallback={<p>Você não tem acesso a esta funcionalidade</p>}
>
  <GerenciarPermissoes />
</ProtectedByPermission>

// Exemplo 3: Requer TODAS as permissões
<ProtectedByPermission recursos={['vouchers.visualizar_todos', 'vouchers.aprovar']}>
  <AprovarVouchers />
</ProtectedByPermission>

// Exemplo 4: Requer ALGUMA das permissões
<ProtectedByPermission recursosOr={['funcionarios.visualizar_todos', 'funcionarios.visualizar_proprio']}>
  <ListaFuncionarios />
</ProtectedByPermission>

// Exemplo 5: Com loading
<ProtectedByPermission recurso="beneficios.criar" showLoading>
  <FormularioBeneficio />
</ProtectedByPermission>
```

---

## 🎨 Interface de Gerenciamento de Permissões

Interface administrativa para configurar permissões de forma visual.

### **Arquivo: `src/pages/admin/GerenciarPermissoes.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { usePermissoes } from '@/hooks/usePermissoes';
import { ProtectedByPermission } from '@/components/ProtectedByPermission';

interface Perfil {
  perfil_id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
}

interface Recurso {
  recurso_id: number;
  nome: string;
  descricao: string;
  categoria: string;
  ativo: boolean;
}

export function GerenciarPermissoes() {
  const { temPermissao } = usePermissoes();
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [perfilSelecionado, setPerfilSelecionado] = useState<number | null>(null);
  const [permissoesAtivas, setPermissoesAtivas] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (perfilSelecionado) {
      carregarPermissoesDoPerfil(perfilSelecionado);
    }
  }, [perfilSelecionado]);

  async function carregarDados() {
    setIsLoading(true);
    try {
      await Promise.all([
        carregarPerfis(),
        carregarRecursos()
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function carregarPerfis() {
    const { data, error } = await supabase
      .from('tbperfil')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao carregar perfis:', error);
      return;
    }

    if (data) setPerfis(data);
  }

  async function carregarRecursos() {
    const { data, error } = await supabase
      .from('tbrecurso')
      .select('*')
      .eq('ativo', true)
      .order('categoria, nome');

    if (error) {
      console.error('Erro ao carregar recursos:', error);
      return;
    }

    if (data) setRecursos(data);
  }

  async function carregarPermissoesDoPerfil(perfilId: number) {
    const { data, error } = await supabase
      .from('tbperfil_recurso')
      .select('recurso_id')
      .eq('perfil_id', perfilId);

    if (error) {
      console.error('Erro ao carregar permissões:', error);
      return;
    }

    if (data) {
      setPermissoesAtivas(new Set(data.map(p => p.recurso_id)));
    }
  }

  async function togglePermissao(recursoId: number) {
    if (!perfilSelecionado) return;

    setIsSaving(true);
    try {
      const novasPermissoes = new Set(permissoesAtivas);

      if (novasPermissoes.has(recursoId)) {
        // Remover permissão
        const { error } = await supabase
          .from('tbperfil_recurso')
          .delete()
          .eq('perfil_id', perfilSelecionado)
          .eq('recurso_id', recursoId);

        if (error) throw error;
        novasPermissoes.delete(recursoId);
      } else {
        // Adicionar permissão
        const { error } = await supabase
          .from('tbperfil_recurso')
          .insert({
            perfil_id: perfilSelecionado,
            recurso_id: recursoId
          });

        if (error) throw error;
        novasPermissoes.add(recursoId);
      }

      setPermissoesAtivas(novasPermissoes);
    } catch (error) {
      console.error('Erro ao alterar permissão:', error);
      alert('Erro ao alterar permissão. Verifique o console.');
    } finally {
      setIsSaving(false);
    }
  }

  // Agrupar recursos por categoria
  const recursosPorCategoria = recursos.reduce((acc, recurso) => {
    if (!acc[recurso.categoria]) {
      acc[recurso.categoria] = [];
    }
    acc[recurso.categoria].push(recurso);
    return acc;
  }, {} as Record<string, Recurso[]>);

  // Verificar permissão de acesso
  if (!temPermissao('config.permissoes')) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Acesso Negado</h2>
          <p className="text-red-600">
            Você não tem permissão para gerenciar permissões do sistema.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Permissões</h1>
        <p className="text-gray-600 mt-1">
          Configure as permissões de cada perfil de usuário
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Lista de Perfis */}
        <div className="col-span-12 md:col-span-3">
          <h2 className="text-lg font-semibold mb-4">Perfis</h2>
          <div className="space-y-2">
            {perfis.map(perfil => (
              <button
                key={perfil.perfil_id}
                onClick={() => setPerfilSelecionado(perfil.perfil_id)}
                disabled={isSaving}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  perfilSelecionado === perfil.perfil_id
                    ? 'bg-blue-50 border-blue-500 shadow-sm'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-medium text-gray-900">{perfil.nome}</div>
                <div className="text-sm text-gray-500 mt-1">{perfil.descricao}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Permissões */}
        <div className="col-span-12 md:col-span-9">
          {perfilSelecionado ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Permissões: {perfis.find(p => p.perfil_id === perfilSelecionado)?.nome}
                </h2>
                <div className="text-sm text-gray-500">
                  {permissoesAtivas.size} de {recursos.length} permissões ativas
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(recursosPorCategoria).map(([categoria, recursosCategoria]) => (
                  <div key={categoria} className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {categoria}
                    </h3>
                    <div className="space-y-2">
                      {recursosCategoria.map(recurso => (
                        <label
                          key={recurso.recurso_id}
                          className={`flex items-start p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors ${
                            isSaving ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={permissoesAtivas.has(recurso.recurso_id)}
                            onChange={() => togglePermissao(recurso.recurso_id)}
                            disabled={isSaving}
                            className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {recurso.nome}
                            </div>
                            <div className="text-sm text-gray-500 mt-0.5">
                              {recurso.descricao}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-lg font-medium">Selecione um perfil</p>
              <p className="text-sm mt-1">Escolha um perfil à esquerda para gerenciar suas permissões</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---


