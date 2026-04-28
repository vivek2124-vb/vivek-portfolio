'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type FloatingGem = THREE.Mesh<
  THREE.BufferGeometry,
  THREE.Material | THREE.Material[]
> & {
  userData: {
    phase: number;
    speed: number;
    rx: number;
    ry: number;
  };
};

type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

type SubmitState = {
  loading: boolean;
  success: boolean;
  error: string;
};

/* ═══════════════════════════════════════════════════════
   VIVEK — CUTE 3D KAWAII WORLD PORTFOLIO
   Aesthetic: Dreamy floating islands · Cotton candy sky
              Jelly wobble physics · Rainbow sparkle trails
   ═══════════════════════════════════════════════════════ */

// ── Rainbow cursor trail ──────────────────────────────
function RainbowTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);

    const dots: { x: number; y: number; life: number; hue: number; r: number }[] = [];
    let hue = 0;

    const onMove = (e: MouseEvent) => {
      hue = (hue + 4) % 360;
      for (let i = 0; i < 3; i++) {
        dots.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          life: 1,
          hue,
          r: 4 + Math.random() * 6,
        });
      }
    };

    window.addEventListener('mousemove', onMove);

    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = dots.length - 1; i >= 0; i--) {
        const d = dots[i];
        d.life -= 0.04;
        d.r *= 0.96;

        if (d.life <= 0) {
          dots.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue},100%,70%,${d.life * 0.7})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}
    />
  );
}

// ── Floating hearts/stars cursor sparkles ────────────
function FloatingEmojis() {
  const [items, setItems] = useState<
    { id: number; x: number; y: number; em: string; vy: number }[]
  >([]);
  const idRef = useRef(0);
  const emojis = ['✦', '★', '♥', '✿', '◈', '⬡', '✺', '❋', '🌸', '💖'];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const batch = Array.from({ length: 5 }, () => ({
        id: idRef.current++,
        x: e.clientX + (Math.random() - 0.5) * 40,
        y: e.clientY,
        em: emojis[Math.floor(Math.random() * emojis.length)],
        vy: -(2 + Math.random() * 3),
      }));

      setItems((prev) => [...prev.slice(-30), ...batch]);
    };

    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!items.length) return;

    const id = requestAnimationFrame(() => {
      setItems((prev) =>
        prev
          .map((p) => ({ ...p, y: p.y + p.vy, vy: p.vy + 0.08 }))
          .filter((p) => p.y > -100)
      );
    });

    return () => cancelAnimationFrame(id);
  }, [items]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
      {items.map((it) => (
        <span
          key={it.id}
          style={{
            position: 'absolute',
            left: it.x,
            top: it.y,
            fontSize: 14,
            lineHeight: 1,
            transform: 'translateX(-50%)',
            opacity: Math.max(0, it.y < 200 ? (200 - it.y) / 200 : 1),
            color:
              typeof window !== 'undefined'
                ? `hsl(${(it.x / window.innerWidth) * 360},90%,65%)`
                : '#ff7eb3',
          }}
        >
          {it.em}
        </span>
      ))}
    </div>
  );
}

