// 카피바라 데모
const btn = document.getElementById("ctaBtn");
const result = document.getElementById("result");
const introText = document.getElementById("introText");

let isShown = false;

if (btn && result && introText) btn.addEventListener("click", () => {
  if (!isShown) {
    result.style.display = "block";
    requestAnimationFrame(() => {
      result.classList.add("show");
    });
    introText.style.display = "none";
    btn.textContent = "또 부를까?";
    isShown = true;
  } else {
    result.classList.remove("show");
    result.style.display = "none";
    introText.style.display = "block";
    btn.textContent = "카피바라";
    isShown = false;
  }
});

// footer 연도
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// 모바일 메뉴
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");

function setMobileNavOpen(isOpen) {
  if (!navToggle || !mobileNav) return;
  navToggle.setAttribute("aria-expanded", String(isOpen));
  mobileNav.hidden = !isOpen;
}

if (navToggle && mobileNav) {
  setMobileNavOpen(false);

  navToggle.addEventListener("click", () => {
    const nextOpen = navToggle.getAttribute("aria-expanded") !== "true";
    setMobileNavOpen(nextOpen);
  });

  // 메뉴 링크 클릭 시 닫기
  mobileNav.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement) setMobileNavOpen(false);
  });

  // ESC로 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMobileNavOpen(false);
  });
}

// Hero 배경 이미지 (사용자 업로드)
const HERO_BG_KEY = "pika_hero_bg_v1";
const HERO_BG_POS_KEY = "pika_hero_bg_pos_v1"; // legacy (x,y)
const HERO_BG_POS_Y_KEY = "pika_hero_bg_pos_y_v1";
const HERO_BG_OPACITY_KEY = "pika_hero_bg_opacity_v1";
const heroBgInput = document.getElementById("heroBgInput");
const heroBgBtn = document.getElementById("heroBgBtn");
const heroBgClearBtn = document.getElementById("heroBgClearBtn");
const heroBgPosY = document.getElementById("heroBgPosY");
const heroBgOpacity = document.getElementById("heroBgOpacity");
const heroBgEditBtn = document.getElementById("heroBgEditBtn");
const heroBgEditor = document.getElementById("heroBgEditor");
const heroBgDoneBtn = document.getElementById("heroBgDoneBtn");

let heroDraft = { bg: "", y: 50, opacity: 22 };
let heroSaved = { bg: "", y: 50, opacity: 22 };

function applyHeroBg(dataUrl) {
  const value = dataUrl ? `url("${dataUrl}")` : "none";
  document.documentElement.style.setProperty("--heroBg", value);
}

function applyHeroBgPosY(y) {
  const py = `${Math.max(0, Math.min(100, Number(y)))}%`;
  document.documentElement.style.setProperty("--heroBgPosY", py);
}

function applyHeroBgOpacity(opacityPercent) {
  const pct = Math.max(0, Math.min(100, Number(opacityPercent)));
  document.documentElement.style.setProperty("--heroBgOpacity", String(pct / 100));
}

function readSavedHeroBg() {
  let bg = "";
  try {
    bg = localStorage.getItem(HERO_BG_KEY) || "";
  } catch {
    bg = "";
  }
  return bg;
}

function readSavedHeroPosY() {
  // New key (y only)
  try {
    const rawY = localStorage.getItem(HERO_BG_POS_Y_KEY);
    if (rawY) return { y: Number(rawY) };
  } catch {
    // ignore
  }

  // Legacy key (x,y) - ignore x and only use y
  try {
    const raw = localStorage.getItem(HERO_BG_POS_KEY);
    if (!raw) return { y: 50 };
    const parsed = JSON.parse(raw);
    const y = Number(parsed?.y ?? 50);
    return { y };
  } catch {
    return { y: 50 };
  }
}

