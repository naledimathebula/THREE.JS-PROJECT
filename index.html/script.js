document.getElementById("start").onclick=async=()=>{
    document.getElementById("start").remove() {

        const scene=new THREE.Scene();
        const camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
        const renderer=new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth,window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(1,0.5,1),
            new THREE.MeshBasicMaterial({color:0x00ff00})
        );
        scene.add(bar);
        
        const stream = await navigator.mediaDevices.getUserMedia({audio:true});
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        const data = new Uint8Array(analyser.frequencyBinCount);

        let heat = 0;