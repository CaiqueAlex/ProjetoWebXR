import * as THREE from 'three';

export class XRScene {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;

  // Nós da Hierarquia (Passo 7)
  readonly bancada: THREE.Mesh;
  readonly painelSuporte: THREE.Group;
  readonly trilhoDIN: THREE.Mesh;
  readonly disjuntor: THREE.Mesh;
  readonly suporteAlternativo: THREE.Group;

  constructor() {
    this.scene.background = new THREE.Color(0x101015);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );
    // Câmera posicionada a 1.50m (Escala Real VR / Altura dos olhos)
    this.camera.position.set(0, 1.5, 1.2);

    this.addLights();

    // 1. BANCADA DE APOIO (0.60m profundidade, 0.80m altura, 1.20m largura)
    const geoBancada = new THREE.BoxGeometry(1.20, 0.80, 0.60);
    const matBancada = new THREE.MeshBasicMaterial({ color: 0x2a2a35, wireframe: false });
    this.bancada = new THREE.Mesh(geoBancada, matBancada);
    this.bancada.position.set(0, 0.40, -0.50);
    this.scene.add(this.bancada);

    // 2. PAINEL SUPORTE DO QUADRO (Escala exata da Seção 4: 0.60m x 0.40m x 0.05m)
    this.painelSuporte = new THREE.Group();
    this.painelSuporte.position.set(0, 1.10, -0.60);
    this.scene.add(this.painelSuporte);

    const geoPainel = new THREE.BoxGeometry(0.60, 0.40, 0.05);
    const matPainel = new THREE.MeshBasicMaterial({ color: 0x4a4d52 });
    const painelMesh = new THREE.Mesh(geoPainel, matPainel);
    this.painelSuporte.add(painelMesh);

    // 3. TRILHO METÁLICO DIN (0.50m x 0.035m x 0.01m) - FILHO DO PAINEL
    // Razão de Domínio: O trilho é parafusado no painel; mover o painel move o trilho.
    const geoTrilho = new THREE.BoxGeometry(0.50, 0.035, 0.01);
    const matTrilho = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    this.trilhoDIN = new THREE.Mesh(geoTrilho, matTrilho);
    this.trilhoDIN.position.set(0, 0, 0.03); 
    this.painelSuporte.add(this.trilhoDIN); 

    // 4. DISJUNTOR MONOFÁSICO (0.018m x 0.085m x 0.065m) - FILHO DO TRILHO
    // Razão de Domínio: O disjuntor encaixa no trilho (1 DoF no eixo X local).
    const geoDisjuntor = new THREE.BoxGeometry(0.018, 0.085, 0.065);
    const matDisjuntor = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Geometria Crua Vermelha
    this.disjuntor = new THREE.Mesh(geoDisjuntor, matDisjuntor);
    this.disjuntor.position.set(-0.15, 0, 0.035); 
    this.trilhoDIN.add(this.disjuntor); 

    // 5. SUPORTE ALTERNATIVO (Simula o topo da bancada para testar Reparentamento)
    this.suporteAlternativo = new THREE.Group();
    this.suporteAlternativo.position.set(0.30, 0.82, -0.40);
    this.scene.add(this.suporteAlternativo);

    const geoApoio = new THREE.BoxGeometry(0.15, 0.02, 0.15);
    const matApoio = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    this.suporteAlternativo.add(new THREE.Mesh(geoApoio, matApoio));
  }

  private addLights(): void {
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(1, 3, 2);
    this.scene.add(dir);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  }

  /**
   * PASSO 8: Troca de Pai sem recalcular à mão.
   * Preserva rigorosamente a posição no mundo usando o método .attach()
   */
  trocarPaiDoDisjuntor(): { posAntes: THREE.Vector3; posDepois: THREE.Vector3 } {
  const posAntes = new THREE.Vector3();
  const posDepois = new THREE.Vector3();

  // Pega a posição global no mundo ANTES de trocar de pai
  this.disjuntor.getWorldPosition(posAntes);

  if (this.disjuntor.parent === this.trilhoDIN) {
    // Troca o pai para o Suporte Alternativo na bancada
    this.suporteAlternativo.attach(this.disjuntor);
  } else {
    // Volta a ser filho do Trilho DIN
    this.trilhoDIN.attach(this.disjuntor);
  }

  // Pega a posição global no mundo DEPOIS de trocar de pai
  this.disjuntor.getWorldPosition(posDepois);

  return { posAntes, posDepois };
  }

  update(delta: number): void {
    // Prova do Passo 7: Ao rotacionar o Painel (Pai), o Trilho e o Disjuntor acompanham
    // sem precisarmos de recalcular manualmente nenhuma coordenada!
    this.painelSuporte.rotation.y = Math.sin(performance.now() / 1500) * 0.1;

    // Deslocamento de 1 Grau de Liberdade (1 DoF) ao longo do eixo X local do trilho
    if (this.disjuntor.parent === this.trilhoDIN) {
      this.disjuntor.position.x = Math.sin(performance.now() / 1000) * 0.18;
    }
  }
}