function readSavedHeroOpacity() {
  try {
    const raw = localStorage.getItem(HERO_BG_OPACITY_KEY);
    if (!raw) return { opacity: 22 };
    return { opacity: Number(raw) };
  } catch {
    return { opacity: 22 };
  }
}

function getSavedHeroState() {
  return { bg: readSavedHeroBg(), ...readSavedHeroPosY(), ...readSavedHeroOpacity() };
}

function syncHeroInputsFromDraft() {
  if (heroBgPosY) heroBgPosY.value = String(heroDraft.y);
  if (heroBgOpacity) heroBgOpacity.value = String(heroDraft.opacity);
}

function applyDraftToHero() {
  applyHeroBg(heroDraft.bg);
  applyHeroBgPosY(heroDraft.y);
  applyHeroBgOpacity(heroDraft.opacity);
}

function setHeroEditorOpen(isOpen) {
  if (!heroBgEditBtn || !heroBgEditor) return;
  const wasOpen = heroBgEditBtn.getAttribute("aria-expanded") === "true";
  heroBgEditBtn.setAttribute("aria-expanded", String(isOpen));
  heroBgEditor.hidden = !isOpen;
  if (isOpen) {
    // 편집 시작 시: 저장된 값 기준으로 draft 세팅
    heroSaved = getSavedHeroState();
    heroDraft = { ...heroSaved };
    applyDraftToHero();
    syncHeroInputsFromDraft();
  } else if (wasOpen) {
    // 편집 중 닫으면 저장된 상태로 복구 (미리보기 취소)
    heroDraft = { ...heroSaved };
    applyDraftToHero();
  }
}

// 저장값 초기 적용
heroSaved = getSavedHeroState();
heroDraft = { ...heroSaved };
applyDraftToHero();
syncHeroInputsFromDraft();

// 처음엔 기본 상태(편집 UI 숨김)
if (heroBgEditBtn && heroBgEditor) setHeroEditorOpen(false);

if (heroBgEditBtn) {
  heroBgEditBtn.addEventListener("click", () => {
    const nextOpen = heroBgEditBtn.getAttribute("aria-expanded") !== "true";
    setHeroEditorOpen(nextOpen);
  });
}

if (heroBgBtn && heroBgInput) {
  heroBgBtn.addEventListener("click", () => heroBgInput.click());
}

if (heroBgInput) {
  heroBgInput.addEventListener("change", () => {
    const file = heroBgInput.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith("image/")) return;
    // 편집 중이 아닐 때는 무시 (UI도 숨김)
    if (heroBgEditBtn && heroBgEditBtn.getAttribute("aria-expanded") !== "true") return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (!dataUrl.startsWith("data:image/")) return;
      heroDraft.bg = dataUrl;
      applyDraftToHero();
    };
    reader.readAsDataURL(file);
    heroBgInput.value = "";
  });
}

if (heroBgClearBtn) {
  heroBgClearBtn.addEventListener("click", () => {
    if (heroBgEditBtn && heroBgEditBtn.getAttribute("aria-expanded") !== "true") return;
    heroDraft.bg = "";
    applyDraftToHero();
  });
}

function saveHeroBgPos() {
  if (!heroBgPosY) return;
  if (heroBgEditBtn && heroBgEditBtn.getAttribute("aria-expanded") !== "true") return;
  heroDraft.y = Number(heroBgPosY.value);
  applyDraftToHero();
}

if (heroBgPosY) heroBgPosY.addEventListener("input", saveHeroBgPos);

function saveHeroBgOpacity() {
  if (!heroBgOpacity) return;
  if (heroBgEditBtn && heroBgEditBtn.getAttribute("aria-expanded") !== "true") return;
  heroDraft.opacity = Number(heroBgOpacity.value);
  applyDraftToHero();
}

if (heroBgOpacity) heroBgOpacity.addEventListener("input", saveHeroBgOpacity);

