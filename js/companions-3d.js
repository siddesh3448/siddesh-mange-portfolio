import * as THREE from "./vendor/three.module.js";

const MODEL_SIZE = { width: 70, height: 70 };
const MOBILE_MODEL_SIZE = { width: 20, height: 24 };
const COMPANION_SPECS = [
  { name: "Spark scout", kind: "electric", color: "#54b9b0", accent: "#c7ff4d", blush: "#f2bf68", speed: 38 },
  { name: "Emberling", kind: "fire", color: "#ed8b59", accent: "#ffc75e", blush: "#e97d72", speed: 42 },
  { name: "Mossback", kind: "grass", color: "#77bca0", accent: "#d6ad57", blush: "#e98d85", speed: 34 },
  { name: "Stargazer skeleton", kind: "skeleton", color: "#e9e5dc", accent: "#c7ff4d", blush: "#e9e5dc", speed: 37 },
  { name: "Moon ghost", kind: "ghost", color: "#c8e4e4", accent: "#93d5df", blush: "#ef9b9d", speed: 39 },
  { name: "Pocket robot", kind: "robot", color: "#aabbbd", accent: "#c7ff4d", blush: "#aabbbd", speed: 44 },
  { name: "Orbit slime", kind: "slime", color: "#9b91e9", accent: "#c7ff4d", blush: "#c1a6ff", speed: 30 },
  { name: "Little comet", kind: "cosmic", color: "#82cbd1", accent: "#c7ff4d", blush: "#e4a4bc", speed: 41 },
];

const geometry = {
  sphere: new THREE.SphereGeometry(1, 20, 14),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 12),
  cone: new THREE.ConeGeometry(1, 1, 12),
  box: new THREE.BoxGeometry(1, 1, 1),
  torus: new THREE.TorusGeometry(1, 0.12, 6, 24),
};
const materials = new Map();

function material(color, options = {}) {
  const key = `${color}:${options.metalness ?? 0}:${options.roughness ?? 0.48}:${options.emissive ?? ""}`;
  if (!materials.has(key)) {
    materials.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness: options.roughness ?? 0.48,
        metalness: options.metalness ?? 0,
        emissive: options.emissive ?? "#000000",
        emissiveIntensity: options.emissiveIntensity ?? 0,
      }),
    );
  }
  return materials.get(key);
}

function addMesh(parent, shape, mat, position, scale, rotation) {
  const mesh = new THREE.Mesh(shape, mat);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  if (rotation) {
    mesh.rotation.set(...rotation);
  }
  parent.add(mesh);
  return mesh;
}

function sphere(parent, mat, position, scale) {
  return addMesh(parent, geometry.sphere, mat, position, scale);
}

function cylinder(parent, mat, position, scale, rotation = [0, 0, 0]) {
  return addMesh(parent, geometry.cylinder, mat, position, scale, rotation);
}

function cone(parent, mat, position, scale, rotation = [0, 0, 0]) {
  return addMesh(parent, geometry.cone, mat, position, scale, rotation);
}

function makeLimb(parent, mat, x, y, z, length, radius, foot = true) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, z);
  parent.add(pivot);
  cylinder(
    pivot,
    mat,
    [0, -length / 2, 0],
    [radius * 0.78, length, radius * 0.78],
  );
  sphere(pivot, mat, [0, 0, 0], [radius, radius, radius]);
  sphere(pivot, mat, [0, -length, 0], [radius, radius, radius]);
  if (foot) {
    sphere(pivot, mat, [0, -length, 2], [radius * 1.3, radius * 0.65, radius * 1.8]);
  }
  return pivot;
}

function makeArm(parent, mat, x, y, length = 12, radius = 2.5) {
  const pivot = makeLimb(parent, mat, x, y, 2, length, radius, false);
  sphere(pivot, mat, [0, -length, 1.5], [radius * 0.82, radius * 0.82, radius * 0.82]);
  return pivot;
}

function face(head, spec, y, z, eyeScale = 1) {
  const dark = material("#292b31", { roughness: 0.28 });
  const white = material("#ffffff", { roughness: 0.2 });
  const eyes = new THREE.Group();
  head.add(eyes);
  sphere(eyes, dark, [-4.7, y, z], [1.55 * eyeScale, 2.3 * eyeScale, 1.15]);
  sphere(eyes, dark, [4.7, y, z], [1.55 * eyeScale, 2.3 * eyeScale, 1.15]);
  sphere(eyes, white, [-5.2, y + 0.85, z + 0.9], [0.48, 0.58, 0.35]);
  sphere(eyes, white, [4.2, y + 0.85, z + 0.9], [0.48, 0.58, 0.35]);
  sphere(head, material(spec.blush, { roughness: 0.55 }), [-8, y - 4.1, z - 0.1], [2, 1.55, 0.9]);
  sphere(head, material(spec.blush, { roughness: 0.55 }), [8, y - 4.1, z - 0.1], [2, 1.55, 0.9]);
  sphere(head, dark, [0, y - 5.8, z + 0.6], [1.5, 0.72, 0.85]);
  return eyes;
}

