import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('hero-canvas');
if (!canvas) return;

try {
  // Initialize renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  // Create scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.45, 2.1);

  // Lighting
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.1);
  directionalLight1.position.set(2, 2, 2);
  
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-2, -1, 1);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(directionalLight1, directionalLight2, ambientLight);

  // Create 3D object
  const geometry = new THREE.IcosahedronGeometry(0.9, 5);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xeceff1,
    metalness: 0.85,
    roughness: 0.12,
    transmission: 0.6,
    thickness: 0.6,
    clearcoat: 1,
    clearcoatRoughness: 0.02
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Store original positions for animation
  const positions = geometry.attributes.position;
  const originalPositions = positions.array.slice();
  let time = 0;
  const tempVector = new THREE.Vector3();

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.45;
  controls.rotateSpeed = 0.6;

  // Handle resize
  function handleResize() {
    const container = canvas.parentElement;
    const width = Math.max(200, container.clientWidth);
    const height = Math.max(200, container.clientHeight);
    
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(canvas.parentElement);
  handleResize();

  // Animation loop
  function animate() {
    time += 0.004;
    
    // Animate vertices
    for (let i = 0; i < positions.count; i++) {
      tempVector.fromBufferAttribute(positions, i).normalize();
      const waveOffset = 0.028 * Math.sin(time + i * 0.12);
      
      positions.setXYZ(
        i,
        originalPositions[i * 3] + tempVector.x * waveOffset,
        originalPositions[i * 3 + 1] + tempVector.y * waveOffset,
        originalPositions[i * 3 + 2] + tempVector.z * waveOffset
      );
    }
    
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  
  animate();

  // Interactive color change on click
  canvas.addEventListener('click', () => {
    const hue = (performance.now() / 60) % 360;
    material.color.setHSL(hue / 360, 0.6, 0.6);
  });

  // Easter egg: Konami code
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 
    'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight', 
    'b', 'a'
  ];
  let konamiIndex = 0;
  
  window.addEventListener('keydown', (e) => {
    konamiIndex = (e.key === konamiCode[konamiIndex]) ? konamiIndex + 1 : 0;
    
    if (konamiIndex === konamiCode.length) {
      if (window.gsap) {
        gsap.to(mesh.rotation, {
          x: '+=6.283',
          y: '+=6.283',
          duration: 1.6,
          ease: 'power3.inOut'
        });
      }
      konamiIndex = 0;
    }
  });

} catch (error) {
  console.error('Three.js initialization error:', error);
}
