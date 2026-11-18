import * as THREE from 'three';

// ───────── 설정 / 저장 ─────────
const CFG = { GROW: 10, PRICE: 100, HARVEST: 10, DAY: 150, SPEED: 5 };
const $ = (id) => document.getElementById(id);
const saved = JSON.parse(localStorage.getItem('cf-save') || '{}');
const S = { name: saved.name || '', coins: saved.coins || 0, built: !!saved.built };
const persist = () => localStorage.setItem('cf-save', JSON.stringify(S));
const hyp = Math.hypot;

// ───────── 렌더러 / 씬 ─────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
$('app').appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x9fdcff, 40, 95);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
const resize = () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
addEventListener('resize', resize); resize();

const hemi = new THREE.HemisphereLight(0xffffff, 0x6b8f5a, 0.8);
const sun = new THREE.DirectionalLight(0xfff2d6, 1.1);
sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, far: 120 });
scene.add(hemi, sun, sun.target);

// ───────── 헬퍼 ─────────
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o });
const lampMat = M(0xffd27a, { emissive: 0xffc04d, emissiveIntensity: 0 });
const mk = (geo, mat, x = 0, y = 0, z = 0, parent = scene) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true; parent.add(m); return m;
};
const tag = (root, data) => root.traverse((o) => { o.userData = data; });
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function label(text, w = 2.6) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(30,30,20,.55)'; g.beginPath(); g.roundRect?.(4, 6, 312, 52, 20); g.fill();
  g.font = 'bold 28px sans-serif'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText(text, 160, 43);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false }));
  s.scale.set(w, w * 0.2, 1); s.renderOrder = 10; return s;
}

// ───────── 1단계: 기본 맵 ─────────
const LAKE = [14, -6], FIELD = [-8, 2], SITE = [3, -6];
const AV = [[14, -6, 11], [-8, 2, 6.5], [-14, -9, 4.5], [-4, 11, 4.5], [3, -6, 4], [0, 4, 3]];
const free = (x, z) => !AV.some(([ax, az, r]) => hyp(x - ax, z - az) < r);

const ground = mk(new THREE.CylinderGeometry(24, 24, 0.5, 48), M(0x8fd16f), 0, -0.25, 0); tag(ground, { kind: 'ground' });
const lake = mk(new THREE.CylinderGeometry(8, 8, 0.1, 40), M(0x4fb3e8, { roughness: 0.2 }), LAKE[0], 0.0, LAKE[1]); tag(lake, { kind: 'lake' });

for (let i = 0; i < 14; i++) { // 먼 산
  const a = (i / 14) * 6.283, r = 40 + rnd() * 10, h = 12 + rnd() * 9;
  mk(new THREE.ConeGeometry(9 + rnd() * 5, h, 7), M(0x6f9a8d), Math.cos(a) * r, h / 2 - 1, Math.sin(a) * r);
}
for (let i = 0; i < 60; i++) { // 나무
  const a = rnd() * 6.283, r = 10 + rnd() * 12, x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (!free(x, z)) continue;
  const s = 0.8 + rnd() * 0.7, g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g);
  mk(new THREE.CylinderGeometry(0.2, 0.28, 1.2, 8), M(0x8a6240), 0, 0.6, 0, g);
  const col = [0x3f9e5a, 0x56b06a, 0x2f8a52][i % 3];
  mk(new THREE.ConeGeometry(1.2, 2.2, 8), M(col), 0, 2.0, 0, g); mk(new THREE.ConeGeometry(0.9, 1.8, 8), M(col), 0, 3.0, 0, g);
}
for (let i = 0; i < 45; i++) { // 꽃
  const a = rnd() * 6.283, r = rnd() * 21, x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (free(x, z)) mk(new THREE.SphereGeometry(0.12, 8, 6), M([0xffffff, 0xffd1e8, 0xfff07a][i % 3]), x, 0.12, z);
}
function house(x, z, rot, roof) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  mk(new THREE.BoxGeometry(3, 2, 3), M(0xfff1d6), 0, 1, 0, g);
  const r = mk(new THREE.ConeGeometry(2.7, 1.8, 4), M(roof), 0, 2.9, 0, g); r.rotation.y = Math.PI / 4;
  mk(new THREE.BoxGeometry(0.7, 1.2, 0.1), M(0x8a6240), 0, 0.6, 1.52, g);
  mk(new THREE.BoxGeometry(0.6, 0.6, 0.1), lampMat, 0.9, 1.3, 1.52, g);
}
house(-14, -9, 0.5, 0xc8553d); house(-4, 11, -0.4, 0x4a7fb5);