function createHumanoid(spec, root, colors) {
  const bodyRig = new THREE.Group();
  root.add(bodyRig);
  sphere(bodyRig, colors.body, [0, 20, 0], [11, 14, 9]);
  const head = new THREE.Group();
  head.position.set(0, 39, 0);
  bodyRig.add(head);
  sphere(head, colors.body, [0, 0, 0], [14, 13, 12]);
  const eyes = face(head, spec, -1, 10.5);
  const arms = [
    makeArm(bodyRig, colors.body, -9, 28, 12, 2.5),
    makeArm(bodyRig, colors.body, 9, 28, 12, 2.5),
  ];
  const legs = [
    makeLimb(bodyRig, colors.accent, -5.7, 9, 0, 10, 3, true),
    makeLimb(bodyRig, colors.accent, 5.7, 9, 0, 10, 3, true),
  ];
  return { bodyRig, head, eyes, arms, legs };
}

function createElectric(root, spec) {
  const parts = createHumanoid(spec, root, {
    body: material(spec.color, { roughness: 0.36 }),
    accent: material(spec.accent, { roughness: 0.38 }),
  });
  const antenna = new THREE.Group();
  antenna.position.set(0, 49, -1);
  root.add(antenna);
  cylinder(antenna, material(spec.accent), [-4, 4, 0], [1.2, 7, 1.2], [0, 0, -0.42]);
  sphere(antenna, material(spec.accent), [-5.5, 8, 0], [2, 2, 2]);
  sphere(antenna, material("#9be3d7"), [4, 1, -1], [4.2, 2.8, 3.2]);
  const boltShape = new THREE.Shape();
  boltShape.moveTo(-4, 8);
  boltShape.lineTo(3, 8);
  boltShape.lineTo(-1, 1);
  boltShape.lineTo(5, 1);
  boltShape.lineTo(-5, -10);
  boltShape.lineTo(-2, -2);
  boltShape.lineTo(-7, -2);
  boltShape.closePath();
  const bolt = new THREE.Mesh(
    new THREE.ExtrudeGeometry(boltShape, { depth: 2.2, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.7, bevelThickness: 0.55 }),
    material(spec.color, { roughness: 0.3, emissive: spec.color, emissiveIntensity: 0.12 }),
  );
  bolt.position.set(14, 19, -7);
  bolt.rotation.z = -0.28;
  root.add(bolt);
  return parts;
}

function createFire(root, spec) {
  const parts = createHumanoid(spec, root, {
    body: material(spec.color, { roughness: 0.42 }),
    accent: material("#f4c7a0", { roughness: 0.5 }),
  });
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(7, 15, -7),
    new THREE.Vector3(16, 10, -8),
    new THREE.Vector3(20, 16, -8),
    new THREE.Vector3(22, 24, -7),
  ]);
  root.add(new THREE.Mesh(
    new THREE.TubeGeometry(tailCurve, 14, 1.9, 7, false),
    material(spec.color, { roughness: 0.45 }),
  ));
  const flame = new THREE.Group();
  flame.position.set(22, 25, -7);
  root.add(flame);
  cone(flame, material("#ff844f", { emissive: "#ff4e31", emissiveIntensity: 0.7, roughness: 0.34 }), [0, 4, 0], [4.2, 12, 3.8]);
  cone(flame, material("#ffd365", { emissive: "#ffae35", emissiveIntensity: 1.2, roughness: 0.32 }), [0, 2.4, 1.1], [2.4, 7.5, 2.2]);
  sphere(
    flame,
    new THREE.MeshBasicMaterial({ color: "#ff8b38", transparent: true, opacity: 0.2, depthWrite: false }),
    [0, 4, -0.5],
    [5.4, 8, 4.8],
  );
  return { ...parts, flame };
}

function createGrass(root, spec) {
  const bodyMaterial = material(spec.color, { roughness: 0.56 });
  const leafMaterial = material("#68a968", { roughness: 0.55 });
  const body = new THREE.Group();
  root.add(body);
  sphere(body, bodyMaterial, [0, 16, -1], [14, 12, 20]);
  const head = new THREE.Group();
  head.position.set(0, 25, 13);
  body.add(head);
  sphere(head, bodyMaterial, [0, 0, 0], [12, 11, 10]);
  const eyes = face(head, spec, -1, 8.2, 0.88);
  const legs = [];
  [-1, 1].forEach((side) => {
    [-1, 1].forEach((front) => {
      legs.push(makeLimb(body, material(front > 0 ? "#a1ca82" : "#7ea96f"), side * 9, 9, front * 11, 9, 3.4, true));
    });
  });
  sphere(body, material(spec.accent, { roughness: 0.4 }), [0, 33, -6], [11, 10, 12]);
  const sprout = new THREE.Group();
  sprout.position.set(0, 41, -6);
  body.add(sprout);
  cylinder(sprout, material("#5d985d"), [0, 5, 0], [1.35, 11, 1.35], [0, 0, 0.1]);
  [-1, 0, 1].forEach((side) => {
    const leaf = sphere(sprout, leafMaterial, [side * 5, 10 + (side === 0 ? 2 : 0), 0], [3.2, 7.8, 1.8]);
    leaf.rotation.z = side * -0.52;
  });
  return { bodyRig: body, head, eyes, arms: [], legs, sprout };
}

