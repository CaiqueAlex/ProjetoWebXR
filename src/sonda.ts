export interface RelatorioSonda {
  vrSuportado: boolean | 'negado';
  arSuportado: boolean | 'negado';
  recursosOpcionais: string[];
  mensagem: string;
}

export async function executarSondaCapacidades(): Promise<RelatorioSonda> {
  const relatorio: RelatorioSonda = {
    vrSuportado: false,
    arSuportado: false,
    recursosOpcionais: ['hit-test', 'local-floor', 'dom-overlay'],
    mensagem: ''
  };

  if (!navigator.xr) {
    relatorio.mensagem = "API WebXR ausente (recurso ausente neste navegador/dispositivo).";
    return relatorio;
  }

  try {
    relatorio.vrSuportado = await navigator.xr.isSessionSupported('immersive-vr');
  } catch {
    relatorio.vrSuportado = 'negado';
  }

  try {
    relatorio.arSuportado = await navigator.xr.isSessionSupported('immersive-ar');
  } catch {
    relatorio.arSuportado = 'negado';
  }

  return relatorio;
}

export function exibirRelatorioNaTela(relatorio: RelatorioSonda): void {
  const div = document.createElement('div');
  div.id = 'xr-sonda-report';
  div.style.position = 'fixed';
  div.style.bottom = '10px';
  div.style.left = '10px';
  div.style.padding = '10px 14px';
  div.style.background = 'rgba(0,0,0,0.9)';
  div.style.color = '#00ffcc';
  div.style.fontFamily = 'monospace';
  div.style.fontSize = '12px';
  div.style.borderRadius = '4px';
  div.style.zIndex = '9999';
  div.style.pointerEvents = 'none';

  div.innerHTML = `
    <strong>[Sonda de Capacidades - Passo 5/6]</strong><br/>
    Immersive VR: <b>${relatorio.vrSuportado}</b><br/>
    Immersive AR: <b>${relatorio.arSuportado}</b><br/>
    Opcionais: ${relatorio.recursosOpcionais.join(', ')}<br/>
    ${relatorio.mensagem ? `<span style="color:#ff4444">${relatorio.mensagem}</span>` : ''}
  `;

  document.body.appendChild(div);
}

// .