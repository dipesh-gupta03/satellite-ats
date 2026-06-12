import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const EARTH_RADIUS = 1;
const SAT_SCALE = 0.015;

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

export default function Globe() {
    const mountRef = useRef(null);

    useEffect(() => {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.z = 3;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(w, h);
        renderer.setClearColor(0x000000);
        mountRef.current.appendChild(renderer.domElement);

        // Earth
        const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
        const textureLoader = new THREE.TextureLoader();
        const earthMat = new THREE.MeshPhongMaterial({
            map: textureLoader.load('/earth.jpg'),
            specular: 0x333333,
            shininess: 15,
        });
        const earth = new THREE.Mesh(earthGeo, earthMat);
        scene.add(earth);

        // Atmosphere glow
        const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.02, 64, 64);
        const atmosMat = new THREE.MeshPhongMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.08,
            side: THREE.FrontSide,
        });
        scene.add(new THREE.Mesh(atmosGeo, atmosMat));

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(5, 3, 5);
        scene.add(sun);

        // Stars
        const starGeo = new THREE.BufferGeometry();
        const starVerts = [];
        for (let i = 0; i < 6000; i++) {
            starVerts.push((Math.random() - 0.5) * 80);
            starVerts.push((Math.random() - 0.5) * 80);
            starVerts.push((Math.random() - 0.5) * 80);
        }
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
        scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })));

        // Fetch & plot satellites
        fetch('http://localhost:4000/api/satellites/positions')
            .then(r => r.json())
            .then(sats => {
                sats.forEach(sat => {
                    const altitude = EARTH_RADIUS + (sat.alt_km / 6371);
                    const pos = latLonToVector3(sat.lat, sat.lon, altitude);
                    const geo = new THREE.SphereGeometry(SAT_SCALE, 8, 8);
                    const mat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.copy(pos);
                    scene.add(mesh);
                });
            });

        // Mouse drag to rotate
        let isDragging = false, prevX = 0, prevY = 0;
        const onMouseDown = e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
        const onMouseUp = () => { isDragging = false; };
        const onMouseMove = e => {
            if (!isDragging) return;
            earth.rotation.y += (e.clientX - prevX) * 0.005;
            earth.rotation.x += (e.clientY - prevY) * 0.005;
            prevX = e.clientX; prevY = e.clientY;
        };
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);

        // Animate
        const animate = () => {
            requestAnimationFrame(animate);
            earth.rotation.y += 0.001;
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            renderer.dispose();
            mountRef.current?.removeChild(renderer.domElement);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
}