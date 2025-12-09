// src/app/admin/dashboard/page.tsx

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Painel administrativo
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Visão geral do Pilates Diário
        </h1>
        <p className="text-sm text-slate-500">
          Aqui você vai gerenciar os exercícios de pilates, acompanhar assinantes
          e preparar o app para crescer com segurança.
        </p>
      </header>

      {/* Cards resumão */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Usuárias
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">—</p>
          <p className="text-xs text-slate-500 mt-1">
            Total de usuárias com perfil criado no app.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Assinaturas ativas
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">—</p>
          <p className="text-xs text-slate-500 mt-1">
            Vem da integração com a Cakto (status active).
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Exercícios de pilates
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">—</p>
          <p className="text-xs text-slate-500 mt-1">
            Quantidade de vídeos cadastrados na tabela <code>exercicios</code>.
          </p>
        </div>
      </section>

      {/* Próximos passos / checklist */}
      <section className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">
          Próximos passos para o MVP
        </h2>
        <ul className="space-y-1.5 text-sm text-slate-600">
          <li>• Conectar painel com o Bunny (usar BUNNY_API_KEY e LIBRARY_ID).</li>
          <li>• Criar tela de &quot;Exercícios&quot; para subir vídeos e salvar na tabela.</li>
          <li>• Mostrar contadores reais de usuárias e assinaturas.</li>
          <li>• Adicionar filtros por plano, data de assinatura, etc.</li>
        </ul>
        <p className="mt-3 text-[11px] text-slate-400">
          Essa tela é só um rascunho visual. Aos poucos vamos plugar os números
          reais do Supabase e as ações do Bunny.
        </p>
      </section>
    </div>
  );
}