if (heroBgDoneBtn) {
  heroBgDoneBtn.addEventListener("click", () => {
    // 저장
    try {
      if (heroDraft.bg) localStorage.setItem(HERO_BG_KEY, heroDraft.bg);
      else localStorage.removeItem(HERO_BG_KEY);
      localStorage.setItem(HERO_BG_POS_Y_KEY, String(heroDraft.y));
      localStorage.setItem(HERO_BG_OPACITY_KEY, String(heroDraft.opacity));
    } catch {
      // ignore
    }
    // 저장된 값 갱신 후 닫기
    heroSaved = { ...heroDraft };
    // 저장 후 편집 탭 숨김
    setHeroEditorOpen(false);
  });
}

// About 프로필 (이미지/텍스트 로컬 저장)
const PROFILE_IMG_KEY = "pika_profile_img_v1";
const PROFILE_NAME_KEY = "pika_profile_name_v1";
const PROFILE_ROLE_KEY = "pika_profile_role_v1";
const PROFILE_BIO_KEY = "pika_profile_bio_v1";

const profileImg = document.getElementById("profileImg");
const profileFallback = document.getElementById("profileFallback");
const profileImgInput = document.getElementById("profileImgInput");
const profileImgBtn = document.getElementById("profileImgBtn");
const profileImgRemoveBtn = document.getElementById("profileImgRemoveBtn");
const profileName = document.getElementById("profileName");
const profileRole = document.getElementById("profileRole");
const profileBio = document.getElementById("profileBio");
const profileEditBtn = document.getElementById("profileEditBtn");
const profileEditor = document.getElementById("profileEditor");
const profileDoneBtn = document.getElementById("profileDoneBtn");
const profileCancelBtn = document.getElementById("profileCancelBtn");

let profileIsEditing = false;
let profileSavedState = { img: "", name: "", role: "", bio: "" };
let profileDraftImg = "";

function setProfileAvatar(dataUrl) {
  if (!profileImg || !profileFallback) return;
  const wrap = profileImg.parentElement;
  const has = Boolean(dataUrl);
  if (has) {
    profileImg.src = dataUrl;
    wrap?.classList.add("has-img");
  } else {
    profileImg.removeAttribute("src");
    wrap?.classList.remove("has-img");
  }
}

function loadText(el, key) {
  if (!el) return;
  try {
    const v = localStorage.getItem(key);
    if (v) el.textContent = v;
  } catch {
    // ignore
  }
}

function readSavedProfileState() {
  let img = "";
  let name = "";
  let role = "";
  let bio = "";
  try {
    img = localStorage.getItem(PROFILE_IMG_KEY) || "";
    name = localStorage.getItem(PROFILE_NAME_KEY) || "";
    role = localStorage.getItem(PROFILE_ROLE_KEY) || "";
    bio = localStorage.getItem(PROFILE_BIO_KEY) || "";
  } catch {
    // ignore
  }
  return { img, name, role, bio };
}

function setProfileEditable(isEditable) {
  const v = isEditable ? "true" : "false";
  if (profileName) profileName.setAttribute("contenteditable", v);
  if (profileRole) profileRole.setAttribute("contenteditable", v);
  if (profileBio) profileBio.setAttribute("contenteditable", v);
}

function setProfileEditorOpen(isOpen) {
  if (!profileEditBtn || !profileEditor) return;
  profileIsEditing = isOpen;
  profileEditBtn.setAttribute("aria-expanded", String(isOpen));
  profileEditor.hidden = !isOpen;
  setProfileEditable(isOpen);

  if (isOpen) {
    profileSavedState = readSavedProfileState();
    profileDraftImg = profileSavedState.img || "";
    if (profileName && profileSavedState.name) profileName.textContent = profileSavedState.name;
    if (profileRole && profileSavedState.role) profileRole.textContent = profileSavedState.role;
    if (profileBio && profileSavedState.bio) profileBio.textContent = profileSavedState.bio;
    if (profileDraftImg && profileDraftImg.startsWith("data:image/")) setProfileAvatar(profileDraftImg);
    if (profileName) profileName.focus();
  } else {
    // 닫을 때는 편집 불가 상태로만 전환 (저장/취소는 버튼에서 처리)
    if (profileName) profileName.blur();
    if (profileRole) profileRole.blur();
    if (profileBio) profileBio.blur();
  }
}