// ───────── 낮/밤 ─────────
const SKY = { day: new THREE.Color(0x9fdcff), dusk: new THREE.Color(0xff9a6b), night: new THREE.Color(0x141a45) };
const col = new THREE.Color(); let clock = CFG.DAY * 0.15;
function updateSky() {
  const t = (clock / CFG.DAY) % 1, k = Math.sin(t * 6.283);
  const d = THREE.MathUtils.clamp((k + 0.2) / 0.6, 0, 1), dusk = 1 - Math.abs(d * 2 - 1);
  col.copy(SKY.night).lerp(SKY.day, d).lerp(SKY.dusk, dusk * 0.55);
  scene.background = col; scene.fog.color.copy(col);
  sun.position.set(Math.cos(t * 6.283) * 30, Math.sin(t * 6.283) * 30 + 3, 12);
  sun.intensity = 1.15 * d; hemi.intensity = 0.3 + 0.55 * d;
  lampMat.emissiveIntensity = (1 - d) * 2.2;
  const h = Math.floor(6 + t * 24) % 24;
  $('clock').textContent = `${d > 0.35 ? '☀️ 낮' : '🌙 밤'} ${String(h).padStart(2, '0')}:00`;
}

// ───────── 캐릭터 / 닭 ─────────
const player = new THREE.Group(); scene.add(player);
mk(new THREE.CylinderGeometry(0.35, 0.42, 0.8, 16), M(0xf08a4b), 0, 0.5, 0, player);
mk(new THREE.SphereGeometry(0.38, 20, 16), M(0xffd9b3), 0, 1.2, 0, player);
mk(new THREE.SphereGeometry(0.42, 20, 10, 0, 6.283, 0, 1.3), M(0x4c9f70), 0, 1.25, 0, player);
mk(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 20), M(0x4c9f70), 0, 1.3, 0, player);
for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.05, 8, 6), M(0x222222), s * 0.14, 1.2, 0.34, player);
player.position.set(0, 0, 4); let rotY = 0, nameLabel = null;
function setName() {
  if (nameLabel) player.remove(nameLabel);
  nameLabel = label(S.name); nameLabel.position.y = 2.1; player.add(nameLabel);
}

const chick = new THREE.Group(); scene.add(chick); chick.position.set(1.5, 0, 5);
mk(new THREE.SphereGeometry(0.3, 14, 12), M(0xffffff), 0, 0.35, 0, chick);
mk(new THREE.SphereGeometry(0.18, 12, 10), M(0xffffff), 0, 0.68, 0.2, chick);
mk(new THREE.ConeGeometry(0.06, 0.15, 6), M(0xf5a623), 0, 0.66, 0.4, chick).rotation.x = Math.PI / 2;
mk(new THREE.BoxGeometry(0.06, 0.12, 0.14), M(0xe5483b), 0, 0.88, 0.2, chick);
mk(new THREE.SphereGeometry(0.14, 10, 8), M(0xf0f0f0), 0, 0.45, -0.3, chick);

// ───────── 3단계: 감자밭 ─────────
const plots = [];
for (let i = 0; i < 6; i++) {
  const x = -10.2 + (i % 3) * 2.2, z = 0.9 + Math.floor(i / 3) * 2.2;
  const soil = mk(new THREE.BoxGeometry(1.8, 0.3, 1.8), M(0x9a6a43), x, 0.15, z);
  const crop = new THREE.Group(); crop.position.set(x, 0.3, z); scene.add(crop);
  mk(new THREE.ConeGeometry(0.45, 0.8, 6), M(0x3fae4f), 0, 0.4, 0, crop);
  const pot = mk(new THREE.SphereGeometry(0.22, 12, 10), M(0xd9a85a), 0.35, 0.08, 0.3, crop);
  const p = { kind: 'plot', x, z, soil, crop, pot, state: 0, g: 0 }; tag(soil, p); plots.push(p); paint(p);
}
function paint(p) { // 0 빈 땅 · 1 심음 · 2 물 줌(성장 중) · 3 수확 가능
  p.crop.visible = p.state > 0; p.pot.visible = p.state === 3;
  p.soil.material.color.set(p.state >= 2 ? 0x6b4528 : 0x9a6a43);
  p.crop.scale.setScalar(p.state === 1 ? 0.45 : p.state === 2 ? 0.45 + 0.55 * (p.g / CFG.GROW) : 1);
}