// ── Main 3D Scene ─────────────────────────────────────
function KawaiiScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.clientWidth || window.innerWidth;
    const H = canvas.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfde8f5);
    scene.fog = new THREE.FogExp2(0xfde8f5, 0.018);

    const cam = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    cam.position.set(0, 8, 26);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;

    scene.add(new THREE.AmbientLight(0xffe0f0, 1.4));

    const sun = new THREE.DirectionalLight(0xfff0e0, 2.2);
    sun.position.set(8, 20, 10);
    sun.castShadow = true;
    scene.add(sun);

    const fill = new THREE.PointLight(0xa0d8ff, 3, 80);
    fill.position.set(-12, 10, 8);
    scene.add(fill);

    const rim = new THREE.PointLight(0xffb3e6, 2.5, 60);
    rim.position.set(10, 5, -5);
    scene.add(rim);

    const makeSphere = (r: number, col: number) =>
      new THREE.Mesh(
        new THREE.SphereGeometry(r, 24, 24),
        new THREE.MeshPhongMaterial({ color: col, shininess: 8 })
      );

    function makeCloud(x: number, y: number, z: number, scale = 1) {
      const g = new THREE.Group();

      const base = makeSphere(1.8 * scale, 0xffffff);
      g.add(base);

      const b2 = makeSphere(1.4 * scale, 0xfff0f8);
      b2.position.set(1.8 * scale, 0.3 * scale, 0);
      g.add(b2);

      const b3 = makeSphere(1.2 * scale, 0xfff0f8);
      b3.position.set(-1.6 * scale, 0.2 * scale, 0);
      g.add(b3);

      const top = makeSphere(1.0 * scale, 0xffffff);
      top.position.set(0.4 * scale, 0.9 * scale, 0);
      g.add(top);

      g.position.set(x, y, z);
      return g;
    }

    const clouds: THREE.Group[] = [];
    [
      [-18, 14, -20, 1.6],
      [18, 16, -18, 1.2],
      [-8, 18, -25, 1.4],
      [12, 12, -15, 0.9],
      [-20, 10, -12, 1.0],
      [22, 14, -22, 1.3],
    ].forEach(([x, y, z, s]) => {
      const c = makeCloud(x, y, z, s);
      scene.add(c);
      clouds.push(c);
    });

    function makeIsland(
      x: number,
      y: number,
      z: number,
      scale = 1,
      grassCol = 0x9de88a,
      dirtCol = 0xc8956a
    ) {
      const g = new THREE.Group();

      const top = new THREE.Mesh(
        new THREE.SphereGeometry(3.2 * scale, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshPhongMaterial({ color: grassCol, shininess: 5 })
      );
      top.position.y = 0.2 * scale;
      g.add(top);

      const bot = new THREE.Mesh(
        new THREE.CylinderGeometry(3.0 * scale, 1.8 * scale, 2.8 * scale, 16),
        new THREE.MeshPhongMaterial({ color: dirtCol, shininess: 2 })
      );
      bot.position.y = -1.4 * scale;
      g.add(bot);

      g.position.set(x, y, z);
      (
        g as THREE.Group & {
          userData: { baseY: number; phase: number; speed: number };
        }
      ).userData = {
        baseY: y,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.3,
      };

      return g;
    }

    const islands: THREE.Group[] = [];
    const mainIsland = makeIsland(0, 0, 0, 1.4, 0x7de86a);
    scene.add(mainIsland);
    islands.push(mainIsland);

    [
      [12, 2, -8, 0.9, 0x8de870],
      [-14, 1, -6, 0.8, 0x70e8a0],
      [8, -1, -14, 0.7, 0xe8d070, 0xd4a060],
      [-10, 3, -16, 0.75, 0xe870a0, 0xc86080],
      [16, -2, -20, 0.65],
      [-18, 0, -18, 0.6, 0x70c8e8],
    ].forEach((args) => {
      const isl = makeIsland(
        ...(args as [number, number, number, number, number?, number?])
      );
      scene.add(isl);
      islands.push(isl);
    });

    function makeTree(
      x: number,
      y: number,
      z: number,
      col = 0x7de870,
      scale = 1,
      parent: THREE.Group | THREE.Scene = scene
    ) {
      const g = new THREE.Group();

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22 * scale, 0.28 * scale, 1.2 * scale, 8),
        new THREE.MeshPhongMaterial({ color: 0xc47a3a })
      );
      trunk.position.y = 0.6 * scale;
      g.add(trunk);

      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(0.9 * scale, 16, 16),
        new THREE.MeshPhongMaterial({ color: col, shininess: 6 })
      );
      crown.position.y = 1.7 * scale;
      g.add(crown);

      const top2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.6 * scale, 12, 12),
        new THREE.MeshPhongMaterial({
          color: new THREE.Color(col).offsetHSL(0, 0.05, 0.05).getHex(),
        })
      );
      top2.position.set(0.3 * scale, 2.3 * scale, 0);
      g.add(top2);

      g.position.set(x, y, z);
      parent.add(g);
      return g;
    }

    makeTree(0, 3.2, 0, 0x5dd85a, 1.1);
    makeTree(1.8, 3.1, 1.2, 0x7de870, 0.85);
    makeTree(-2, 3.2, 0.5, 0x4ec862, 0.9);
    makeTree(0.5, 3.1, -1.8, 0x6de060, 0.8);
    makeTree(-1.2, 3.0, 1.8, 0x8df080, 0.75);

    function makeHouse(
      x: number,
      y: number,
      z: number,
      wallCol = 0xffd6e7,
      roofCol = 0xff7eb3,
      scale = 1
    ) {
      const g = new THREE.Group();

      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(2.2 * scale, 1.8 * scale, 2.2 * scale),
        new THREE.MeshPhongMaterial({ color: wallCol })
      );
      walls.position.y = 0.9 * scale;
      g.add(walls);

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.7 * scale, 1.6 * scale, 4),
        new THREE.MeshPhongMaterial({ color: roofCol, shininess: 15 })
      );
      roof.position.y = 2.5 * scale;
      roof.rotation.y = Math.PI / 4;
      g.add(roof);

      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.45 * scale, 0.7 * scale, 0.05 * scale),
        new THREE.MeshPhongMaterial({ color: 0xc47a3a })
      );
      door.position.set(0, 0.35 * scale, 1.12 * scale);
      g.add(door);

      const winMat = new THREE.MeshPhongMaterial({
        color: 0xaee6ff,
        shininess: 60,
        transparent: true,
        opacity: 0.9,
      });
      const winGeo = new THREE.BoxGeometry(0.4 * scale, 0.4 * scale, 0.05 * scale);

      const w1 = new THREE.Mesh(winGeo, winMat);
      w1.position.set(-0.68 * scale, 0.9 * scale, 1.12 * scale);
      g.add(w1);

      const w2 = new THREE.Mesh(winGeo, winMat);
      w2.position.set(0.68 * scale, 0.9 * scale, 1.12 * scale);
      g.add(w2);

      const chim = new THREE.Mesh(
        new THREE.BoxGeometry(0.28 * scale, 0.6 * scale, 0.28 * scale),
        new THREE.MeshPhongMaterial({ color: 0xe8a080 })
      );
      chim.position.set(0.6 * scale, 3.0 * scale, 0.4 * scale);
      g.add(chim);

      g.position.set(x, y, z);
      return g;
    }

    const house = makeHouse(-0.4, 3.2, 0.3, 0xffd6e7, 0xff7eb3);
    mainIsland.add(house);

    if (islands[1]) islands[1].add(makeHouse(0, 2.2, 0, 0xd6e7ff, 0x7eb3ff, 0.75));
    if (islands[2]) islands[2].add(makeHouse(0, 2.0, 0, 0xe7ffd6, 0x80d462, 0.7));

    const blobGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const blobMat = new THREE.MeshPhongMaterial({
      color: 0xff9ece,
      emissive: 0xff5eb3,
      emissiveIntensity: 0.3,
      shininess: 40,
      transparent: true,
      opacity: 0.95,
    });

    const blob = new THREE.Mesh(blobGeo, blobMat);
    blob.position.set(0, 5.2, 0);
    mainIsland.add(blob);

    const eyeG = new THREE.SphereGeometry(0.18, 12, 12);
    const eyeM = new THREE.MeshPhongMaterial({ color: 0x1a0a14 });

    const le = new THREE.Mesh(eyeG, eyeM);
    le.position.set(-0.32, 5.42, 0.9);
    mainIsland.add(le);

    const re = new THREE.Mesh(eyeG, eyeM);
    re.position.set(0.32, 5.42, 0.9);
    mainIsland.add(re);

    const cheekM = new THREE.MeshPhongMaterial({
      color: 0xffb3cc,
      transparent: true,
      opacity: 0.6,
    });

    const lc = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), cheekM);
    lc.position.set(-0.6, 5.28, 0.82);
    mainIsland.add(lc);

    const rc = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), cheekM);
    rc.position.set(0.6, 5.28, 0.82);
    mainIsland.add(rc);

    const gemColors = [0xff9ece, 0xa0eaff, 0xd4b0ff, 0xffea80, 0xa0ffcc];
    const gems: FloatingGem[] = [];

    for (let i = 0; i < 18; i++) {
      const geo =
        i % 3 === 0
          ? new THREE.OctahedronGeometry(0.4, 0)
          : i % 3 === 1
          ? new THREE.TetrahedronGeometry(0.35, 0)
          : new THREE.IcosahedronGeometry(0.32, 0);

      const mat = new THREE.MeshPhongMaterial({
        color: gemColors[i % 5],
        emissive: gemColors[i % 5],
        emissiveIntensity: 0.5,
        shininess: 80,
        transparent: true,
        opacity: 0.85,
      });

      const gem = new THREE.Mesh(geo, mat);

      gem.position.set(
        (Math.random() - 0.5) * 36,
        (Math.random() - 0.5) * 14 + 4,
        (Math.random() - 0.5) * 20 - 8
      );

      (gem.userData as FloatingGem['userData']) = {
        phase: Math.random() * Math.PI * 2,
        speed: 1 + Math.random(),
        rx: Math.random() * 0.02,
        ry: 0.01 + Math.random() * 0.03,
      };

      scene.add(gem);
      gems.push(gem as unknown as FloatingGem);
    }

    const spkCount = 300;
    const spkPos = new Float32Array(spkCount * 3);

    for (let i = 0; i < spkCount * 3; i += 3) {
      spkPos[i] = (Math.random() - 0.5) * 60;
      spkPos[i + 1] = (Math.random() - 0.5) * 40 + 6;
      spkPos[i + 2] = (Math.random() - 0.5) * 30 - 10;
    }

    const spkGeo = new THREE.BufferGeometry();
    spkGeo.setAttribute('position', new THREE.BufferAttribute(spkPos, 3));

    const spkMat = new THREE.PointsMaterial({
      color: 0xffd6f0,
      size: 0.28,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const sparkles = new THREE.Points(spkGeo, spkMat);
    scene.add(sparkles);

    const rainbowColors = [0xff8080, 0xffb060, 0xffff80, 0x80ff80, 0x80c0ff, 0xb060ff];
    rainbowColors.forEach((col, i) => {
      const geo = new THREE.TorusGeometry(8 - i * 0.4, 0.14, 8, 80, Math.PI);
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.55 - 0.03 * i,
        side: THREE.DoubleSide,
      });
      const arch = new THREE.Mesh(geo, mat);
      arch.position.set(0, 1, -14);
      arch.rotation.x = -0.1;
      scene.add(arch);
    });

    const starPos = new Float32Array(200 * 3);
    for (let i = 0; i < 200 * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 120;
      starPos[i + 1] = 20 + Math.random() * 30;
      starPos[i + 2] = (Math.random() - 0.5) * 80 - 10;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xffd6f0,
        size: 0.45,
        transparent: true,
        opacity: 0.7,
      })
    );
    scene.add(stars);

    let mx = 0;
    let my = 0;

    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouse);

    let animationId = 0;
    let t = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      t += 0.012;

      islands.forEach((isl) => {
        const ud = (
          isl as THREE.Group & {
            userData: { baseY: number; phase: number; speed: number };
          }
        ).userData;

        isl.position.y = ud.baseY + Math.sin(t * ud.speed + ud.phase) * 0.6;
        isl.rotation.y = Math.sin(t * 0.2 + ud.phase) * 0.04;
      });

      const blobS = 1 + Math.sin(t * 3.5) * 0.08;
      blob.scale.set(blobS, 1 / blobS, blobS);

      blob.position.y = 5.2 + Math.sin(t * 2.8) * 0.3;
      le.position.y = 5.42 + Math.sin(t * 2.8) * 0.3;
      re.position.y = 5.42 + Math.sin(t * 2.8) * 0.3;
      lc.position.y = 5.28 + Math.sin(t * 2.8) * 0.3;
      rc.position.y = 5.28 + Math.sin(t * 2.8) * 0.3;

      const blink = Math.sin(t * 7) > 0.92 ? 0.1 : 1;
      le.scale.y = blink;
      re.scale.y = blink;

      gems.forEach((g) => {
        const ud = g.userData;

        g.position.y += Math.sin(t * ud.speed + ud.phase) * 0.015;
        g.rotation.x += ud.rx;
        g.rotation.y += ud.ry;

        const s = 1 + Math.sin(t * 2 + ud.phase) * 0.12;
        g.scale.setScalar(s);
      });

      clouds.forEach((c, i) => {
        c.position.x += 0.008 * (i % 2 === 0 ? 1 : -1);
        if (c.position.x > 30) c.position.x = -30;
        if (c.position.x < -30) c.position.x = 30;
      });

      const sp = sparkles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < spkCount; i++) {
        sp.array[i * 3 + 1] += 0.3;
        if (sp.array[i * 3 + 1] > 40) sp.array[i * 3 + 1] = -20;
      }
      sp.needsUpdate = true;
      sparkles.rotation.y = t * 0.03;

      spkMat.opacity = 0.5 + Math.sin(t * 2) * 0.2;

      cam.position.x += (mx * 5 - cam.position.x) * 0.04;
      cam.position.y += (8 + my * 3 - cam.position.y) * 0.04;
      cam.lookAt(mx * 2, 3 + my, 0);

      renderer.render(scene, cam);
    };

    animate();

    const resize = () => {
      const W2 = canvas.clientWidth || window.innerWidth;
      const H2 = canvas.clientHeight || window.innerHeight;

      cam.aspect = W2 / H2;
      cam.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', resize);

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();

        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else if (material) {
          material.dispose();
        }
      });

      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ── Wobbly card ───────────────────────────────────────
