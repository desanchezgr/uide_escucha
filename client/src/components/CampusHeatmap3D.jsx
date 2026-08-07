import { useEffect, useRef, useState } from "react";
import {
  Box, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { apiFetch } from "../utils/api.js";
import ZONAS from "../config/zonasConfig.js";

/* ── Colores de intensidad ──────────────────────────────────────── */
function heatColor(t) {
  const verde = new THREE.Color("#22c55e");
  const amarillo = new THREE.Color("#eab308");
  const rojo = new THREE.Color("#ef4444");
  if (t < 0.5) return verde.clone().lerp(amarillo, t * 2);
  return amarillo.clone().lerp(rojo, (t - 0.5) * 2);
}

/* ── Textura radial para el halo ────────────────────────────────── */
function makeHaloTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.5)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/* ── Campus de respaldo ─────────────────────────────────────────── */
function buildProceduralCampus() {
  const group = new THREE.Group();
  const blocks = [
    { x: -3.6, z: -2.4, w: 2.3, d: 2.3, h: 1.7 },
    { x: -0.1, z: -2.8, w: 2.2, d: 2.1, h: 1.45 },
    { x: 3.7, z: -2.2, w: 2.1, d: 2.5, h: 1.6 },
    { x: -3.3, z: 2.1, w: 1.9, d: 2.0, h: 1.2 },
    { x: 0.2, z: 2.5, w: 3.3, d: 2.5, h: 1.05 },
    { x: 4.1, z: 2.3, w: 1.5, d: 1.5, h: 0.45 },
  ];
  blocks.forEach((b) => {
    const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4a4458, roughness: 0.8, metalness: 0.05 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(b.x, b.h / 2, b.z);
    group.add(mesh);
  });
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15),
    new THREE.MeshStandardMaterial({ color: 0x2a2838, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);
  return group;
}

/* ── Estado de conexión ────────────────────────────────────────── */
const STATUS_DOT = { online: "#22c55e", offline: "#ef4444", connecting: "#eab308" };
const STATUS_TEXT = { online: "En línea", offline: "Sin conexión", connecting: "Conectando…" };

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — zonas estáticas del plano
   ═══════════════════════════════════════════════════════════════════ */