// ───────── 4단계: 건설 부지 → 소양강 스카이워크 ─────────
const siteObj = { kind: 'site', x: SITE[0], z: SITE[1] }, swObj = { kind: 'skywalk', x: SITE[0], z: SITE[1] };
const site = new THREE.Group(); site.position.set(SITE[0], 0, SITE[1]); scene.add(site);
mk(new THREE.BoxGeometry(4.2, 0.06, 4.2), M(0xd9c79b), 0, 0.03, 0, site);
for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
  mk(new THREE.CylinderGeometry(0.08, 0.08, 1, 8), M(0x8a6240), sx * 1.9, 0.5, sz * 1.9, site);
  mk(new THREE.SphereGeometry(0.1, 8, 6), lampMat, sx * 1.9, 1.05, sz * 1.9, site);
}
for (const s of [-1, 1]) {
  mk(new THREE.BoxGeometry(3.8, 0.04, 0.04), M(0xe8d9b0), 0, 0.85, s * 1.9, site);
  mk(new THREE.BoxGeometry(0.04, 0.04, 3.8), M(0xe8d9b0), s * 1.9, 0.85, 0, site);
}
const sign = label(`🚧 건설 부지 · ${CFG.PRICE}🪙`, 3.4); sign.position.y = 1.9; site.add(sign);
tag(site, siteObj);

const sw = new THREE.Group(); sw.position.set(SITE[0], 0, SITE[1]); scene.add(sw);
const glass = M(0xbfeaff, { transparent: true, opacity: 0.6, roughness: 0.1 }), white = M(0xf4f4f0), steel = M(0x8b8f99);
mk(new THREE.BoxGeometry(4.2, 0.12, 4.2), M(0xd2cbbd), 0, 0.06, 0, sw);
mk(new THREE.BoxGeometry(10, 0.14, 1.8), glass, 7, 0.55, 0, sw);
mk(new THREE.CylinderGeometry(1.8, 1.8, 0.14, 32), glass, 13.2, 0.55, 0, sw);
for (let i = 0; i < 4; i++) for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8), steel, 4 + i * 2.8, 0, s * 0.8, sw);
for (const s of [-1, 1]) {
  mk(new THREE.BoxGeometry(10, 0.06, 0.06), white, 7, 1.05, s * 0.88, sw);
  for (let i = 0; i <= 4; i++) {
    mk(new THREE.BoxGeometry(0.06, 0.5, 0.06), white, 2 + i * 2.5, 0.8, s * 0.88, sw);
    mk(new THREE.SphereGeometry(0.12, 10, 8), lampMat, 2 + i * 2.5, 1.2, s * 0.88, sw);
  }
  mk(new THREE.CylinderGeometry(0.15, 0.15, 2.6, 8), M(0x8a6240), 1.5, 1.3, s * 1.2, sw);
}
mk(new THREE.BoxGeometry(0.25, 0.25, 2.9), M(0x8a6240), 1.5, 2.7, 0, sw);
const swLabel = label('소양강 스카이워크', 3.6); swLabel.position.set(1.5, 3.5, 0); sw.add(swLabel);
tag(sw, swObj);
let buildAnim = null;
function setBuilt(b, animate) { site.visible = !b; sw.visible = b; if (b && animate) buildAnim = 0; else sw.scale.setScalar(1); }

