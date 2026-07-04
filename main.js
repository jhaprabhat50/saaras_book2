/* =========================================================
   Saara's Book of Stories — "Pages Take Flight"
   A lightweight boids simulation of folded-paper birds,
   drifting across a dusk sky and scattering from the cursor —
   as if a handful of storybook pages had grown wings.
   ========================================================= */
import * as THREE from 'three';

const canvas = document.getElementById('bird-canvas');
if (canvas) initBirds(canvas);

function initBirds(canvas) {
  const container = canvas.parentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Scene / camera / renderer -------------------------------------
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x16213a, 14, 58);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 2, 26);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ---- Lighting (warm dusk key + cool ambient fill) -------------------
  const ambient = new THREE.AmbientLight(0x445a8a, 1.1);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(0xffe3a3, 1.0);
  keyLight.position.set(-6, 8, 6);
  scene.add(keyLight);

  // ---- Flight volume (birds wrap around inside this box) --------------
  const BOUNDS = { x: 20, y: 9, z: 12 };
  const isNarrow = window.innerWidth < 720;
  const BIRD_COUNT = isNarrow ? 45 : 110;

  const birdColors = [0xfbf2df, 0xf5c344, 0xf5c344, 0xfbf2df, 0xc64545];

  function makeBirdMesh(color) {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide });

    const body = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.62, 4), mat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    const wingGeo = new THREE.PlaneGeometry(0.58, 0.2, 1, 1);
    // shear the wing slightly so it reads as a folded paper plane, not a flat rectangle
    wingGeo.translate(0.29, 0, 0);

    const wingL = new THREE.Mesh(wingGeo, mat);
    const wingR = new THREE.Mesh(wingGeo, mat);
    wingR.scale.x = -1;
    group.add(wingL, wingR);

    return { group, wingL, wingR };
  }

  class Bird {
    constructor() {
      const color = birdColors[Math.floor(Math.random() * birdColors.length)];
      const mesh = makeBirdMesh(color);
      this.group = mesh.group;
      this.wingL = mesh.wingL;
      this.wingR = mesh.wingR;

      this.position = new THREE.Vector3(
        (Math.random() - 0.5) * BOUNDS.x * 2,
        (Math.random() - 0.5) * BOUNDS.y * 2,
        (Math.random() - 0.5) * BOUNDS.z * 2
      );
      const angle = Math.random() * Math.PI * 2;
      this.velocity = new THREE.Vector3(Math.cos(angle), (Math.random() - 0.5) * 0.4, Math.sin(angle))
        .multiplyScalar(2 + Math.random());

      this.flapPhase = Math.random() * Math.PI * 2;
      this.flapSpeed = 9 + Math.random() * 5;
      this.maxSpeed = 4.2 + Math.random() * 1.6;
      this.group.position.copy(this.position);
      this.group.scale.setScalar(0.85 + Math.random() * 0.5);
    }

    update(dt, flock, avoidPoint, avoidActive, t) {
      const separation = new THREE.Vector3();
      const alignment = new THREE.Vector3();
      const cohesion = new THREE.Vector3();
      let neighbors = 0;

      for (const other of flock) {
        if (other === this) continue;
        const d = this.position.distanceTo(other.position);
        if (d < 3.2 && d > 0.0001) {
          separation.add(
            new THREE.Vector3().subVectors(this.position, other.position).divideScalar(d)
          );
        }
        if (d < 6) {
          alignment.add(other.velocity);
          cohesion.add(other.position);
          neighbors++;
        }
      }

      const steer = new THREE.Vector3();
      steer.add(separation.multiplyScalar(1.7));

      if (neighbors > 0) {
        alignment.divideScalar(neighbors).sub(this.velocity).multiplyScalar(0.06);
        cohesion.divideScalar(neighbors).sub(this.position).multiplyScalar(0.02);
        steer.add(alignment).add(cohesion);
      }

      // gentle pull back toward the centre so the flock doesn't drift off
      const home = new THREE.Vector3().sub(this.position).multiplyScalar(0.0015);
      steer.add(home);

      // startle away from the cursor's projected point, like a hawk passed overhead
      if (avoidActive) {
        const d = this.position.distanceTo(avoidPoint);
        const radius = 6.5;
        if (d < radius) {
          const push = new THREE.Vector3()
            .subVectors(this.position, avoidPoint)
            .normalize()
            .multiplyScalar((radius - d) * 0.9);
          steer.add(push);
        }
      }

      this.velocity.add(steer.multiplyScalar(dt));
      if (this.velocity.length() > this.maxSpeed) {
        this.velocity.setLength(this.maxSpeed);
      }
      if (this.velocity.length() < 1.2) {
        this.velocity.setLength(1.2);
      }

      this.position.addScaledVector(this.velocity, dt);

      // wrap around the flight volume
      if (this.position.x > BOUNDS.x) this.position.x = -BOUNDS.x;
      if (this.position.x < -BOUNDS.x) this.position.x = BOUNDS.x;
      if (this.position.y > BOUNDS.y) this.position.y = -BOUNDS.y;
      if (this.position.y < -BOUNDS.y) this.position.y = BOUNDS.y;
      if (this.position.z > BOUNDS.z) this.position.z = -BOUNDS.z;
      if (this.position.z < -BOUNDS.z) this.position.z = BOUNDS.z;

      this.group.position.copy(this.position);

      const dir = this.velocity.clone().normalize();
      const lookTarget = this.position.clone().add(dir);
      this.group.up.set(0, 1, 0);
      this.group.lookAt(lookTarget);

      const flap = Math.sin(t * this.flapSpeed + this.flapPhase) * 0.85;
      this.wingL.rotation.y = flap;
      this.wingR.rotation.y = -flap;
    }
  }

  const flock = [];
  for (let i = 0; i < BIRD_COUNT; i++) {
    const b = new Bird();
    flock.push(b);
    scene.add(b.group);
  }

  // ---- Cursor tracking --------------------------------------------------
  const pointerNDC = new THREE.Vector2(-10, -10);
  const raycaster = new THREE.Raycaster();
  const avoidPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const avoidPoint = new THREE.Vector3();
  let pointerActive = false;
  let pointerIdleTimer = null;

  function updatePointer(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointerNDC, camera);
    raycaster.ray.intersectPlane(avoidPlane, avoidPoint);
    pointerActive = true;

    clearTimeout(pointerIdleTimer);
    pointerIdleTimer = setTimeout(() => { pointerActive = false; }, 2500);
  }

  window.addEventListener('pointermove', (e) => updatePointer(e.clientX, e.clientY), { passive: true });
  window.addEventListener('pointerdown', (e) => updatePointer(e.clientX, e.clientY), { passive: true });

  // ---- Resize -------------------------------------------------------
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- Animation loop -------------------------------------------------
  const clock = new THREE.Clock();

  function renderOnce() {
    renderer.render(scene, camera);
  }

  function animate() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    for (const b of flock) b.update(dt, flock, avoidPoint, pointerActive, t);

    renderer.render(scene, camera);
    if (!prefersReducedMotion) requestAnimationFrame(animate);
  }

  if (prefersReducedMotion) {
    // Respect reduced-motion: draw one settled frame instead of a continuous loop.
    renderOnce();
  } else {
    animate();
  }
}