// 초기 로드
loadText(profileName, PROFILE_NAME_KEY);
loadText(profileRole, PROFILE_ROLE_KEY);
loadText(profileBio, PROFILE_BIO_KEY);
try {
  const savedImg = localStorage.getItem(PROFILE_IMG_KEY);
  if (savedImg && savedImg.startsWith("data:image/")) setProfileAvatar(savedImg);
} catch {
  // ignore
}

// 처음엔 보기 모드
if (profileEditor && profileEditBtn) setProfileEditorOpen(false);

if (profileEditBtn) {
  profileEditBtn.addEventListener("click", () => {
    const next = profileEditBtn.getAttribute("aria-expanded") !== "true";
    setProfileEditorOpen(next);
  });
}

// 이미지 업로드/제거
if (profileImgBtn && profileImgInput) {
  profileImgBtn.addEventListener("click", () => {
    if (!profileIsEditing) return;
    profileImgInput.click();
  });
}

if (profileImgInput) {
  profileImgInput.addEventListener("change", () => {
    const file = profileImgInput.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith("image/")) return;
    if (!profileIsEditing) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (!dataUrl.startsWith("data:image/")) return;
      setProfileAvatar(dataUrl);
      profileDraftImg = dataUrl;
    };
    reader.readAsDataURL(file);
    profileImgInput.value = "";
  });
}

if (profileImgRemoveBtn) {
  profileImgRemoveBtn.addEventListener("click", () => {
    if (!profileIsEditing) return;
    setProfileAvatar("");
    profileDraftImg = "";
  });
}

if (profileDoneBtn) {
  profileDoneBtn.addEventListener("click", () => {
    if (!profileIsEditing) return;
    const name = String(profileName?.textContent || "").trim();
    const role = String(profileRole?.textContent || "").trim();
    const bio = String(profileBio?.textContent || "").trim();
    try {
      if (profileDraftImg) localStorage.setItem(PROFILE_IMG_KEY, profileDraftImg);
      else localStorage.removeItem(PROFILE_IMG_KEY);
      localStorage.setItem(PROFILE_NAME_KEY, name);
      localStorage.setItem(PROFILE_ROLE_KEY, role);
      localStorage.setItem(PROFILE_BIO_KEY, bio);
    } catch {
      // ignore
    }
    profileSavedState = { img: profileDraftImg, name, role, bio };
    setProfileEditorOpen(false);
  });
}

if (profileCancelBtn) {
  profileCancelBtn.addEventListener("click", () => {
    if (!profileIsEditing) return;
    // 저장된 상태로 복구
    const saved = readSavedProfileState();
    if (profileName) profileName.textContent = saved.name || profileName.textContent || "";
    if (profileRole) profileRole.textContent = saved.role || profileRole.textContent || "";
    if (profileBio) profileBio.textContent = saved.bio || profileBio.textContent || "";
    if (saved.img && saved.img.startsWith("data:image/")) setProfileAvatar(saved.img);
    else setProfileAvatar("");
    profileDraftImg = saved.img || "";
    setProfileEditorOpen(false);
  });
}

// 툴 활용능력: 커스텀 항목 추가/저장
const SKILLS_KEY = "pika_custom_skills_v1";
const SKILLS_OVERRIDES_KEY = "pika_skill_overrides_v1";
const SKILLS_HIDDEN_KEY = "pika_skill_hidden_v1";
const skillsGrid = document.getElementById("skillsGrid");
const skillForm = document.getElementById("skillForm");
const skillNameInput = document.getElementById("skillName");
const skillPercentInput = document.getElementById("skillPercent");
const skillDescInput = document.getElementById("skillDesc");
const skillFab = document.getElementById("skillFab");
const skillDrawer = document.getElementById("skillDrawer");
const skillOverlay = document.getElementById("skillOverlay");
const skillDrawerClose = document.getElementById("skillDrawerClose");