function createSkeleton(root, spec) {
  const bone = material("#e9e5dc", { roughness: 0.58 });
  const boneShade = material("#a9a59a", { roughness: 0.6 });
  const dark = material("#25252a", { roughness: 0.35 });
  const bodyRig = new THREE.Group();
  root.add(bodyRig);
  const head = new THREE.Group();
  head.position.set(0, 52, 0);
  bodyRig.add(head);
  const eyes = new THREE.Group();
  head.add(eyes);
  sphere(head, bone, [0, 0, 0], [12, 11, 10]);
  sphere(head, bone, [0, -6, 2], [8.5, 4.2, 8]);
  sphere(eyes, dark, [-4.3, -0.4, 8.1], [3.2, 4.1, 2.5]);
  sphere(eyes, dark, [4.3, -0.4, 8.1], [3.2, 4.1, 2.5]);
  sphere(head, boneShade, [0, -4, 9], [1.6, 1.4, 1]);
  const ribs = new THREE.Group();
  bodyRig.add(ribs);
  cylinder(ribs, bone, [0, 33, 0], [1.6, 18, 1.6]);
  [28, 34, 40].forEach((height) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7, height + 2, 5),
      new THREE.Vector3(-7, height - 1, 6),
      new THREE.Vector3(0, height - 3, 7),
      new THREE.Vector3(7, height - 1, 6),
      new THREE.Vector3(7, height + 2, 5),
    ]);
    ribs.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.9, 6, false), bone));
  });
  sphere(bodyRig, bone, [0, 20, 0], [8.2, 4, 6]);
  const arms = [
    makeArm(bodyRig, bone, -8, 42, 14, 1.8),
    makeArm(bodyRig, bone, 8, 42, 14, 1.8),
  ];
  arms.forEach((arm, index) => {
    const side = index === 0 ? -1 : 1;
    [-1, 0, 1].forEach((offset) => {
      cylinder(arm, bone, [side * (1.8 + Math.abs(offset)), -13.8, 1.5], [0.65, 3, 0.65], [0, 0, offset * 0.12]);
    });
  });
  const legs = [
    makeLimb(bodyRig, bone, -4.5, 19, 0, 13, 2.1, true),
    makeLimb(bodyRig, bone, 4.5, 19, 0, 13, 2.1, true),
  ];
  return { bodyRig, head, eyes, arms, legs };
}

function createGhost(root, spec) {
  const bodyMaterial = material(spec.color, { roughness: 0.3, metalness: 0.08 });
  const bodyRig = new THREE.Group();
  root.add(bodyRig);
  sphere(bodyRig, bodyMaterial, [0, 31, 0], [17, 23, 12]);
  sphere(bodyRig, bodyMaterial, [0, 17, 0], [15, 11, 11]);
  const head = new THREE.Group();
  bodyRig.add(head);
  const eyes = face(head, spec, 33, 10.4, 1.1);
  const arms = [
    makeArm(bodyRig, bodyMaterial, -14, 32, 11, 2.4),
    makeArm(bodyRig, bodyMaterial, 14, 32, 11, 2.4),
  ];
  const legs = [
    makeLimb(bodyRig, bodyMaterial, -7, 12, 0, 8, 3.2, false),
    makeLimb(bodyRig, bodyMaterial, 7, 12, 0, 8, 3.2, false),
  ];
  return { bodyRig, head, eyes, arms, legs };
}

function createRobot(root, spec) {
  const shell = material(spec.color, { metalness: 0.48, roughness: 0.32 });
  const bodyRig = new THREE.Group();
  root.add(bodyRig);
  const body = new THREE.Group();
  bodyRig.add(body);
  sphere(body, shell, [0, 22, 0], [12, 14, 10]);
  const head = new THREE.Group();
  head.position.set(0, 44, 0);
  bodyRig.add(head);
  sphere(head, shell, [0, 0, 0], [13, 11, 11]);
  const screen = material("#1e3033", { emissive: "#0a272a", emissiveIntensity: 0.4, roughness: 0.24 });
  addMesh(head, geometry.box, screen, [0, -0.5, 9], [14, 7, 2.1]);
  const eyeMat = material(spec.accent, { emissive: spec.accent, emissiveIntensity: 0.75, roughness: 0.25 });
  const eyes = new THREE.Group();
  head.add(eyes);
  sphere(eyes, eyeMat, [-4, 0, 10.4], [1.45, 1.7, 0.8]);
  sphere(eyes, eyeMat, [4, 0, 10.4], [1.45, 1.7, 0.8]);
  cylinder(head, eyeMat, [0, 12, 0], [0.8, 4, 0.8]);
  sphere(head, eyeMat, [0, 14, 0], [1.8, 1.8, 1.8]);
  const arms = [
    makeArm(bodyRig, shell, -10, 30, 13, 2.7),
    makeArm(bodyRig, shell, 10, 30, 13, 2.7),
  ];
  const legs = [
    makeLimb(bodyRig, shell, -5.5, 10, 0, 10, 3, true),
    makeLimb(bodyRig, shell, 5.5, 10, 0, 10, 3, true),
  ];
  sphere(body, eyeMat, [0, 21, 10], [2.6, 2.6, 1]);
  return { bodyRig, head, eyes, arms, legs };
}

