"use client";

import * as THREE from "three";
import { useRef, useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // textures
      const textureLoader = new THREE.TextureLoader();
      const gridTexture = textureLoader.load("/grid.png");

      const canvas = containerRef?.current as HTMLElement;

      // scene
      const scene = new THREE.Scene();

      // objects
      const geometry = new THREE.PlaneGeometry(1, 2, 24, 24);
      const material = new THREE.MeshBasicMaterial({ map: gridTexture });

      const plane = new THREE.Mesh(geometry, material);
      plane.rotation.x = -Math.PI * 0.5;
      plane.position.y = 0.0;
      plane.position.z = 0.15;

      scene.add(plane);

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

      // const renderer = new THREE.WebGLRenderer();

      // renderer.setSize(window.innerWidth, window.innerHeight);
      // containerRef.current?.appendChild(renderer.domElement);
      // camera.position.z = 5;

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
      };

      window.addEventListener("resize", handleResize);

      // animate
      const tick = () => {
        // update controls
        controls.update();

        // update the rendered scene
        renderer.render(scene, camera);

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
