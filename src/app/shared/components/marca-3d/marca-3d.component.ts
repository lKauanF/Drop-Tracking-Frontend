import { Component, AfterViewInit, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-marca-3d',
  standalone: true,
  templateUrl: './marca-3d.component.html',
  styleUrls: ['./marca-3d.component.scss'],
})
export class Marca3dComponent implements AfterViewInit, OnDestroy {
  /** Caminho para o modelo da gota (animada) */
  @Input() gotaPath: string = '/assets/3dModel/LogoGota.glb';
  /** Caminho para o modelo do arco (fixo) */
  @Input() arcoPath: string = '/assets/3dModel/LogoArco.glb';

  /** Ângulo inicial da gota (graus) */
  @Input() gotaAnguloInicial: number = 0;
  /** Ângulo inicial do arco (graus) */
  @Input() arcoAnguloInicial: number = 90;

  /** Velocidade de rotação da gota (radianos por frame aproximado) */
  @Input() gotaVelocidade: number = 0.01;

  /** Escala aplicada aos dois modelos */
  @Input() escala: number = 1.5;

  /** Offsets opcionais para ajuste fino (unidades da cena) */
  @Input() gotaOffset: { x?: number; y?: number; z?: number } = {};
  @Input() arcoOffset: { x?: number; y?: number; z?: number } = {};

  @ViewChild('marcaCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Three.js
  private cena?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private luzAmbiente?: THREE.AmbientLight;
  private luzDirecional?: THREE.DirectionalLight;

  // Modelos
  private gotaModel?: THREE.Group;
  private arcoModel?: THREE.Group;

  // Loop
  private animId?: number;

  // Resize
  private resizeObs?: ResizeObserver;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    // Cena + câmera + renderer
    this.cena = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.z = 3;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);

    // Ajuste inicial de tamanho do canvas via ResizeObserver
    this.resizeObs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        this.renderer!.setSize(cr.width, cr.height, false);
        if (this.camera) {
          this.camera.aspect = cr.width / cr.height || 1;
          this.camera.updateProjectionMatrix();
        }
        this.renderOnce();
      }
    });
    this.resizeObs.observe(canvas);

    // Luzes
    this.luzAmbiente = new THREE.AmbientLight(0xffffff, 0.8);
    this.luzDirecional = new THREE.DirectionalLight(0xffffff, 1.2);
    this.luzDirecional.position.set(3, 3, 5);
    this.cena.add(this.luzAmbiente, this.luzDirecional);

    // Carrega os dois modelos e inicia o loop
    this.carregarModelos().then(() => {
      this.iniciarAnimacao();
    }).catch(err => {
      console.error('Erro ao carregar modelos 3D:', err);
    });
  }

  ngOnDestroy(): void {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.resizeObs?.disconnect();
    this.renderer?.dispose();
  }

  /** Carrega gota e arco na mesma cena */
  private async carregarModelos(): Promise<void> {
    const loader = new GLTFLoader();

    const carregar = (caminho: string) =>
      new Promise<THREE.Group>((resolve, reject) => {
        loader.load(
          caminho,
          (gltf: GLTF) => resolve(gltf.scene),
          undefined,
          (erro) => reject(erro)
        );
      });

    const [gota, arco] = await Promise.all([
      carregar(this.gotaPath),
      carregar(this.arcoPath),
    ]);

    // Gota
    gota.scale.set(this.escala, this.escala, this.escala);
    gota.rotation.set(0, THREE.MathUtils.degToRad(this.gotaAnguloInicial), 0);
    gota.position.set(this.gotaOffset.x ?? 0, this.gotaOffset.y ?? 0, this.gotaOffset.z ?? 0);
    this.cena!.add(gota);
    this.gotaModel = gota;

    // Arco
    arco.scale.set(this.escala, this.escala, this.escala);
    arco.rotation.set(0, THREE.MathUtils.degToRad(this.arcoAnguloInicial), 0);
    arco.position.set(this.arcoOffset.x ?? 0, this.arcoOffset.y ?? 0, this.arcoOffset.z ?? 0);
    this.cena!.add(arco);
    this.arcoModel = arco;

    // Render inicial
    this.renderOnce();
  }

  /** Um frame de render */
  private renderOnce() {
    if (this.renderer && this.camera && this.cena) {
      this.renderer.render(this.cena, this.camera);
    }
  }

  /** Loop de animação: só a gota gira */
  private iniciarAnimacao() {
    const tick = () => {
      if (this.gotaModel) {
        this.gotaModel.rotation.y += this.gotaVelocidade;
      }
      this.renderOnce();
      this.animId = requestAnimationFrame(tick);
    };
    this.animId = requestAnimationFrame(tick);
  }

  /** Ajusta a rotação do arco dinamicamente (graus) */
  definirRotacaoArco(graus: number) {
    if (!this.arcoModel) return;
    this.arcoModel.rotation.y = THREE.MathUtils.degToRad(graus);
    this.renderOnce();
  }

  /** Ajusta a rotação da gota dinamicamente (graus) */
  definirRotacaoGota(graus: number) {
    if (!this.gotaModel) return;
    this.gotaModel.rotation.y = THREE.MathUtils.degToRad(graus);
    this.renderOnce();
  }
}