// ───────── 이동 / 충돌 ─────────
const inLake = (x, z) => hyp(x - LAKE[0], z - LAKE[1]) < 7.7;
const onBuilt = (x, z) => S.built && ((Math.abs(z - SITE[1]) < 0.85 && x > 2 && x < 15.2) || hyp(x - 16.2, z - SITE[1]) < 1.7);
const canWalk = (x, z) => hyp(x, z) < 22.5 && (!inLake(x, z) || onBuilt(x, z));
const keys = {}; let target = null, pending = null;
addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if (['Space', 'KeyE', 'Enter'].includes(e.code)) { const o = nearest(); if (o) interact(o); e.preventDefault(); }
});
addEventListener('keyup', (e) => { keys[e.code] = false; });

const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
const visible = (o) => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
renderer.domElement.addEventListener('pointerdown', (e) => {
  if (!S.name) return;
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ptr, camera);
  for (const h of ray.intersectObjects(scene.children, true)) {
    if (!visible(h.object)) continue;
    const d = h.object.userData; if (!d.kind) continue;
    if (d.kind === 'lake') return toast('물에는 들어갈 수 없어요 🌊');
    if (d.kind === 'ground') { if (canWalk(h.point.x, h.point.z)) { target = { x: h.point.x, z: h.point.z }; pending = null; } return; }
    if (d.kind === 'skywalk') { if (canWalk(h.point.x, h.point.z)) { target = { x: h.point.x, z: h.point.z }; } pending = null; return showInfo(); }
    target = { x: d.x, z: d.z }; pending = d; return; // plot / site
  }
});

// ───────── 상호작용 ─────────
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 1800); }
function nearest() {
  let best = null, bd = 1e9;
  for (const o of [...plots, S.built ? swObj : siteObj]) {
    const d = hyp(o.x - player.position.x, o.z - player.position.z);
    if (d < (o.kind === 'plot' ? 2.1 : 3.2) && d < bd) { best = o; bd = d; }
  }
  return best;
}
function interact(o) {
  if (o.kind === 'plot') {
    if (o.state === 0) { o.state = 1; toast('🥔 씨감자를 심었어요'); }
    else if (o.state === 1) { o.state = 2; o.g = 0; toast('💧 물을 줬어요. 잘 자라는 중!'); }
    else if (o.state === 2) toast(`⏳ 아직 자라는 중 (${Math.ceil(CFG.GROW - o.g)}초)`);
    else { o.state = 0; S.coins += CFG.HARVEST; toast(`🧺 수확! +${CFG.HARVEST}🪙`); persist(); }
    paint(o);
  } else if (o.kind === 'site') {
    if (S.coins < CFG.PRICE) return toast(`재화가 부족해요 (${S.coins}/${CFG.PRICE}🪙)`);
    S.coins -= CFG.PRICE; S.built = true; persist(); setBuilt(true, true);
    toast('🎉 소양강 스카이워크 완공! 클릭해서 소개를 읽어보세요');
  } else showInfo();
  refreshHud();
}
function showInfo() {
  $('infoTitle').textContent = '🌉 소양강 스카이워크';
  $('infoBody').innerHTML = '강원특별자치도 춘천시 근화동, 소양강 위로 뻗은 길이 약 174m의 보행 시설이에요. 바닥 일부가 투명한 강화유리여서 강 위를 걷는 듯한 아찔함을 느낄 수 있고, 가까이에 소양강처녀상이 있어 함께 둘러보기 좋아요. 2016년에 개장했어요.<br><br><small>※ 프로토타입에 적은 소개예요. 운영시간·요금 등은 바뀔 수 있으니 방문 전 춘천시 관광 공식 안내에서 확인하세요.</small>';
  $('info').classList.remove('hidden');
}
$('infoClose').onclick = () => $('info').classList.add('hidden');
$('statusBtn').onclick = () => $('statusPanel').classList.toggle('hidden');
$('act').onclick = () => { const o = nearest(); if (o) interact(o); };

function refreshHud() {
  $('pname').textContent = S.name; $('coins').textContent = S.coins;
  $('goal').textContent = S.built ? '🌉 스카이워크를 클릭해 관광지 소개를 읽어보세요'
    : S.coins >= CFG.PRICE ? '🚧 건설 부지로 가서 스카이워크를 지어요!' : `🥔 감자로 재화를 모아요 (${S.coins}/${CFG.PRICE}🪙)`;
}