function createSlime(root, spec) {
  const bodyMaterial = material(spec.color, { roughness: 0.28, metalness: 0.08 });
  const bodyRig = new THREE.Group();
  root.add(bodyRig);
  const body = sphere(bodyRig, bodyMaterial, [0, 23, 0], [20, 21, 15]);
  const head = new THREE.Group();
  bodyRig.add(head);
  const dark = material("#2b2940", { roughness: 0.28 });
  const eyes = new THREE.Group();
  head.add(eyes);
  sphere(eyes, dark, [-5, 25, 13], [1.8, 2.2, 1.1]);
  sphere(eyes, dark, [5, 25, 13], [1.8, 2.2, 1.1]);
  sphere(eyes, material("#f6e9ff"), [-5.5, 26, 14], [0.55, 0.65, 0.38]);
  sphere(eyes, material("#f6e9ff"), [4.5, 26, 14], [0.55, 0.65, 0.38]);
  sphere(head, material(spec.blush), [-10, 20, 11], [2, 1.2, 0.8]);
  sphere(head, material(spec.blush), [10, 20, 11], [2, 1.2, 0.8]);
  sphere(head, dark, [0, 17, 14], [2.2, 0.7, 0.6]);
  const legs = [
    makeLimb(bodyRig, bodyMaterial, -9, 6, -2, 5, 3, false),
    makeLimb(bodyRig, bodyMaterial, 9, 6, -2, 5, 3, false),
  ];
  return { bodyRig, head, eyes, arms: [], legs, squashMesh: body };
}

function createCosmic(root, spec) {
  const bodyMaterial = material(spec.color, { roughness: 0.33, metalness: 0.1 });
  const bodyRig = new THREE.Group();
  root.add(bodyRig);
  sphere(bodyRig, bodyMaterial, [0, 25, 0], [14, 17, 11]);
  const head = new THREE.Group();
  head.position.set(0, 47, 0);
  bodyRig.add(head);
  sphere(head, bodyMaterial, [0, 0, 0], [12, 11, 10]);
  const eyes = face(head, spec, -1, 8.5, 0.9);
  const arms = [
    makeArm(bodyRig, bodyMaterial, -11, 31, 11, 2.3),
    makeArm(bodyRig, bodyMaterial, 11, 31, 11, 2.3),
  ];
  const legs = [
    makeLimb(bodyRig, bodyMaterial, -5, 11, 0, 10, 2.7, true),
    makeLimb(bodyRig, bodyMaterial, 5, 11, 0, 10, 2.7, true),
  ];
  const halo = new THREE.Mesh(
    geometry.torus,
    material("#b9a3ff", { emissive: "#8667ff", emissiveIntensity: 0.55, metalness: 0.3 }),
  );
  halo.scale.set(1.4, 0.35, 1);
  halo.position.set(0, 28, -3);
  halo.rotation.x = 0.34;
  root.add(halo);
  return { bodyRig, head, eyes, arms, legs, halo };
}

function makeCharacter(spec, index, scene) {
  const root = new THREE.Group();
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1, 24),
    new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.24, depthWrite: false }),
  );
  shadow.scale.set(20, 4.6, 1);
  shadow.position.set(0, 0.15, -1);
  root.add(shadow);
  let parts;
  switch (spec.kind) {
    case "electric":
      parts = createElectric(root, spec);
      break;
    case "fire":
      parts = createFire(root, spec);
      break;
    case "grass":
      parts = createGrass(root, spec);
      break;
    case "skeleton":
      parts = createSkeleton(root, spec);
      break;
    case "ghost":
      parts = createGhost(root, spec);
      break;
    case "robot":
      parts = createRobot(root, spec);
      break;
    case "slime":
      parts = createSlime(root, spec);
      break;
    default:
      parts = createCosmic(root, spec);
      break;
  }
  scene.add(root);
  const control = document.createElement("button");
  control.type = "button";
  control.className = "companion-control";
  control.textContent = `${spec.name}: drag to explore; activate to greet`;
  control.setAttribute("aria-label", `${spec.name}. Drag its 3D character to explore. Activate to greet.`);
  const character = {
    spec,
    index,
    root,
    parts,
    shadow,
    control,
    x: Number.NaN,
    y: Number.NaN,
    facing: 0,
    targetFacing: 0,
    path: [],
    walking: false,
    gait: Math.random() * Math.PI * 2,
    blinkAt: performance.now() + 2200 + Math.random() * 5000,
    blinkUntil: 0,
    waveUntil: 0,
    jumpUntil: 0,
    jumpAt: performance.now() + 8000 + Math.random() * 14000,
    moodUntil: 0,
    nextWaveAt: 0,
    focused: false,
    dragged: false,
  };
  return character;
}

function react(character, action) {
  const now = performance.now();
  if (action === "wave") {
    character.waveUntil = now + 1050;
    character.moodUntil = now + 1200;
  } else {
    character.jumpUntil = now + 650;
    character.moodUntil = now + 900;
  }
}

function getPageHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
  );
}

function getObstacles() {
  return Array.from(
    document.querySelectorAll(
      "h1, h2, h3, h4, p, a, button, input, textarea, select, .project-preview, figure, .program-list li, .certificate-list li",
    ),
  )
    .filter((element) => !element.closest(".companion-field"))
    .map((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        left: bounds.left + window.scrollX - 5,
        right: bounds.right + window.scrollX + 5,
        top: bounds.top + window.scrollY - 5,
        bottom: bounds.bottom + window.scrollY + 5,
      };
    })
    .filter((bounds) => bounds.right > 0 && bounds.left < document.documentElement.clientWidth);
}

function getModelSize() {
  return window.innerWidth < 680 ? MOBILE_MODEL_SIZE : MODEL_SIZE;
}

function rectangleIsClear(x, y, obstacles, size = getModelSize()) {
  return !obstacles.some(
    (obstacle) =>
      x < obstacle.right &&
      x + size.width > obstacle.left &&
      y < obstacle.bottom &&
      y + size.height > obstacle.top,
  );
}

function pathIsClear(start, end, obstacles, size) {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const steps = Math.ceil(distance / 8);
  for (let step = 1; step < steps; step += 1) {
    const progress = step / steps;
    if (!rectangleIsClear(
      start.x + (end.x - start.x) * progress,
      start.y + (end.y - start.y) * progress,
      obstacles,
      size,
    )) {
      return false;
    }
  }
  return true;
}

function buildMovementMap(characters) {
  const width = document.documentElement.clientWidth;
  const pageHeight = getPageHeight();
  const mobile = width < 680;
  const size = mobile ? MOBILE_MODEL_SIZE : MODEL_SIZE;
  const stepY = mobile ? 28 : 88;
  const xPositions = [];
  if (mobile) {
    for (let x = -5; x + size.width < width - 4; x += size.width + 4) {
      xPositions.push(x);
    }
    if (xPositions.length === 0 || xPositions[xPositions.length - 1] < width - size.width + 5) {
      xPositions.push(Math.max(-5, width - size.width + 5));
    }
  }
  if (!mobile) {
    for (let x = 8; x + size.width < width; x += 72) {
      xPositions.push(x);
    }
    if (xPositions.length === 0 || xPositions[xPositions.length - 1] < width - size.width - 8) {
      xPositions.push(Math.max(0, width - size.width - 8));
    }
  }
  const header = document.querySelector(".site-header");
  const firstY = Math.max(
    108,
    (header?.getBoundingClientRect().bottom ?? 88) + window.scrollY + 12,
  );
  const obstacles = getObstacles();
  const sections = ["hero", "work", "experience", "about", "education", "contact"]
    .map((id) => document.getElementById(id))
    .filter((section) => section instanceof HTMLElement)
    .map((section) => {
      const bounds = section.getBoundingClientRect();
      return { top: bounds.top + window.scrollY, bottom: bounds.top + window.scrollY + bounds.height };
    });
  const nodes = [];
  const grid = [];
  for (let y = firstY, row = 0; y + size.height < pageHeight - 8; y += stepY, row += 1) {
    grid[row] = [];
    xPositions.forEach((x, column) => {
      if (!rectangleIsClear(x, y, obstacles, size)) {
        return;
      }
      const section = sections.findIndex(({ top, bottom }) => y + size.height / 2 >= top && y < bottom);
      const node = { id: nodes.length, x, y, row, column, section, neighbors: [] };
      nodes.push(node);
      grid[row][column] = node;
    });
  }
  nodes.forEach((node) => {
    const offsets = mobile
      ? [-1, 0, 1].flatMap((row) => [-1, 0, 1]
        .filter((column) => row !== 0 || column !== 0)
        .map((column) => [row, column]))
      : [[0, -1], [0, 1], [-1, 0], [1, 0]];
    offsets.forEach(([rowOffset, columnOffset]) => {
      const neighbor = grid[node.row + rowOffset]?.[node.column + columnOffset];
      if (!neighbor) {
        return;
      }
      if (pathIsClear(node, neighbor, obstacles, size)) {
        node.neighbors.push(neighbor.id);
      }
    });
  });

  const occupied = [];
  characters.forEach((character, index) => {
    const nearest = nodes
      .filter((node) => !occupied.some((other) => Math.hypot(node.x - other.x, node.y - other.y) < size.width))
      .sort((a, b) => Math.abs(a.x - character.x) + Math.abs(a.y - character.y) - Math.abs(b.x - character.x) - Math.abs(b.y - character.y))[0];
    let node = nearest;
    if (!node || !Number.isFinite(character.x)) {
      const section = sections[index % sections.length];
      const targetY = section ? section.top + Math.min((section.bottom - section.top) * 0.35, 220) : firstY;
      const preferRight = index % 2 === 1;
      node = nodes
        .filter((candidate) => !occupied.some((other) => Math.hypot(candidate.x - other.x, candidate.y - other.y) < size.width))
        .sort((a, b) => {
          const aSide = preferRight ? width - a.x : a.x;
          const bSide = preferRight ? width - b.x : b.x;
          return Math.abs(a.y - targetY) + aSide * 0.18 - Math.abs(b.y - targetY) - bSide * 0.18;
        })[0] ?? nodes[index % Math.max(1, nodes.length)];
    }
    if (node) {
      character.x = node.x;
      character.y = node.y;
      character.node = node;
      occupied.push(node);
    }
  });
  return nodes;
}