function WobbleCard({
  children,
  color = '#ffd6e7',
  delay = 0,
}: {
  children: React.ReactNode;
  color?: string;
  delay?: number;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: color,
        borderRadius: 24,
        padding: '28px 24px',
        transform: hov ? 'scale(1.06) rotate(-1.5deg)' : 'scale(1) rotate(0deg)',
        transition: 'transform .35s cubic-bezier(.34,1.56,.64,1)',
        boxShadow: hov ? `0 20px 60px ${color}99` : `0 6px 24px ${color}55`,
        animationDelay: `${delay}ms`,
        cursor: 'default',
      }}
    >
      {children}
    </div>
  );
}

// ── Skill pill ────────────────────────────────────────
const PILL_COLORS = ['#ffd6e7', '#d6e7ff', '#d6ffd6', '#fff0d6', '#e7d6ff', '#d6ffee'];

function SkillPill({ name, i }: { name: string; i: number }) {
  const [hov, setHov] = useState(false);

  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-block',
        padding: '8px 18px',
        borderRadius: 999,
        background: PILL_COLORS[i % 6],
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'Nunito',sans-serif",
        color: '#5a3070',
        transform: hov ? 'scale(1.15) rotate(-2deg)' : 'scale(1)',
        transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)',
        boxShadow: hov ? '0 8px 24px rgba(255,150,200,.35)' : 'none',
        cursor: 'default',
      }}
    >
      {name}
    </span>
  );
}