// ───────── 시작 ─────────
function start() { $('welcome').classList.add('hidden'); setName(); refreshHud(); }
$('startBtn').onclick = () => {
  const v = $('nameIn').value.trim(); if (!v) return toast('이름을 입력해 주세요');
  S.name = v; persist(); start();
};
$('nameIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('startBtn').click(); });
setBuilt(S.built, false);
if (S.name) start();

// ───────── 루프 ─────────
const lerpAngle = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
const camTarget = new THREE.Vector3(); let last = performance.now(), actLabel = '';
renderer.setAnimationLoop((now) => {
  const dt = Math.min((now - last) / 1000, 0.05); last = now; clock += dt; updateSky();
  for (const p of plots) if (p.state === 2) { p.g += dt; if (p.g >= CFG.GROW) { p.state = 3; toast('🥔 감자가 다 자랐어요!'); } paint(p); }
  if (buildAnim !== null) {
    buildAnim = Math.min(1, buildAnim + dt / 1.6); const e = 1 - (1 - buildAnim) ** 3;
    sw.scale.set(1, Math.max(0.01, e), 1); if (buildAnim >= 1) { buildAnim = null; sw.scale.setScalar(1); }
  }

  let vx = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
  let vz = (keys.ArrowDown || keys.KeyS ? 1 : 0) - (keys.ArrowUp || keys.KeyW ? 1 : 0);
  const px = player.position.x, pz = player.position.z;
  if (vx || vz) { target = null; pending = null; }
  else if (target) {
    const dx = target.x - px, dz = target.z - pz, d = hyp(dx, dz);
    if (d < 0.15 || (pending && d < 0.9)) { target = null; if (pending) { interact(pending); pending = null; } }
    else { vx = dx / d; vz = dz / d; }
  }
  const moving = vx || vz;
  if (moving) {
    const l = hyp(vx, vz); vx /= l; vz /= l;
    const nx = px + vx * CFG.SPEED * dt, nz = pz + vz * CFG.SPEED * dt;
    if (canWalk(nx, pz)) player.position.x = nx;
    if (canWalk(player.position.x, nz)) player.position.z = nz;
    rotY = lerpAngle(rotY, Math.atan2(vx, vz), 0.25); player.rotation.y = rotY;
  }
  const gy = inLake(player.position.x, player.position.z) && onBuilt(player.position.x, player.position.z) ? 0.62 : 0;
  player.position.y = gy + (moving ? Math.abs(Math.sin(now / 90)) * 0.1 : 0);

  const bx = player.position.x - Math.sin(rotY) * 1.4, bz = player.position.z - Math.cos(rotY) * 1.4;
  const cd = hyp(bx - chick.position.x, bz - chick.position.z);
  if (cd > 0.25) {
    const k = Math.min(1, 3.2 * dt); chick.position.x += (bx - chick.position.x) * k; chick.position.z += (bz - chick.position.z) * k;
    chick.rotation.y = Math.atan2(bx - chick.position.x, bz - chick.position.z); chick.position.y = gy + Math.abs(Math.sin(now / 110)) * 0.12;
  } else chick.position.y = gy;

  const zoom = camera.aspect < 1 ? 1.35 : 1;
  camTarget.set(player.position.x, 13 * zoom, player.position.z + 12 * zoom);
  camera.position.lerp(camTarget, 0.08); camera.lookAt(player.position.x, 0.8, player.position.z);
  sun.target.position.copy(player.position);

  const o = S.name ? nearest() : null, btn = $('act');
  const txt = !o ? '' : o.kind === 'plot' ? ['🥔 씨감자 심기', '💧 물 주기', '⏳ 자라는 중…', '🧺 수확하기'][o.state]
    : o.kind === 'site' ? `🏗️ 건설하기 (${CFG.PRICE}🪙)` : 'ℹ️ 관광지 소개';
  if (txt !== actLabel) { actLabel = txt; btn.textContent = txt; btn.classList.toggle('hidden', !txt); }
  btn.disabled = !!o && o.kind === 'plot' && o.state === 2;
  renderer.render(scene, camera);
});