export default function CampusHeatmap3D() {
  const containerRef = useRef(null);
  const st = useRef({
    raf: 0,
    renderer: null,
    camera: null,
    controls: null,
    scene: null,
    modelBounds: { center: new THREE.Vector3(), size: new THREE.Vector3(12, 8, 12), minY: 0 },
  });

  const manchasRef = useRef({});
  const [modelState, setModelState] = useState("loading");
  const [webglFailed, setWebglFailed] = useState(false);
  const [zoneCounts, setZoneCounts] = useState({});

  /* ── Fetch único de conteos ───────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    apiFetch("/reportes/heatmap")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (cancelled || !body) return;
        const map = {};
        (body.zonas || body).forEach((z) => { map[z.zona] = z.total; });
        setZoneCounts(map);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  /* ── Crear manchas una sola vez ──────────────────────────────── */
  const crearManchas = (bounds) => {
    const scene = st.current.scene;
    const haloTex = makeHaloTexture();
    const baseScale = Math.max(bounds.size.x, bounds.size.z) * 0.04;

    ZONAS.forEach((zona, index) => {
      const worldX = bounds.center.x + (zona.x / 30) * (bounds.size.x * 0.5);
      const worldZ = bounds.center.z + (zona.z / 30) * (bounds.size.z * 0.5);
      const worldY = bounds.minY + 0.2;
      const t = 0;

      const group = new THREE.Group();
      group.position.set(worldX, worldY, worldZ);

      /* Disco base */
      const discGeo = new THREE.CircleGeometry(baseScale * 0.5, 32);
      const discMat = new THREE.MeshBasicMaterial({
        color: heatColor(t),
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = 0.05;
      group.add(disc);

      /* Pin vertical */
      const pinHeight = 1.2;
      const pinGeo = new THREE.CylinderGeometry(0.03, 0.03, pinHeight, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color: heatColor(t), transparent: true, opacity: 0.6 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.y = pinHeight / 2;
      group.add(pin);

      /* Esfera superior */
      const sphereRadius = baseScale * 0.25;
      const sphereGeo = new THREE.SphereGeometry(sphereRadius, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: heatColor(t),
        emissive: heatColor(t),
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.75,
        roughness: 0.3,
        metalness: 0.1,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.y = pinHeight + sphereRadius;
      group.add(sphere);

      /* Halo sprite */
      const spriteMat = new THREE.SpriteMaterial({
        map: haloTex,
        color: heatColor(t),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.y = 0.1;
      sprite.scale.setScalar(baseScale * 1.5);
      group.add(sprite);

      scene.add(group);

      manchasRef.current[zona.id] = {
        group, disc, discMat, pin, pinMat, sphere, sphereMat, spriteMat, sprite,
        baseScale, pinHeight, sphereRadius,
        currentIntensidad: 0, targetIntensidad: 0,
        currentColor: new THREE.Color(heatColor(0)),
        targetColor: new THREE.Color(heatColor(0)),
      };
    });
  };

  /* ── Actualizar marcadores 3D con datos reales ─────────────── */
  useEffect(() => {
    const entries = Object.values(manchasRef.current);
    if (!entries.length) return;

    const totals = Object.values(zoneCounts);
    const maxTotal = Math.max(...totals, 1);

    Object.entries(zoneCounts).forEach(([zonaId, total]) => {
      const entry = manchasRef.current[zonaId];
      if (!entry) return;
      entry.targetIntensidad = Math.min(total / maxTotal, 1);
      entry.targetColor = heatColor(entry.targetIntensidad);
    });

    ZONAS.forEach((z) => {
      const entry = manchasRef.current[z.id];
      if (entry && !(z.id in zoneCounts)) {
        entry.targetIntensidad = 0;
        entry.targetColor = heatColor(0);
      }
    });
  }, [zoneCounts]);

  /* ── Escena Three.js ─────────────────────────────────────────── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const s = st.current;
    let disposed = false;
    let renderer, scene, camera, controls;

    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
      if (!gl) {
        queueMicrotask(() => setWebglFailed(true));
        return;
      }

      scene = new THREE.Scene();
      scene.background = new THREE.Color("#1a1824");
      scene.fog = new THREE.Fog(0x1a1824, 60, 120);
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      container.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.maxPolarAngle = Math.PI * 0.48;
      controls.minDistance = 8;
      controls.maxDistance = 60;
    } catch {
      queueMicrotask(() => setWebglFailed(true));
      return;
    }

    s.scene = scene;
    s.camera = camera;
    s.renderer = renderer;
    s.controls = controls;

    /* ── Iluminación de 3 puntos ────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    scene.add(new THREE.HemisphereLight(0x8899cc, 0x2a1a0a, 0.9));

    const dir = new THREE.DirectionalLight(0xfff5e0, 1.6);
    dir.position.set(40, 60, 30);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 200;
    dir.shadow.camera.left = -50;
    dir.shadow.camera.right = 50;
    dir.shadow.camera.top = 50;
    dir.shadow.camera.bottom = -50;
    scene.add(dir);

    scene.add(new THREE.DirectionalLight(0x6688bb, 0.5).translateX(-30).translateY(20).translateZ(-20));

    const rim = new THREE.PointLight(0xffa040, 0.3, 100);
    rim.position.set(0, 40, -40);
    scene.add(rim);

    /* ── ResizeObserver ─────────────────────────────────────────── */
    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    /* ── Registrar raíz del modelo ──────────────────────────────── */
    const registerRoot = (root, label) => {
      scene.add(root);
      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);
      s.modelBounds = { center, size, minY: box.min.y };

      console.log(`[CampusHeatmap3D] Modelo ${label}:`, {
        size: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
      });

      camera.position.set(
        center.x + size.x * 0.8,
        Math.max(size.y * 1.3, 15),
        center.z + size.z * 0.9
      );
      controls.target.set(center.x, center.y + size.y * 0.1, center.z);
      controls.update();

      crearManchas(s.modelBounds);
    };

    /* ── Cargar modelo .glb ─────────────────────────────────────── */
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      "/gbl/campus_optimizado.glb",
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) child.material.needsUpdate = true;
          }
        });
        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const k = 20 / maxDim;
        root.scale.setScalar(k);
        root.updateMatrixWorld(true);
        const b2 = new THREE.Box3().setFromObject(root);
        const c2 = new THREE.Vector3();
        b2.getCenter(c2);
        root.position.set(-c2.x, -b2.min.y, -c2.z);
        root.updateMatrixWorld(true);
        registerRoot(root, "campus_optimizado.glb");
        setModelState("loaded");
      },
      undefined,
      (err) => {
        console.error("[CampusHeatmap3D] Error cargando modelo:", err);
        if (disposed) return;
        registerRoot(buildProceduralCampus(), "fallback procedural");
        setModelState("fallback");
      }
    );

    /* ── Loop de animación (solo pulsos sutiles) ────────────────── */
    const animate = () => {
      if (disposed) return;
      s.raf = requestAnimationFrame(animate);
      controls.update();

      /* Interpolar colores y escala de marcadores */
      Object.values(manchasRef.current).forEach((entry) => {
        if (!entry || !entry.sphere) return;

        entry.currentIntensidad = THREE.MathUtils.lerp(entry.currentIntensidad, entry.targetIntensidad, 0.04);
        entry.currentColor.lerp(entry.targetColor, 0.04);

        const hex = "#" + entry.currentColor.getHexString();
        const t = entry.currentIntensidad;

        entry.discMat.color.set(hex);
        entry.pinMat.color.set(hex);
        entry.sphereMat.color.set(hex);
        entry.sphereMat.emissive.set(hex);

        const pulse = 1 + 0.08 * Math.sin(performance.now() * 0.002 + entry.baseScale * 10);
        entry.discMat.opacity = 0.15 + 0.4 * t;
        entry.pinMat.opacity = 0.3 + 0.5 * t;
        entry.sphereMat.opacity = 0.4 + 0.5 * t;
        entry.sphereMat.emissiveIntensity = 0.15 + t * 0.7;
        entry.spriteMat.opacity = 0.05 + 0.35 * t;

        entry.sphere.scale.setScalar(pulse * (0.5 + t * 1.2));
        entry.pin.scale.set(1, 0.5 + t * 0.5, 1);
        entry.disc.scale.set(0.5 + t * 1.5, 0.5 + t * 1.5, 1);
        entry.sprite.scale.setScalar((0.3 + t * 1.5) * entry.baseScale);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(s.raf);
      ro.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material?.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      manchasRef.current = {};
      s.scene = null;
      s.renderer = null;
      s.controls = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "22px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "#121018",
        boxShadow: "0 18px 48px rgba(10,6,18,0.45)",
        mb: 2.5,
        position: "relative",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2, borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 34, height: 34, borderRadius: "11px", bgcolor: "rgba(252,192,25,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#FCC019" }}>map</span>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="#ffffff">Mapa de Calor del Campus</Typography>
            <Typography variant="caption" sx={{ color: "#8b8694" }}>
              {modelState === "loaded" ? "Modelo 3D real" : "Modelo de referencia"} · arrastra para rotar, rueda para zoom
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ── Canvas 3D ──────────────────────────────────────────── */}
      <Box sx={{ position: "relative", height: 520 }}>
        {webglFailed ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 1.5, px: 3 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#3d3850" }}>view_in_ar_off</span>
            <Typography sx={{ color: "#8b8694", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
              Tu navegador no soporta WebGL — el mapa 3D no puede renderizarse.
            </Typography>
            <Typography sx={{ color: "#5a546a", fontSize: 11.5, textAlign: "center" }}>
              Intenta con Chrome o Firefox habilitando hardware acceleration en ajustes.
            </Typography>
          </Box>
        ) : (
          <>
            <Box ref={containerRef} sx={{ position: "absolute", inset: 0 }} />
            {modelState === "loading" && (
              <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, bgcolor: "rgba(18,16,24,0.7)", zIndex: 2 }}>
                <CircularProgress size={26} sx={{ color: "#FCC019" }} />
                <Typography sx={{ color: "#8b8694", fontSize: 12.5, fontWeight: 600 }}>Cargando modelo del campus…</Typography>
              </Box>
            )}
          </>
        )}

        {/* ── Panel lateral: áreas del campus ──────────────────── */}
        <Box sx={{ position: "absolute", bottom: 12, left: 12, zIndex: 2, bgcolor: "rgba(12,10,18,0.85)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", borderRadius: "14px", p: 1.5, minWidth: 200, maxWidth: 260, maxHeight: 260, overflowY: "auto" }}>
          <Typography sx={{ color: "#8b8694", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>Áreas del campus</Typography>
          <Stack spacing={0.5}>
            {ZONAS.map((zona, i) => {
              const color = "#" + heatColor(0.1 + (i % 3) * 0.25).getHexString();
              return (
                <Stack key={zona.id} direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: color, flexShrink: 0 }} />
                  <Typography sx={{ color: "#c9c4d2", fontSize: 10.5, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{zona.nombre}</Typography>
                </Stack>
              );
            })}
          </Stack>
        </Box>

        {/* ── Leyenda ───────────────────────────────────────────── */}
        <Box sx={{ position: "absolute", bottom: 12, right: 12, zIndex: 2, display: "flex", flexDirection: "column", gap: 0.75, bgcolor: "rgba(12,10,18,0.85)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", borderRadius: "14px", p: 1.25 }}>
          {[
            { color: "#22c55e", label: "Baja" },
            { color: "#eab308", label: "Media" },
            { color: "#ef4444", label: "Alta" },
          ].map((e) => (
            <Stack key={e.label} direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: e.color }} />
              <Typography sx={{ color: "#8b8694", fontSize: 10.5, fontWeight: 600 }}>{e.label}</Typography>
            </Stack>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
