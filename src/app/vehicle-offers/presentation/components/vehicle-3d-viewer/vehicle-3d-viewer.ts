import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import * as THREE from 'three';
import {Vehicle3dModel} from '../../../domain/model/vehicle-3d-model';
import {MODEL_PRESET_LABEL} from '../../../domain/model/vehicle-3d-palette';
import {buildVehicle, disposeVehicle, LIGHT_TAG} from './vehicle-3d-models';

/** Internal render scale (<1 = chunkier, more PS1). Combined with no antialias. */
const RES_SCALE = 0.8;
/** Radians per frame the model spins when motion is allowed. */
const SPIN_SPEED = 0.006;
/** Duration (seconds) of the light "turn-on" ramp and the preset-change bounce. */
const LIGHTS_RAMP = 0.5;

/** True when the browser can create a WebGL context. */
function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * A self-contained WebGL viewer that shows a slowly rotating low-poly (PS1-style)
 * vehicle for the given {@link Vehicle3dModel}. The render loop runs outside Angular
 * (zoneless-friendly) and is torn down via {@link DestroyRef}. The canvas is
 * transparent so the host's teal gradient acts as the backdrop, with a retro grid
 * floor and a faint mirrored reflection. Honors `prefers-reduced-motion`, and falls
 * back to a static badge when WebGL is unavailable.
 */
@Component({
  selector: 'app-vehicle-3d-viewer',
  template: `
    @if (supported()) {
      <canvas #canvas class="viewer" [attr.aria-label]="ariaLabel()"></canvas>
    } @else {
      <div class="viewer-fallback" role="img" [attr.aria-label]="ariaLabel()">
        <span class="viewer-fallback__icon" aria-hidden="true">🚗</span>
        <span class="viewer-fallback__label">{{ presetLabel() }}</span>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .viewer {
      display: block;
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
    }
    .viewer-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      height: 100%;
      color: oklch(0.985 0.005 200 / 0.85);
    }
    .viewer-fallback__icon {
      font-size: 2.5rem;
    }
    .viewer-fallback__label {
      font-size: 0.8125rem;
    }
  `,
})
export class Vehicle3dViewer {
  readonly model = input.required<Vehicle3dModel>();

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);

  protected readonly supported = signal(webglAvailable());
  private readonly ready = signal(false);
  private readonly reducedMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected readonly presetLabel = computed(() => MODEL_PRESET_LABEL[this.model().preset]);
  protected readonly ariaLabel = computed(
    () => `Modelo 3D del vehículo: ${this.presetLabel()}${this.reducedMotion ? '' : ', rotando'}.`,
  );

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private stage?: THREE.Group;
  private car?: THREE.Group;
  private reflection?: THREE.Group;
  private grid?: THREE.GridHelper;
  private lightMaterials: THREE.MeshStandardMaterial[] = [];
  private carBaseY = 0;
  private frameId = 0;
  private clock = new THREE.Clock();
  private rebuildElapsed = LIGHTS_RAMP;
  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => {
      if (!this.supported()) {
        return;
      }
      this.initScene();
      this.observeResize();
      this.startLoop();
      this.ready.set(true);
    });

    // Rebuild the car whenever the model changes (once the scene exists).
    effect(() => {
      const model = this.model();
      if (!this.ready()) {
        return;
      }
      this.rebuildCar(model);
    });

    this.destroyRef.onDestroy(() => this.dispose());
  }

  private initScene(): void {
    const canvas = this.canvas()!.nativeElement;
    this.scene = new THREE.Scene();
    this.stage = new THREE.Group();
    this.scene.add(this.stage);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.set(5.4, 3.1, 6.6);
    this.camera.lookAt(0, 0.1, 0);

    this.renderer = new THREE.WebGLRenderer({canvas, antialias: false, alpha: true});
    this.renderer.setPixelRatio(RES_SCALE);
    this.renderer.setClearColor(0x000000, 0);

    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(5, 8, 6);
    const rim = new THREE.DirectionalLight(0x38d6d6, 0.55); // teal accent rim
    rim.position.set(-6, 3, -5);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x24303a, 0.85);
    this.scene.add(key, rim, hemi);
  }

  private rebuildCar(model: Vehicle3dModel): void {
    if (!this.scene || !this.stage) {
      return;
    }
    if (this.car) {
      this.stage.remove(this.car);
      disposeVehicle(this.car);
    }
    if (this.reflection) {
      this.stage.remove(this.reflection);
      disposeVehicle(this.reflection);
    }
    if (this.grid) {
      this.scene.remove(this.grid);
      this.grid.geometry.dispose();
      (this.grid.material as THREE.Material).dispose();
    }

    this.car = buildVehicle(model);
    this.stage.add(this.car);
    this.carBaseY = this.car.position.y;

    // Collect emissive light materials for the "turn on" ramp.
    this.lightMaterials = [];
    this.car.traverse(child => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const m of mats) {
          if ((m as THREE.Material).userData[LIGHT_TAG]) {
            this.lightMaterials.push(m as THREE.MeshStandardMaterial);
          }
        }
      }
    });

    const floorY = new THREE.Box3().setFromObject(this.car).min.y;

    // Retro grid floor.
    this.grid = new THREE.GridHelper(22, 22, 0x38d6d6, 0x2a6d75);
    const gridMat = this.grid.material as THREE.LineBasicMaterial;
    gridMat.transparent = true;
    gridMat.opacity = 0.32;
    this.grid.position.y = floorY;
    this.scene.add(this.grid);

    // Faint mirrored reflection (fresh build, mirrored about the floor plane).
    this.reflection = buildVehicle(model);
    this.reflection.scale.y = -1;
    this.reflection.position.y = 2 * floorY - this.carBaseY;
    this.reflection.traverse(child => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const m of mats) {
          m.transparent = true;
          m.opacity = 0.16;
          m.depthWrite = false;
          m.side = THREE.DoubleSide;
        }
      }
    });
    this.stage.add(this.reflection);

    this.rebuildElapsed = 0; // restart lights ramp + bounce
  }

  private observeResize(): void {
    const canvas = this.canvas()!.nativeElement;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  private resize(): void {
    const canvas = this.canvas()?.nativeElement;
    if (!canvas) {
      return;
    }
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    this.renderer?.setSize(width, height, false);
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  private startLoop(): void {
    const render = () => {
      this.frameId = requestAnimationFrame(render);
      const dt = this.clock.getDelta();
      this.rebuildElapsed += dt;
      this.animate();
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    render();
  }

  private animate(): void {
    const t = Math.min(this.rebuildElapsed, LIGHTS_RAMP) / LIGHTS_RAMP;

    // Lights ramp on.
    for (const m of this.lightMaterials) {
      m.emissiveIntensity = 0.9 * t;
    }

    if (this.car && this.stage) {
      // Slow auto-spin (or a fixed three-quarter angle under reduced motion).
      if (this.reducedMotion) {
        this.stage.rotation.y = -0.6;
      } else {
        this.stage.rotation.y += SPIN_SPEED;
      }

      // Damped bounce right after a preset/color change.
      const e = this.rebuildElapsed;
      const bounce = e < 0.9 ? Math.exp(-7 * e) * Math.sin(18 * e) * 0.16 : 0;
      this.car.position.y = this.carBaseY + bounce;
    }
  }

  private dispose(): void {
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    if (this.car) {
      disposeVehicle(this.car);
    }
    if (this.reflection) {
      disposeVehicle(this.reflection);
    }
    if (this.grid) {
      this.grid.geometry.dispose();
      (this.grid.material as THREE.Material).dispose();
    }
    this.renderer?.dispose();
  }
}
