import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XRScene } from './scene';
import { executarSondaCapacidades, exibirRelatorioNaTela } from './sonda';

const container = document.getElementById('app') as HTMLDivElement;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

const xrScene = new XRScene();

const orbit = new OrbitControls(xrScene.camera, renderer.domElement);
orbit.target.set(0, 1.10, -0.60);
orbit.update();

executarSondaCapacidades().then((relatorio) => {
  exibirRelatorioNaTela(relatorio);
});

// PASSO 9: HUD DE CUSTO
const hudCusto = document.createElement('div');
hudCusto.style.position = 'fixed';
hudCusto.style.top = '10px';
hudCusto.style.right = '10px';
hudCusto.style.padding = '10px 14px';
hudCusto.style.background = 'rgba(15, 15, 25, 0.9)';
hudCusto.style.color = '#ffcc00';
hudCusto.style.fontFamily = 'monospace';
hudCusto.style.fontSize = '12px';
hudCusto.style.borderRadius = '4px';
hudCusto.style.zIndex = '9999';
hudCusto.style.pointerEvents = 'none';
document.body.appendChild(hudCusto);

// BOTAO DE ATALHO VISIVEL NA TELA PARA TESTE FACIL DO PASSO 8
const btnTrocarPai = document.createElement('button');
btnTrocarPai.innerText = 'Trocar Pai do Disjuntor (Passo 8)';
btnTrocarPai.style.position = 'fixed';
btnTrocarPai.style.bottom = '10px';
btnTrocarPai.style.right = '10px';
btnTrocarPai.style.padding = '10px 16px';
btnTrocarPai.style.background = '#00ffcc';
btnTrocarPai.style.color = '#000';
btnTrocarPai.style.fontWeight = 'bold';
btnTrocarPai.style.border = 'none';
btnTrocarPai.style.borderRadius = '4px';
btnTrocarPai.style.cursor = 'pointer';
btnTrocarPai.style.zIndex = '9999';
document.body.appendChild(btnTrocarPai);

const ORCAMENTO_TETO_MS = 16.66;
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const tInicio = performance.now();
  const delta = clock.getDelta();

  xrScene.update(delta);
  renderer.render(xrScene.scene, xrScene.camera);

  const tFim = performance.now();
  const duracaoMs = tFim - tInicio;

  hudCusto.innerHTML = `
    <strong>[Orçamento de Custo - Passo 9]</strong><br/>
    Tempo por Quadro: <b>${duracaoMs.toFixed(2)} ms</b><br/>
    Teto Declarado: <b>${ORCAMENTO_TETO_MS} ms</b> (60 FPS)<br/>
    Status: <span style="color: ${duracaoMs <= ORCAMENTO_TETO_MS ? '#00ffcc' : '#ff4444'}">
      ${duracaoMs <= ORCAMENTO_TETO_MS ? 'DENTRO DO TETO' : 'ESTOURADO'}
    </span>
  `;
});

// LOGICA DE REPARENTAMENTO E CONSOLE DO PASSO 8
const dispararTrocaDePai = () => {
  const { posAntes, posDepois } = xrScene.trocarPaiDoDisjuntor();
  const diff = posAntes.distanceTo(posDepois);

  console.log("%c==================================================", "color: #ffcc00");
  console.log("%c=== PASSO 8: DEMONSTRAÇÃO DE REPARENTAMENTO ===", "color: #00ffcc; font-weight: bold;");
  console.log("Posição Global ANTES:", posAntes.x.toFixed(4), posAntes.y.toFixed(4), posAntes.z.toFixed(4));
  console.log("Posição Global DEPOIS:", posDepois.x.toFixed(4), posDepois.y.toFixed(4), posDepois.z.toFixed(4));
  console.log(`Diferença no Mundo           : ${diff.toFixed(6)} metros`);
  console.log("%c==================================================", "color: #ffcc00");
};

// Evento no botão na tela
btnTrocarPai.addEventListener('click', dispararTrocaDePai);

// Evento na tecla Espaço
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    dispararTrocaDePai();
  }
});

// AVISO INICIAL NO CONSOLE AO CARREGAR
console.log("%c[PROJETO XR] Aplicação carregada! Clique no botão ou aperte ESPAÇO para testar o Passo 8.", "color: #00ffcc; font-weight: bold;");