let editingSkill = null; // { type: "custom"|"builtin", id: string }

function clampPercent(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function loadOverrides() {
  try {
    const raw = localStorage.getItem(SKILLS_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveOverrides(map) {
  try {
    localStorage.setItem(SKILLS_OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function loadHiddenSet() {
  try {
    const raw = localStorage.getItem(SKILLS_HIDDEN_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map(String));
  } catch {
    return new Set();
  }
}

function saveHiddenSet(set) {
  try {
    localStorage.setItem(SKILLS_HIDDEN_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

function loadCustomSkills() {
  try {
    const raw = localStorage.getItem(SKILLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s) => s && typeof s === "object")
      .map((s) => ({
        id: String(s.id || ""),
        name: String(s.name || "").trim(),
        percent: clampPercent(s.percent),
        desc: String(s.desc || "").trim(),
      }))
      .filter((s) => s.id && s.name);
  } catch {
    return [];
  }
}

function saveCustomSkills(list) {
  try {
    localStorage.setItem(SKILLS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function setSkillCardContent(card, { name, percent, desc }) {
  const nameEl = card.querySelector(".skill-name");
  const levelEl = card.querySelector(".skill-level");
  const descEl = card.querySelector(".skill-desc");
  const barEl = card.querySelector(".skill-bar");
  const fillEl = card.querySelector(".skill-fill");

  if (nameEl) nameEl.textContent = name;
  if (levelEl) levelEl.textContent = `${percent}%`;
  if (descEl) descEl.textContent = desc || "—";
  if (barEl) {
    barEl.setAttribute("aria-label", name);
    barEl.setAttribute("aria-valuenow", String(percent));
  }
  if (fillEl) fillEl.style.width = `${percent}%`;
}

function setSkillFormMode(mode) {
  const addBtn = document.getElementById("skillAddBtn");
  if (!addBtn) return;
  if (mode === "edit") {
    addBtn.textContent = "저장";
  } else {
    addBtn.textContent = "추가";
  }
}

function resetSkillForm() {
  editingSkill = null;
  setSkillFormMode("add");
  if (skillNameInput) skillNameInput.value = "";
  if (skillDescInput) skillDescInput.value = "";
  if (skillPercentInput) skillPercentInput.value = "60";
}

function createSkillCard({ id, name, percent, desc }) {
  const card = document.createElement("div");
  card.className = "skill-card skill-card-custom";
  card.dataset.skillId = id;

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "skill-edit";
  editBtn.setAttribute("aria-label", `${name} 수정`);
  editBtn.textContent = "✎";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "skill-remove";
  removeBtn.setAttribute("aria-label", `${name} 삭제`);
  removeBtn.textContent = "×";

  const top = document.createElement("div");
  top.className = "skill-top";

  const nameEl = document.createElement("span");
  nameEl.className = "skill-name";
  nameEl.textContent = name;

  const level = document.createElement("span");
  level.className = "skill-level";
  level.textContent = `${percent}%`;

  top.appendChild(nameEl);
  top.appendChild(level);

  const bar = document.createElement("div");
  bar.className = "skill-bar";
  bar.setAttribute("role", "progressbar");
  bar.setAttribute("aria-label", name);
  bar.setAttribute("aria-valuenow", String(percent));
  bar.setAttribute("aria-valuemin", "0");
  bar.setAttribute("aria-valuemax", "100");

  const fill = document.createElement("span");
  fill.className = "skill-fill";
  fill.style.width = `${percent}%`;
  bar.appendChild(fill);

  const p = document.createElement("p");
  p.className = "text muted skill-desc";
  p.textContent = desc || "—";

  card.appendChild(editBtn);
  card.appendChild(removeBtn);
  card.appendChild(top);
  card.appendChild(bar);
  card.appendChild(p);

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    editingSkill = { type: "custom", id };
    setSkillFormMode("edit");
    if (skillNameInput) skillNameInput.value = name;
    if (skillPercentInput) skillPercentInput.value = String(percent);
    if (skillDescInput) skillDescInput.value = desc || "";
    setSkillDrawerOpen(true);
  });

  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const list = loadCustomSkills().filter((s) => s.id !== id);
    saveCustomSkills(list);
    card.remove();
  });

  return card;
}

function renderCustomSkills() {
  if (!skillsGrid) return;
  // 기존 렌더된 커스텀 카드 제거 후 재렌더
  skillsGrid.querySelectorAll(".skill-card-custom").forEach((el) => el.remove());
  loadCustomSkills().forEach((skill) => {
    skillsGrid.appendChild(createSkillCard(skill));
  });
}

function applyBuiltInOverrides() {
  if (!skillsGrid) return;
  const overrides = loadOverrides();
  skillsGrid.querySelectorAll('.skill-card[data-skill-builtin="true"][data-skill-id]').forEach((card) => {
    const id = card.getAttribute("data-skill-id");
    if (!id) return;
    const ov = overrides[id];
    if (!ov) return;
    const name = String(ov.name || "").trim();
    const percent = clampPercent(ov.percent);
    const desc = String(ov.desc || "").trim();
    if (name) setSkillCardContent(card, { name, percent, desc });
  });
}

function applyBuiltInHidden() {
  if (!skillsGrid) return;
  const hidden = loadHiddenSet();
  skillsGrid.querySelectorAll('.skill-card[data-skill-builtin="true"][data-skill-id]').forEach((card) => {
    const id = card.getAttribute("data-skill-id");
    if (!id) return;
    card.hidden = hidden.has(id);
  });
}

function attachBuiltInEditButtons() {
  if (!skillsGrid) return;
  skillsGrid.querySelectorAll('.skill-card[data-skill-builtin="true"][data-skill-id]').forEach((card) => {
    if (card.querySelector(".skill-edit")) return;
    const id = card.getAttribute("data-skill-id");
    if (!id) return;

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "skill-edit";
    editBtn.setAttribute("aria-label", "툴 수정");
    editBtn.textContent = "✎";
    card.prepend(editBtn);

    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const name = (card.querySelector(".skill-name")?.textContent || "").trim();
      const levelRaw = (card.querySelector(".skill-level")?.textContent || "0").replace("%", "");
      const percent = clampPercent(levelRaw);
      const desc = (card.querySelector(".skill-desc")?.textContent || "").trim();

      editingSkill = { type: "builtin", id };
      setSkillFormMode("edit");
      if (skillNameInput) skillNameInput.value = name;
      if (skillPercentInput) skillPercentInput.value = String(percent);
      if (skillDescInput) skillDescInput.value = desc === "—" ? "" : desc;
      setSkillDrawerOpen(true);
    });
  });
}

function attachBuiltInRemoveButtons() {
  if (!skillsGrid) return;
  skillsGrid.querySelectorAll('.skill-card[data-skill-builtin="true"][data-skill-id]').forEach((card) => {
    if (card.querySelector(".skill-remove")) return;
    const id = card.getAttribute("data-skill-id");
    if (!id) return;
    const name = (card.querySelector(".skill-name")?.textContent || "툴").trim();

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "skill-remove";
    removeBtn.setAttribute("aria-label", `${name} 삭제`);
    removeBtn.textContent = "×";
    card.prepend(removeBtn);

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const hidden = loadHiddenSet();
      hidden.add(id);
      saveHiddenSet(hidden);
      card.hidden = true;
      // 혹시 편집 중이었다면 닫고 리셋
      if (editingSkill?.type === "builtin" && editingSkill.id === id) setSkillDrawerOpen(false);
    });
  });
}

if (skillsGrid) {
  applyBuiltInHidden();
  applyBuiltInOverrides();
  attachBuiltInEditButtons();
  attachBuiltInRemoveButtons();
  renderCustomSkills();
}

if (skillForm && skillsGrid && skillNameInput && skillPercentInput && skillDescInput) {
  skillForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = String(skillNameInput.value || "").trim();
    const desc = String(skillDescInput.value || "").trim();
    const percent = clampPercent(skillPercentInput.value);
    if (!name) return;

    // edit mode
    if (editingSkill?.type === "custom") {
      const list = loadCustomSkills();
      const idx = list.findIndex((s) => s.id === editingSkill.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], name, percent, desc };
        saveCustomSkills(list);
        const card = skillsGrid.querySelector(`.skill-card-custom[data-skill-id="${editingSkill.id}"]`);
        if (card) setSkillCardContent(card, { name, percent, desc });
      }
      resetSkillForm();
      setSkillDrawerOpen(false);
      return;
    }

    if (editingSkill?.type === "builtin") {
      const overrides = loadOverrides();
      overrides[editingSkill.id] = { name, percent, desc };
      saveOverrides(overrides);
      const card = skillsGrid.querySelector(`.skill-card[data-skill-builtin="true"][data-skill-id="${editingSkill.id}"]`);
      if (card) setSkillCardContent(card, { name, percent, desc });
      resetSkillForm();
      setSkillDrawerOpen(false);
      return;
    }

    const next = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name,
      percent,
      desc,
    };

    const list = loadCustomSkills();
    list.push(next);
    saveCustomSkills(list);
    skillsGrid.appendChild(createSkillCard(next));

    resetSkillForm();
    skillNameInput.focus();
  });
}

