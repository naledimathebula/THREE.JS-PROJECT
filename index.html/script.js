import * as THREE from 'three';

const startBtn = document.getElementById('start');
const msg = document.getElementById('msg');

startBtn.onclick = async () => {
    // the mic needs a user gesture, https or localhost
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
        msg.textContent = 'Microphone blocked: allow it in the browser and try again.';
        return;
    }
    startBtn.remove();

    // --- scene ---------------------------------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    camera.position.z = 5;                        // step back so the bar is in view

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    const bar = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.5, 1),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    scene.add(bar);

    addEventListener('resize', () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
    });

    // --- audio ---------------------------------------------------------
    const audioContext = new AudioContext();
    await audioContext.resume();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);                     // without this the analyser hears nothing
    const data = new Uint8Array(analyser.frequencyBinCount);

    let heat = 0;                                 // 0 = cool, 1 = hot

    function animate() {
        requestAnimationFrame(animate);

        analyser.getByteFrequencyData(data);
        // average the low/mid bins, where voices and chewing live
        let sum = 0;
        const n = 24;
        for (let i = 0; i < n; i++) sum += data[i];
        const level = sum / n / 255;              // 0..1

        if (level > 0.15) heat += level * 0.12;   // loud sound heats it up
        heat = THREE.MathUtils.clamp(heat, 0, 1);
        heat = THREE.MathUtils.lerp(heat, 0, 0.03); // then it cools back down

        bar.scale.y = 1 + heat * 8;
        bar.position.y = -1.5 + (0.5 * bar.scale.y) / 2;   // grow upward from a fixed floor
        bar.material.color.setHSL(0.15 - heat * 0.15, 1, 0.5); // yellow -> red

        renderer.render(scene, camera);
    }
    animate();
};