import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const INTERNAL_HEIGHT = 270; // low-res render target, upscaled pixelated

// Scanlines, chromatic aberration, vignette and colour banding.
const LofiShader = {
  uniforms: {
    tDiffuse: { value: null },
    uRes: { value: new THREE.Vector2(480, 270) },
    uTime: { value: 0 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec2 uRes;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vec2 d = (vUv - 0.5);
      float ca = 0.0015 + dot(d, d) * 0.006;
      vec3 col = vec3(
        texture2D(tDiffuse, vUv + d * ca).r,
        texture2D(tDiffuse, vUv).g,
        texture2D(tDiffuse, vUv - d * ca).b
      );
      float scan = 0.88 + 0.12 * sin(vUv.y * uRes.y * 3.14159);
      col *= scan;
      col *= smoothstep(0.95, 0.35, length(d));
      col = floor(col * 24.0 + 0.5) / 24.0;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(1);

  const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
  const bloom = new UnrealBloomPass(new THREE.Vector2(480, 270), 0.9, 0.6, 0.2);
  const lofi = new ShaderPass(LofiShader);
  const composer = new EffectComposer(renderer);
  composer.addPass(rp);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  composer.addPass(lofi);

  function resize() {
    const aspect = window.innerWidth / window.innerHeight;
    const w = Math.round(INTERNAL_HEIGHT * aspect);
    renderer.setSize(w, INTERNAL_HEIGHT, false);
    composer.setSize(w, INTERNAL_HEIGHT);
    lofi.uniforms.uRes.value.set(w, INTERNAL_HEIGHT);
    return aspect;
  }
  window.addEventListener('resize', resize);
  resize();

  return {
    renderer,
    aspect: () => window.innerWidth / window.innerHeight,
    render(scene, camera, time = 0) {
      rp.scene = scene;
      rp.camera = camera;
      lofi.uniforms.uTime.value = time;
      composer.render();
    },
  };
}