// ── Section wrapper ───────────────────────────────────
function Section({
  id,
  children,
  bg = 'transparent',
}: {
  id: string;
  children: React.ReactNode;
  bg?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.1 }
    );

    if (ref.current) obs.observe(ref.current);

    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      style={{
        background: bg,
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(48px)',
        transition: 'opacity .8s ease, transform .8s ease',
        padding: '100px 32px',
      }}
    >
      {children}
    </section>
  );
}

// ══════════════════════════════════════════════════════
export default function CuteWorld() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });

  const [submitState, setSubmitState] = useState<SubmitState>({
    loading: false,
    success: false,
    error: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitState({
      loading: true,
      success: false,
      error: '',
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_URL is missing in .env.local');
      }

      const apiUrl = `${baseUrl.replace(/\/$/, '')}/api/contact`;
      console.log('Submitting to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || `Request failed with status ${response.status}`
        );
      }

      setSubmitState({
        loading: false,
        success: true,
        error: '',
      });

      setFormData({
        name: '',
        email: '',
        message: '',
      });

      setTimeout(() => {
        setSubmitState((prev) => ({
          ...prev,
          success: false,
        }));
      }, 3500);
    } catch (error) {
      setSubmitState({
        loading: false,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to send message right now.',
      });
    }
  };

  const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/vivek2124-vb",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/vivek-singh-bisht-833282370/",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/your-twitter-id",
  },
];

  return (
    <div
      style={{
        fontFamily: "'Nunito',sans-serif",
        background: '#fff8fd',
        color: '#3a1a50',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Pacifico&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{margin:0;}
        ::selection{background:#ffb3e6;color:#3a1a50;}

        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes wiggle{0%,100%{transform:rotate(-3deg);}50%{transform:rotate(3deg);}}
        @keyframes pop{0%{transform:scale(0) rotate(-10deg);opacity:0;}70%{transform:scale(1.15);opacity:1;}100%{transform:scale(1);}}
        @keyframes rainbow{0%{filter:hue-rotate(0deg);}100%{filter:hue-rotate(360deg);}}
        @keyframes bounce{0%,100%{transform:translateY(0) scaleY(1);}40%{transform:translateY(-18px) scaleY(1.05);}60%{transform:translateY(-10px);}80%{transform:translateY(-4px);}}
        @keyframes shimmer{0%{background-position:0% 50%;}100%{background-position:200% 50%;}}

        .hero-title{
          font-family:'Pacifico',cursive;
          font-size:clamp(48px,8vw,110px);
          line-height:1.05;
          background:linear-gradient(135deg,#ff7eb3,#ff9ece,#a0c4ff,#c8b0ff,#ffb347);
          background-size:300% 300%;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          animation:shimmer 4s linear infinite;
        }

        .nav-pill{
          font-family:'Nunito',sans-serif;
          font-size:13px;
          font-weight:700;
          color:#9060b0;
          text-decoration:none;
          padding:6px 18px;
          border-radius:999px;
          transition:all .25s;
          text-transform:capitalize;
        }

        .nav-pill:hover{
          background:#ffd6e7;
          color:#c040a0;
          transform:scale(1.08);
        }

        .cute-btn{
          display:inline-flex;
          align-items:center;
          gap:8px;
          background:linear-gradient(135deg,#ff7eb3,#c87aff);
          color:#fff;
          font-family:'Nunito',sans-serif;
          font-weight:800;
          font-size:15px;
          padding:14px 32px;
          border-radius:999px;
          text-decoration:none;
          border:none;
          transition:all .3s;
          box-shadow:0 8px 28px rgba(200,100,255,.35);
          cursor:pointer;
        }

        .cute-btn:hover{
          transform:scale(1.08) translateY(-2px);
          box-shadow:0 16px 48px rgba(200,100,255,.5);
        }

        .cute-btn:active{transform:scale(.97);}
        .cute-btn:disabled{
          opacity:.7;
          cursor:not-allowed;
          transform:none;
          box-shadow:0 8px 28px rgba(200,100,255,.2);
        }

        .ghost-btn{
          display:inline-flex;
          align-items:center;
          gap:8px;
          background:transparent;
          color:#c040a0;
          font-family:'Nunito',sans-serif;
          font-weight:800;
          font-size:15px;
          padding:14px 32px;
          border-radius:999px;
          text-decoration:none;
          border:2.5px solid #ffb3e6;
          transition:all .3s;
        }

        .ghost-btn:hover{
          background:#fff0fa;
          transform:scale(1.06);
          border-color:#c040a0;
        }

        .field{
          width:100%;
          background:#fff0fa;
          border:2px solid #f0c0de;
          border-radius:16px;
          padding:14px 18px;
          font-family:'Nunito',sans-serif;
          font-size:14px;
          color:#3a1a50;
          outline:none;
          transition:border-color .25s, background .25s;
        }

        .field:focus{
          border-color:#c040a0;
          background:#fff8fd;
        }

        .field::placeholder{color:#d0a0c0;}

        .section-tag{
          display:inline-block;
          background:#ffd6e7;
          color:#c040a0;
          font-weight:800;
          font-size:11px;
          letter-spacing:.12em;
          text-transform:uppercase;
          padding:6px 16px;
          border-radius:999px;
          margin-bottom:20px;
        }

        .section-h2{
          font-family:'Pacifico',cursive;
          font-size:clamp(36px,5vw,64px);
          line-height:1.1;
          color:#3a1a50;
          margin-bottom:16px;
        }

        .project-card{
          background:linear-gradient(135deg,#fff0fa,#f0e6ff);
          border-radius:28px;
          overflow:hidden;
          transition:all .4s cubic-bezier(.34,1.56,.64,1);
          border:2px solid #f0d0ee;
        }

        .project-card:hover{
          transform:translateY(-10px) rotate(.5deg);
          box-shadow:0 30px 80px rgba(200,100,200,.22);
        }

        @media (max-width: 900px){
          .about-grid{grid-template-columns:1fr !important;}
          .skills-grid{grid-template-columns:1fr !important;}
        }

        @media (max-width: 768px){
          .nav-links{display:none !important;}
          .contact-grid{grid-template-columns:1fr !important;}
        }
      `}</style>

      <RainbowTrail />
      <FloatingEmojis />

      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          height: 72,
          background: 'rgba(255,248,253,.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1.5px solid #f5d0ee',
        }}
      >
        <a
          href="#home"
          style={{
            fontFamily: "'Pacifico',cursive",
            fontSize: 26,
            color: '#ff7eb3',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ animation: 'wiggle 2s infinite', display: 'inline-block' }}>✿</span>
          Vivek
        </a>

        <div className="nav-links" style={{ display: 'flex', gap: 4 }}>
          {['#home', '#about', '#skills', '#projects', '#contact'].map((h) => (
            <a key={h} href={h} className="nav-pill">
              {h.slice(1)}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#e6ffec',
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              color: '#2a9060',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#40c070',
                display: 'inline-block',
                boxShadow: '0 0 0 3px #c0ffda',
              }}
            />
            Open for work
          </div>
        </div>
      </nav>

     <section id="home" style={{ height: '100vh', position: 'relative', overflow: 'hidden', paddingTop: 72 }} >
       <div style={{ position: 'absolute', inset: 0 }}> 
         <KawaiiScene />
       </div> 
       <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '0 24px', pointerEvents: 'none', }} >
         <div style={{ pointerEvents: 'auto', animation: 'pop .7s cubic-bezier(.34,1.56,.64,1) both', }} >
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.75)', backdropFilter: 'blur(12px)', borderRadius: 999, padding: '8px 22px', fontSize: 13, fontWeight: 700, color: '#c040a0', border: '1.5px solid #ffd6f0', marginBottom: 28, }} >
             <span style={{ animation: 'float 2s infinite', display: 'inline-block' }}>🌸
             </span> Friendly MERN Freelancer <span style={{ animation: 'float 2s .4s infinite', display: 'inline-block' }}>🌸
             </span>
           </div>
           <h1 className="hero-title">Hi, I&apos;m Vivek!</h1>
           <p style={{ fontSize: 22, color: '#7a4090', maxWidth: 520, margin: '18px auto 36px', fontWeight: 600, textShadow: '0 2px 12px rgba(255,255,255,.8)', }} >
             I build dreamy web apps that feel as magical as this world 💫 </p>
           <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', pointerEvents: 'auto', }} > <a href="#projects" className="cute-btn"> ✨ See My Work </a>
             <a href="#contact" className="ghost-btn"> 💌 Say Hello </a> {/* ✅ Resume Download Button */}
             <a href="/resume.pdf" download className="cute-btn"> 📄 Download Resume </a>
           </div> 
         </div>
       </div>
       <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, color: '#d080c0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 20, }} >
         <span style={{ animation: 'float 1.5s infinite' }}>▾</span> click anywhere for sparkles!
       </div> 
     </section>
      <Section id="about" bg="linear-gradient(180deg,#fff8fd 0%,#fff0fa 100%)">
        <div
          className="about-grid"
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            alignItems: 'center',
          }}
        >
          <div>
            <div className="section-tag">✦ About Me</div>
            <h2 className="section-h2">
              I turn ideas into
              <br />
              <span style={{ color: '#ff7eb3' }}>living, breathing</span> apps
            </h2>

            <p
              style={{
                fontSize: 16,
                lineHeight: 1.9,
                color: '#7a4090',
                marginBottom: 28,
              }}
            >
              Hey! I&apos;m Vivek, a freelance MERN developer from Haldwani. I love crafting
              apps that are as delightful to use as they are powerful under the hood. My latest
              project <strong style={{ color: '#c040a0' }}>Aedifica.in</strong> launched recently
              and I&apos;m proud of every pixel! 🏠
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a href="#contact" className="cute-btn">
                💬 Let&apos;s Collab
              </a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { num: '2+', label: 'Years Coding', emoji: '📅', color: '#ffd6e7' },
              { num: '5+', label: 'Projects Shipped', emoji: '🚀', color: '#d6e7ff' },
              { num: '100%', label: 'Client Happiness', emoji: '💖', color: '#d6ffd6' },
              { num: '0', label: 'Missed Deadlines', emoji: '⏰', color: '#fff0d6' },
            ].map((s, i) => (
              <WobbleCard key={i} color={s.color} delay={i * 80}>
                <div style={{ fontSize: 36, marginBottom: 4 }}>{s.emoji}</div>
                <div
                  style={{
                    fontFamily: "'Pacifico',cursive",
                    fontSize: 34,
                    color: '#3a1a50',
                    lineHeight: 1,
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#9060b0',
                    marginTop: 4,
                    letterSpacing: '.05em',
                  }}
                >
                  {s.label}
                </div>
              </WobbleCard>
            ))}
          </div>
        </div>
      </Section>

      <Section id="skills" bg="#fff0fa">
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-tag">⚡ Skills</div>
          <h2 className="section-h2">My Magical Tech Stack</h2>
          <p style={{ color: '#9060b0', marginBottom: 48, fontSize: 16 }}>
            Tools I love and ship with confidence ✨
          </p>

          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}
          >
            {[
              'React',
              'Next.js',
              'Node.js',
              'Express',
              'MongoDB',
              'TypeScript',
              'Redis',
              'Docker',
              'AWS S3',
              'Tailwind CSS',
              'REST APIs',
              'Git',
              'JWT Auth',
              'Framer Motion',
              'Three.js',
            ].map((s, i) => (
              <SkillPill key={s} name={s} i={i} />
            ))}
          </div>

          <div
            className="skills-grid"
            style={{
              marginTop: 64,
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 24,
            }}
          >
            {[
              {
                icon: '🎨',
                title: 'Beautiful UIs',
                desc: 'Pixel-perfect interfaces that users actually enjoy.',
              },
              {
                icon: '⚡',
                title: 'Fast & Scalable',
                desc: 'Optimised APIs and databases that handle real traffic.',
              },
              {
                icon: '🔒',
                title: 'Secure by Default',
                desc: 'Auth, validation, and security baked in from day one.',
              },
            ].map((c, i) => (
              <WobbleCard key={i} color={['#ffd6e7', '#d6e7ff', '#d6ffd6'][i]} delay={i * 100}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>{c.icon}</div>
                <div
                  style={{
                    fontFamily: "'Pacifico',cursive",
                    fontSize: 20,
                    color: '#3a1a50',
                    marginBottom: 8,
                  }}
                >
                  {c.title}
                </div>
                <div style={{ fontSize: 14, color: '#8050a0', lineHeight: 1.7 }}>{c.desc}</div>
              </WobbleCard>
            ))}
          </div>
        </div>
      </Section>

      <Section id="projects" bg="linear-gradient(180deg,#fff8fd,#f8f0ff)">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-tag">🌟 Projects</div>
            <h2 className="section-h2">Things I&apos;ve Built with Love</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
              gap: 28,
            }}
          >
            {[
              {
                emoji: '🏠',
                title: 'Aedifica.in',
                tag: 'Real Estate · 2026',
                desc: 'Full-stack MERN property platform with live listings, smart filters, and owner dashboards. Delivered on time with lots of love.',
                cols: ['#ffd6e7', '#f0c0d8', '#e0a0c0'],
                tech: ['Next.js', 'Node', 'MongoDB', 'AWS'],
              },
              {
               emoji: '🧠',
title: 'DSA Visualizer',
tag: 'Algorithms · 2025',
desc: 'An interactive platform to visualize data structures and algorithms with real-time animations for graphs, trees, and sorting techniques.',
cols: ['#d6e7ff', '#c0d0f8', '#a0b8f0'],
tech: ['React', 'JavaScript', 'Canvas API', 'Node.js'],
              },
              {
                emoji: '📝',
                title: 'NotesApp',
                tag: 'Productivity · 2025',
                desc: 'Real-time collaborative notes with live sync, markdown support, and beautiful formatting.',
                cols: ['#d6ffd6', '#b8f0b8', '#98e098'],
                tech: ['Socket.io', 'MongoDB', 'TypeScript'],
              },
            ].map((p, pi) => (
              <div key={pi} className="project-card">
                <div
                  style={{
                    height: 180,
                    background: `linear-gradient(135deg,${p.cols[0]},${p.cols[1]},${p.cols[2]})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 72,
                  }}
                >
                  <span style={{ animation: 'float 3s infinite', display: 'inline-block' }}>
                    {p.emoji}
                  </span>
                </div>

                <div style={{ padding: 24 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Pacifico',cursive",
                        fontSize: 24,
                        color: '#3a1a50',
                      }}
                    >
                      {p.title}
                    </h3>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#9060b0',
                        background: '#f0e0f8',
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                    >
                      {p.tag}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: '#7a4090',
                      marginBottom: 16,
                    }}
                  >
                    {p.desc}
                  </p>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          background: '#fff0fa',
                          border: '1.5px solid #f0d0ee',
                          borderRadius: 999,
                          padding: '3px 10px',
                          color: '#c040a0',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="contact" bg="linear-gradient(180deg,#f8f0ff,#fff8fd)">
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-tag">💌 Contact</div>
          <h2 className="section-h2">
            Let&apos;s make something
            <br />
            <span style={{ color: '#ff7eb3' }}>wonderful</span> together!
          </h2>
          <p style={{ fontSize: 16, color: '#9060b0', marginBottom: 48 }}>
            I reply fast and always bring good vibes 🌸
          </p>

          {submitState.success ? (
            <div
              style={{
                background: 'linear-gradient(135deg,#d6ffd6,#c0f0c0)',
                borderRadius: 28,
                padding: 48,
                animation: 'pop .5s cubic-bezier(.34,1.56,.64,1)',
              }}
            >
              <div style={{ fontSize: 72, marginBottom: 16 }}>💖</div>
              <div
                style={{
                  fontFamily: "'Pacifico',cursive",
                  fontSize: 32,
                  color: '#2a7050',
                  marginBottom: 8,
                }}
              >
                Yay! Message sent!
              </div>
              <p style={{ color: '#4a9070', fontSize: 16 }}>
                I&apos;ll reply with a big smile soon! 🌟
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                background: 'rgba(255,255,255,.7)',
                backdropFilter: 'blur(16px)',
                borderRadius: 32,
                padding: 40,
                border: '2px solid #f0d0ee',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                textAlign: 'left',
              }}
            >
              <div
                className="contact-grid"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
              >
                <div>
                  <label
                    htmlFor="name"
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#c040a0',
                      letterSpacing: '.08em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    YOUR NAME
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="field"
                    type="text"
                    placeholder="Cute Name ✦"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#c040a0',
                      letterSpacing: '.08em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    YOUR EMAIL
                  </label>
                  <input
                    id="email"
                    name="email"
                    className="field"
                    type="email"
                    placeholder="hello@cute.dev"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#c040a0',
                    letterSpacing: '.08em',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  YOUR IDEA ✿
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="field"
                  rows={5}
                  placeholder="Tell me about your dream project! The more details, the better 💭"
                  value={formData.message}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                  style={{ resize: 'none' }}
                />
              </div>

              {submitState.error ? (
                <div
                  style={{
                    background: '#fff0f3',
                    color: '#c03a5a',
                    border: '1.5px solid #f4b7c5',
                    borderRadius: 16,
                    padding: '12px 16px',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {submitState.error}
                </div>
              ) : null}

              <button
                type="submit"
                className="cute-btn"
                disabled={submitState.loading}
                style={{
                  alignSelf: 'center',
                  fontSize: 16,
                  padding: '16px 48px',
                  justifyContent: 'center',
                  minWidth: 220,
                }}
              >
                {submitState.loading ? 'Sending... 💫' : 'Send my message 💌'}
              </button>
            </form>
          )}
        </div>
      </Section>

      <footer
        style={{
          textAlign: 'center',
          padding: '40px 24px',
          background: '#fff0fa',
          borderTop: '2px solid #f5d0ee',
        }}
      >
        <div
          style={{
            fontFamily: "'Pacifico',cursive",
            fontSize: 28,
            color: '#ff7eb3',
            marginBottom: 12,
          }}
        >
          Vivek ✿
        </div>

        <p style={{ fontSize: 13, color: '#b080c0', fontWeight: 600 }}>
          Crafted with ❤️ by Vivek Bisht · Freelance Full Stack Developer · © 2026
        </p>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 20 }}>
  {socialLinks.map((s) => (
    <a
      key={s.name}
      href={s.url}
      target="_blank"   // new tab me open hoga
      rel="noopener noreferrer"
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: '#c060b0',
        textDecoration: 'none',
        padding: '6px 18px',
        borderRadius: 999,
        border: '1.5px solid #f0c0de',
        transition: 'all .25s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = '#ffd6e7';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {s.name}
    </a>
  ))}
</div>
      </footer>
    </div>
  );
}