// 새 툴 추가 패널 토글
function setSkillDrawerOpen(isOpen) {
  if (!skillDrawer || !skillOverlay || !skillFab) return;
  skillFab.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    skillDrawer.hidden = false;
    skillOverlay.hidden = false;
    requestAnimationFrame(() => {
      skillDrawer.classList.add("is-open");
    });
    if (skillNameInput) skillNameInput.focus();
  } else {
    skillDrawer.classList.remove("is-open");
    // transition 끝난 뒤 숨김 처리
    window.setTimeout(() => {
      if (!skillDrawer.classList.contains("is-open")) {
        skillDrawer.hidden = true;
        skillOverlay.hidden = true;
      }
    }, 200);
    resetSkillForm();
  }
}

if (skillFab && skillDrawer && skillOverlay) {
  setSkillDrawerOpen(false);

  skillFab.addEventListener("click", (e) => {
    e.stopPropagation();
    const nextOpen = skillFab.getAttribute("aria-expanded") !== "true";
    setSkillDrawerOpen(nextOpen);
  });

  if (skillDrawerClose) {
    skillDrawerClose.addEventListener("click", () => setSkillDrawerOpen(false));
  }

  skillOverlay.addEventListener("click", () => setSkillDrawerOpen(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setSkillDrawerOpen(false);
  });

  // 패널 밖 클릭 시 닫기
  document.addEventListener("click", (e) => {
    if (skillFab.getAttribute("aria-expanded") !== "true") return;
    const target = e.target;
    if (!(target instanceof Node)) return;
    // 수정 버튼 클릭(패널을 여는 클릭)은 바깥 클릭 닫기에서 제외
    if (target instanceof Element && target.closest(".skill-edit")) return;
    if (target instanceof Element && target.closest(".skill-remove")) return;
    if (skillDrawer.contains(target) || skillFab.contains(target)) return;
    setSkillDrawerOpen(false);
  });
}
