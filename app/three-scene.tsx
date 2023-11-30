"use client";

import * as THREE from "three";
import { useRef, useEffect } from "react";
import {
  EffectComposer,
  GammaCorrectionShader,
  RGBShiftShader,
  RenderPass,
  ShaderPass,
} from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // textures
      const textureLoader = new THREE.TextureLoader();
      const gridTexture = textureLoader.load("/grid.png");
      const terrainTexture = textureLoader.load("/displacement.png");

      const canvas = containerRef?.current as HTMLElement;

      // scene
      const scene = new THREE.Scene();

      // add some fog to the back of the scene
      const fog = new THREE.Fog(0x000000, 1, 2.5);
      scene.fog = fog;

      // objects
      const geometry = new THREE.PlaneGeometry(1, 2, 24, 24);
      const material = new THREE.MeshStandardMaterial({
        map: gridTexture,
        displacementMap: terrainTexture,
        displacementScale: 0.4,
      });

      const plane = new THREE.Mesh(geometry, material);
      plane.rotation.x = -Math.PI * 0.5;
      plane.position.y = 0.0;
      plane.position.z = 0.15;

      const plane2 = new THREE.Mesh(geometry, material);
      plane2.rotation.x = -Math.PI * 0.5;
      plane2.position.y = 0.0;
      plane2.position.z = -1.85;

      scene.add(plane);
      scene.add(plane2);

      // lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 10);
      scene.add(ambientLight);

      // sizes
      const sizes = { width: window.innerWidth, height: window.innerHeight };

      // camera
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.01,
        20
      );
      camera.position.x = 0;
      camera.position.y = 0.06;
      camera.position.z = 1.1;

      // controls
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;

      // renderer
      const renderer = new THREE.WebGLRenderer({ canvas: canvas });
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // post processing (add the effect composer)
      const effectComposer = new EffectComposer(renderer);
      effectComposer.setSize(sizes.width, sizes.height);
      effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // add the render path to the compose
      const renderPass = new RenderPass(scene, camera);
      effectComposer.addPass(renderPass);

      // add the rgbShift pass to the composer
      const rgbShiftPass = new ShaderPass(RGBShiftShader);
      rgbShiftPass.uniforms["amount"].value = 0.0015;

      effectComposer.addPass(rgbShiftPass);

      // add the gammaCorrection pass to the coomposer to fix the color issues
      const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
      effectComposer.addPass(gammaCorrectionPass);

      // event listener to handle screen resize
      const handleResize = () => {
        // update sizes
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        // update camera
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        // update renderer
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // update effect composer
        effectComposer.setSize(sizes.width, sizes.height);
        effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      };

      window.addEventListener("resize", handleResize);

      // animate
      const clock = new THREE.Clock();

      const tick = () => {
        // get the elapsedTime since the scene rendered from the clock
        const elapsedTime = clock.getElapsedTime();

        // update controls
        controls.update();

        /**
         * When the first plane reaches a positon of z = 2
         * I reset it to 0, its initial position
         */
        plane.position.z = (elapsedTime * 0.15) % 2;

        /**
         * When the first plane reaches a position of z = 0
         * I reset it to -2, its initial position
         */
        plane2.position.z = ((elapsedTime * 0.15) % 2) - 2;

        // update the rendered scene
        renderer.render(scene, camera);

        // I use the render method of the effect composer instead to render  the scene with our post-processing effects
        effectComposer.render();

        // call tick again on the next frame
        window.requestAnimationFrame(tick);
      };

      tick();

      // clean up the event listener when the component is unmounted
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return <canvas ref={containerRef} />;
};
export default ThreeScene;