function findPath(nodes, start, character) {
  if (!start || start.neighbors.length === 0) {
    return [];
  }
  const parents = new Map([[start.id, null]]);
  const queue = [start.id];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const node = nodes[queue[cursor]];
    node.neighbors.forEach((id) => {
      if (!parents.has(id)) {
        parents.set(id, node.id);
        queue.push(id);
      }
    });
  }
  const candidates = queue
    .map((id) => nodes[id])
    .filter((node) => node.section !== start.section && node.id !== start.id);
  if (!candidates.length) {
    return [];
  }
  const destination = candidates[Math.floor(Math.random() * candidates.length)];
  const path = [];
  let id = destination.id;
  while (id !== null) {
    path.unshift(nodes[id]);
    id = parents.get(id);
  }
  character.node = start;
  return path.slice(1);
}

function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
    stencil: false,
    depth: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = false;
  return renderer;
}

export function initializeCompanions3D(reducedMotion) {
  const canvas = document.querySelector(".companion-canvas");
  const controls = document.querySelector(".companion-controls");
  const field = document.querySelector(".companion-field");
  if (!(canvas instanceof HTMLCanvasElement) || !controls || !field) {
    return;
  }

  const status = document.createElement("p");
  status.className = "visually-hidden companion-status";
  status.setAttribute("role", "status");
  field.append(status);

  let renderer;
  try {
    renderer = createRenderer(canvas);
  } catch (error) {
    status.textContent = "3D companions are unavailable because WebGL could not start.";
    console.error("Could not initialize the 3D companion renderer.", error);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
  camera.position.set(0, 0, 140);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight("#e8f1ff", "#191627", 2.05));
  const keyLight = new THREE.DirectionalLight("#fff4d7", 2.7);
  keyLight.position.set(-55, 90, 95);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight("#a8c5ff", 1.2);
  rimLight.position.set(70, 42, -50);
  scene.add(rimLight);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const characters = COMPANION_SPECS.map((spec, index) => {
    const character = makeCharacter(spec, index, scene);
    controls.append(character.control);
    return character;
  });
  const raycastMeshes = [];
  characters.forEach((character) => character.root.traverse((item) => {
    if (item instanceof THREE.Mesh && item.visible) {
      raycastMeshes.push(item);
    }
  }));
  let nodes = [];
  let frame = 0;
  let lastFrame = 0;
  let movementTimer = 0;
  let resizeObserver;
  let pointerCharacter = null;
  let drag = null;
  let frameCount = 0;

  function updateCamera() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function updateCharacterPositions() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const small = width < 680;
    characters.forEach((character) => {
      const size = getModelSize();
      const scale = small ? 0.4 : 1;
      character.root.scale.setScalar(scale);
      character.root.position.set(
        character.x + size.width / 2 - width / 2,
        height / 2 - (character.y - window.scrollY) - size.height + (character.visualOffset ?? 0),
        0,
      );
      character.root.scale.multiplyScalar(
        character.moodUntil > performance.now() || character.focused || character === pointerCharacter ? 1.04 : 1,
      );
    });
  }

  function renderOnce() {
    updateCharacterPositions();
    renderer.render(scene, camera);
  }

  characters.forEach((character) => {
    character.control.addEventListener("focus", () => {
      character.focused = true;
      character.waveUntil = performance.now() + 900;
      character.moodUntil = performance.now() + 900;
      character.shadow.material.color.set("#c7ff4d");
      character.shadow.material.opacity = 0.5;
      renderOnce();
    });
    character.control.addEventListener("blur", () => {
      character.focused = false;
      character.shadow.material.color.set("#000000");
      character.shadow.material.opacity = 0.24;
      renderOnce();
    });
    character.control.addEventListener("click", () => setReaction(character, "wave"));
  });

  function startMovement(delay = 1000) {
    if (reducedMotion.matches || document.hidden || movementTimer || drag) {
      return;
    }
    movementTimer = window.setTimeout(() => {
      movementTimer = 0;
      const available = characters.filter((character) => !character.dragged && character.path.length === 0);
      if (!available.length) {
        startMovement(900);
        return;
      }
      const character = available[frameCount % available.length];
      frameCount += 1;
      const start = nodes.reduce((nearest, node) =>
        !nearest || Math.hypot(node.x - character.x, node.y - character.y) < Math.hypot(nearest.x - character.x, nearest.y - character.y)
          ? node
          : nearest, null);
      character.path = findPath(nodes, start, character);
      if (character.path.length) {
        character.walking = true;
        character.pathIndex = 0;
        character.target = character.path[0];
      }
      startMovement(1300 + Math.random() * 1800);
    }, delay);
  }

  function setReaction(character, action) {
    if (reducedMotion.matches) {
      character.moodUntil = performance.now() + 400;
      if (action === "wave" && character.parts.arms[1]) {
        character.parts.arms[1].rotation.z = -0.7;
      }
      renderOnce();
      return;
    }
    react(character, action);
  }

  function nearestCharacter(clientX, clientY) {
    const size = getModelSize();
    pointer.set(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1,
    );
    updateCharacterPositions();
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(raycastMeshes, false)[0];
    if (!hit) {
      return characters
        .filter((character) =>
          Math.abs(clientX - character.x - size.width / 2) <= size.width / 2 &&
          Math.abs(clientY - character.y + window.scrollY - size.height / 2) <= size.height / 2,
        )
        .sort((first, second) =>
          Math.hypot(clientX - first.x - size.width / 2, clientY - first.y + window.scrollY - size.height / 2) -
          Math.hypot(clientX - second.x - size.width / 2, clientY - second.y + window.scrollY - size.height / 2),
        )[0] ?? null;
    }
    let object = hit.object;
    while (object && !characters.some((character) => character.root === object)) {
      object = object.parent;
    }
    return characters.find((character) => character.root === object) ?? null;
  }

  function nearbyCharacter(clientX, clientY) {
    const size = getModelSize();
    let nearest = null;
    let closestDistance = 112;
    characters.forEach((character) => {
      if (character.dragged) {
        return;
      }
      const distance = Math.hypot(
        clientX - character.x - size.width / 2,
        clientY - character.y + window.scrollY - size.height / 2,
      );
      if (distance < closestDistance) {
        nearest = character;
        closestDistance = distance;
      }
    });
    return nearest;
  }

  function handlePointerMove(event) {
    if (drag && event.pointerId === drag.pointerId) {
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (Math.hypot(dx, dy) > 4) {
        drag.moved = true;
        const size = getModelSize();
        drag.character.x = Math.max(0, Math.min(window.innerWidth - size.width, event.clientX + window.scrollX - drag.offsetX));
        drag.character.y = Math.max(0, Math.min(getPageHeight() - size.height, event.clientY + window.scrollY - drag.offsetY));
        drag.character.path = [];
        drag.character.walking = false;
        renderOnce();
        if (event.cancelable) {
          event.preventDefault();
        }
      }
      return;
    }
    if (event.pointerType === "mouse") {
      const hovered =
        nearestCharacter(event.clientX, event.clientY) ??
        nearbyCharacter(event.clientX, event.clientY);
      if (pointerCharacter !== hovered) {
        pointerCharacter = hovered;
        if (hovered) {
          hovered.moodUntil = performance.now() + 850;
          if (performance.now() >= hovered.nextWaveAt) {
            hovered.nextWaveAt = performance.now() + 3000;
            hovered.waveUntil = performance.now() + 700;
          }
        }
      }
      requestRender();
    }
  }

  function handlePointerDown(event) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }
    const character = nearestCharacter(event.clientX, event.clientY);
    if (!character) {
      return;
    }
    event.preventDefault();
    if (movementTimer) {
      window.clearTimeout(movementTimer);
      movementTimer = 0;
    }
    const size = getModelSize();
    const screenX = character.x + size.width / 2;
    drag = {
      character,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - screenX,
      offsetY: event.clientY + window.scrollY - character.y - size.height / 2,
      moved: false,
    };
    character.dragged = true;
    character.path = [];
    character.walking = false;
    character.moodUntil = performance.now() + 1000;
    document.documentElement.classList.add("is-companion-dragging");
    try {
      document.documentElement.setPointerCapture(event.pointerId);
    } catch (error) {
      if (event.pointerType !== "mouse") {
        console.warn("Pointer capture was unavailable for a 3D companion drag.", error);
      }
    }
    renderOnce();
  }

  function handlePointerUp(event) {
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const { character, moved } = drag;
    if (document.documentElement.hasPointerCapture(event.pointerId)) {
      document.documentElement.releasePointerCapture(event.pointerId);
    }
    drag = null;
    character.dragged = false;
    document.documentElement.classList.remove("is-companion-dragging");
    if (moved) {
      setReaction(character, "cheer");
      character.pausedUntil = performance.now() + 1900;
    } else {
      setReaction(character, "wave");
    }
    startMovement(moved ? 1900 : 950);
  }

  function handlePointerCancel(event) {
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    drag.character.dragged = false;
    drag = null;
    document.documentElement.classList.remove("is-companion-dragging");
    startMovement(1000);
  }

  function updateCharacter(character, elapsed, now) {
    if (character.pausedUntil && now < character.pausedUntil) {
      return;
    }
    if (!character.walking && now >= character.jumpAt && character.jumpUntil <= now) {
      character.jumpUntil = now + 650;
      character.jumpAt = now + 9000 + Math.random() * 15000;
    }
    if (character.walking && character.target && !character.dragged) {
      const dx = character.target.x - character.x;
      const dy = character.target.y - character.y;
      const distance = Math.hypot(dx, dy);
      const step = character.spec.speed * elapsed;
      character.targetFacing = dx < 0 ? Math.PI : 0;
      if (distance <= step + 0.5) {
        character.x = character.target.x;
        character.y = character.target.y;
        character.node = character.target;
        character.pathIndex += 1;
        character.target = character.path[character.pathIndex] ?? null;
        if (!character.target) {
          character.walking = false;
          character.path = [];
        }
      } else {
        character.x += (dx / distance) * step;
        character.y += (dy / distance) * step;
      }
    }
    character.facing += Math.atan2(Math.sin(character.targetFacing - character.facing), Math.cos(character.targetFacing - character.facing)) * Math.min(1, elapsed * 5.2);
    character.gait += elapsed * (character.walking ? 10.8 : 1.4);
    const walking = character.walking && !character.dragged;
    const bob = walking ? Math.abs(Math.sin(character.gait)) * 2.8 : Math.sin(now * 0.0018 + character.index) * 1.1;
    const jumpProgress = character.jumpUntil > now ? (character.jumpUntil - now) / 650 : 0;
    const jump = jumpProgress > 0 ? Math.sin((1 - jumpProgress) * Math.PI) * 17 : 0;
    const waving = character.waveUntil > now;
    character.root.rotation.y = character.facing;
    character.visualOffset = bob + jump;
    character.parts.bodyRig?.position.set(0, 0, 0);
    if (character.parts.bodyRig) {
      character.parts.bodyRig.position.y = bob * 0.28;
    }
    character.parts.head.rotation.z = Math.sin(now * 0.0014 + character.index * 2) * 0.035;
    character.parts.arms.forEach((arm, index) => {
      const side = index === 0 ? -1 : 1;
      arm.rotation.z = waving && side > 0
        ? -0.92 + Math.sin(now * 0.014) * 0.18
        : walking ? Math.sin(character.gait + index * Math.PI) * 0.48 : Math.sin(now * 0.0017 + index) * 0.035;
    });
    character.parts.legs.forEach((leg, index) => {
      leg.rotation.z = walking ? Math.sin(character.gait + index * Math.PI) * 0.52 : 0;
    });
    if (character.parts.eyes) {
      if (now >= character.blinkAt && character.blinkUntil === 0) {
        character.blinkUntil = now + 125;
        character.blinkAt = now + 2600 + Math.random() * 6000;
      }
      character.parts.eyes.scale.y = character.blinkUntil > now ? 0.08 : 1;
      if (character.blinkUntil && now >= character.blinkUntil) {
        character.blinkUntil = 0;
      }
    }
    if (character.parts.flame) {
      character.parts.flame.scale.setScalar(0.86 + Math.sin(now * 0.012) * 0.12);
      character.parts.flame.rotation.z = Math.sin(now * 0.009) * 0.08;
    }
    if (character.parts.sprout) {
      character.parts.sprout.rotation.z = Math.sin(now * 0.0017 + character.index) * 0.06;
    }
    if (character.parts.halo) {
      character.parts.halo.rotation.z += elapsed * 0.75;
    }
    if (character.parts.squashMesh && walking) {
      character.parts.squashMesh.scale.y = 21 - Math.abs(Math.sin(character.gait)) * 2.3;
    }
  }

  function animate(now) {
    frame = 0;
    if (document.hidden) {
      return;
    }
    const elapsed = Math.min(0.05, Math.max(0, (now - (lastFrame || now)) / 1000));
    lastFrame = now;
    if (!reducedMotion.matches) {
      characters.forEach((character) => updateCharacter(character, elapsed, now));
    }
    updateCharacterPositions();
    renderer.render(scene, camera);
    if (!reducedMotion.matches) {
      frame = window.requestAnimationFrame(animate);
    }
  }

  function requestRender() {
    if (reducedMotion.matches) {
      renderOnce();
    } else if (!frame && !document.hidden) {
      frame = window.requestAnimationFrame(animate);
    }
  }

  function handleResize() {
    updateCamera();
    nodes = buildMovementMap(characters);
    requestRender();
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      if (movementTimer) {
        window.clearTimeout(movementTimer);
        movementTimer = 0;
      }
      return;
    }
    lastFrame = 0;
    requestRender();
    startMovement(900);
  }

  nodes = buildMovementMap(characters);
  updateCamera();
  renderOnce();
  requestRender();
  startMovement(1400);
  document.addEventListener("pointermove", handlePointerMove, { passive: false });
  document.addEventListener("pointerdown", handlePointerDown, { passive: false });
  document.addEventListener("pointerup", handlePointerUp);
  document.addEventListener("pointercancel", handlePointerCancel);
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("scroll", requestRender, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", () => {
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  window.addEventListener("pageshow", requestRender);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      if (movementTimer) {
        window.clearTimeout(movementTimer);
        movementTimer = 0;
      }
      characters.forEach((character) => {
        character.walking = false;
        character.path = [];
        character.parts.arms.forEach((arm) => { arm.rotation.z = 0; });
        character.parts.legs.forEach((leg) => { leg.rotation.z = 0; });
      });
    } else {
      lastFrame = 0;
      requestRender();
      startMovement(1000);
    }
    requestRender();
  });
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    const main = document.querySelector(".site-main");
    if (main) {
      resizeObserver.observe(main);
    }
  }
}
