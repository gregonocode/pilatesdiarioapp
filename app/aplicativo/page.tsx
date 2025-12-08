export default function AplicativoHomePage() {
  return (
    <div className="space-y-4">
      <div className="mt-2">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#A1A1AA] uppercase">
          Pilates Diário
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">
          Seu exercício de hoje 💚
        </h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Em breve aqui aparece o vídeo do dia, o botão de iniciar e a opção de
          concluir o treino.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#111111] px-4 py-5">
        <p className="text-sm text-[#E5E7EB]">
          Essa é a tela inicial do aplicativo. Depois vamos colocar:
        </p>
        <ul className="mt-2 text-xs text-[#9CA3AF] list-disc list-inside space-y-1">
          <li>Player de vídeo do exercício do dia</li>
          <li>Botão para marcar exercício como concluído</li>
          <li>Resumo dos seus pontos e streak de dias</li>
        </ul>
      </div>
    </div>
  );
}
