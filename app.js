const STORAGE_KEYS = {
  records: "mycalm_records",
  lastState: "mycalm_last_state",
  events: "mycalm_events",
  progress: "mycalm_progress",
};

const TOTAL_ROUTINE_SECONDS = 300;

const REWARDS = {
  stepXp: 10,
  stepStars: 1,
  questBonusXp: 20,
  questBonusStars: 2,
};

const XP_PER_LEVEL = 50;

const HUD_SCREENS = [
  "state-screen",
  "recommend-screen",
  "routine-screen",
  "complete-screen",
];

const TIME_BACKGROUNDS = [
  { startHour: 23, image: "assets/images/bg-night.png", label: "밤" },
  { startHour: 5, image: "assets/images/bg-morning.png", label: "아침" },
  { startHour: 9, image: "assets/images/bg-day.png", label: "낮" },
  { startHour: 13, image: "assets/images/bg-afternoon.png", label: "오후" },
  { startHour: 17, image: "assets/images/bg-sunset.png", label: "저녁" },
  { startHour: 20, image: "assets/images/bg-dusk.png", label: "해질녘" },
];

let currentBackgroundImage = null;

const STEP_REWARD_MESSAGES = [
  {
    title: "1단계 클리어!",
    message: "숨을 고르며 첫 미션을 끝냈어요.",
  },
  {
    title: "2단계 클리어!",
    message: "몸의 긴장을 조금 풀었어요.",
  },
  {
    title: "3단계 클리어!",
    message: "마지막 미션까지 해냈어요.",
  },
];

const routines = {
  too_many_thoughts: {
    id: "too_many_thoughts",
    title: "머리 끄기 5분 루틴",
    description:
      "생각을 억지로 멈추지 않고, 잠시 옆에 내려놓는 루틴이에요.",
    steps: [
      {
        title: "숨 고르기",
        duration: 60,
        text: "코로 천천히 들이마시고, 입으로 길게 내쉬어요.",
      },
      {
        title: "몸 힘 빼기",
        duration: 120,
        text: "어깨, 턱, 손끝에 들어간 힘을 천천히 풀어요.",
      },
      {
        title: "내일로 넘기기",
        duration: 120,
        text: "지금 해결하지 않아도 되는 생각은 내일 다시 열어도 괜찮아요.",
      },
    ],
  },

  exam_stress: {
    id: "exam_stress",
    title: "시험 전날 내려놓기 루틴",
    description:
      "오늘 할 수 있는 만큼 했다는 감각을 만들고 잠으로 넘어가는 루틴이에요.",
    steps: [
      {
        title: "숨 고르기",
        duration: 60,
        text: "지금은 더 외우는 시간이 아니라 몸을 쉬게 하는 시간이에요.",
      },
      {
        title: "긴장 풀기",
        duration: 120,
        text: "어깨와 배에 들어간 힘을 천천히 풀어보세요.",
      },
      {
        title: "내일에게 맡기기",
        duration: 120,
        text: "내일의 나는 오늘보다 조금 더 맑은 머리로 시작할 수 있어요.",
      },
    ],
  },

  phone_overuse: {
    id: "phone_overuse",
    title: "화면 닫기 5분 루틴",
    description: "화면에서 잠으로 넘어가기 위한 작은 전환 루틴이에요.",
    steps: [
      {
        title: "밝기 낮추기",
        duration: 60,
        text: "화면 밝기를 낮추고 손의 힘을 조금 풀어보세요.",
      },
      {
        title: "마지막 스크롤 멈추기",
        duration: 120,
        text: "더 볼 수 있지만, 오늘은 여기서 멈춰도 괜찮아요.",
      },
      {
        title: "화면 내려놓기",
        duration: 120,
        text: "휴대폰을 몸에서 조금 떨어진 곳에 놓아보세요.",
      },
    ],
  },

  body_tension: {
    id: "body_tension",
    title: "몸 힘 빼기 5분 루틴",
    description: "긴장한 몸을 천천히 느슨하게 만드는 루틴이에요.",
    steps: [
      {
        title: "턱 힘 빼기",
        duration: 60,
        text: "이를 꽉 물고 있었다면 턱을 조금 느슨하게 풀어보세요.",
      },
      {
        title: "어깨 내려놓기",
        duration: 120,
        text: "어깨가 귀 가까이 올라가 있었다면 천천히 아래로 내려보세요.",
      },
      {
        title: "손끝 풀기",
        duration: 120,
        text: "손가락 끝까지 힘을 풀고 이불의 무게를 느껴보세요.",
      },
    ],
  },

  just_awake: {
    id: "just_awake",
    title: "조용히 잠드는 5분 루틴",
    description: "특별한 이유 없이 잠이 오지 않는 밤을 위한 루틴이에요.",
    steps: [
      {
        title: "밤 인정하기",
        duration: 60,
        text: "잠이 바로 오지 않아도 괜찮아요. 지금은 조용히 쉬는 시간이에요.",
      },
      {
        title: "호흡 세기",
        duration: 120,
        text: "숨을 들이마시고 내쉴 때마다 마음속으로 숫자를 하나씩 세어보세요.",
      },
      {
        title: "몸 맡기기",
        duration: 120,
        text: "몸을 이불에 맡기고, 오늘의 나머지는 내일로 넘겨요.",
      },
    ],
  },
};

let selectedStateId = null;
let selectedRoutine = null;
let currentStepIndex = 0;
let timerId = null;
let remainingSeconds = 0;
let currentStepDuration = 0;
let elapsedBeforeCurrentStep = 0;
let rewardReady = false;
let afterRewardAction = null;

function getBackgroundForHour(hour) {
  const sorted = [...TIME_BACKGROUNDS].sort(
    (a, b) => b.startHour - a.startHour
  );
  for (const bg of sorted) {
    if (hour >= bg.startHour) {
      return bg;
    }
  }
  return TIME_BACKGROUNDS.find((bg) => bg.startHour === 23);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setBackground(imagePath) {
  if (currentBackgroundImage === imagePath) return;

  const currentEl = document.getElementById("bg-current");
  const nextEl = document.getElementById("bg-next");
  if (!currentEl || !nextEl) return;

  const applyBackground = () => {
    const activeEl = currentEl.classList.contains("is-active")
      ? currentEl
      : nextEl;
    const inactiveEl = activeEl === currentEl ? nextEl : currentEl;

    inactiveEl.style.backgroundImage = `url("${imagePath}")`;
    inactiveEl.classList.add("is-active");
    activeEl.classList.remove("is-active");
    currentBackgroundImage = imagePath;
  };

  if (prefersReducedMotion()) {
    currentEl.style.backgroundImage = `url("${imagePath}")`;
    nextEl.style.backgroundImage = "";
    currentEl.classList.add("is-active");
    nextEl.classList.remove("is-active");
    currentBackgroundImage = imagePath;
    return;
  }

  const img = new Image();
  img.onload = applyBackground;
  img.onerror = applyBackground;
  img.src = imagePath;
}

function updateBackground() {
  const hour = new Date().getHours();
  const bg = getBackgroundForHour(hour);
  if (bg) {
    setBackground(bg.image);
  }
}

function initBackground() {
  updateBackground();
  setInterval(updateBackground, 60000);
}

function getLevelFromXp(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function getXpInCurrentLevel(xp) {
  return xp % XP_PER_LEVEL;
}

function getXpToNextLevel(xp) {
  return XP_PER_LEVEL - getXpInCurrentLevel(xp);
}

function getProgress() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || "null");
  if (!stored) {
    return { totalXp: 0, totalStars: 0, level: 1 };
  }
  return {
    totalXp: stored.totalXp || 0,
    totalStars: stored.totalStars || 0,
    level: getLevelFromXp(stored.totalXp || 0),
  };
}

function saveProgress(progress) {
  localStorage.setItem(
    STORAGE_KEYS.progress,
    JSON.stringify({
      totalXp: progress.totalXp,
      totalStars: progress.totalStars,
      level: getLevelFromXp(progress.totalXp),
    })
  );
}

function addReward(xp, stars) {
  const progress = getProgress();
  progress.totalXp += xp;
  progress.totalStars += stars;
  progress.level = getLevelFromXp(progress.totalXp);
  saveProgress(progress);
  renderHud();
  renderHomeProgress();
  return progress;
}

function renderHud() {
  const progress = getProgress();
  const levelEl = document.getElementById("hud-level");
  const starsEl = document.getElementById("hud-stars");
  const xpFill = document.getElementById("hud-xp-fill");
  const xpBar = xpFill?.parentElement;

  if (levelEl) levelEl.textContent = `Lv.${progress.level}`;
  if (starsEl) starsEl.textContent = `⭐ ${progress.totalStars}`;

  const xpPercent = (getXpInCurrentLevel(progress.totalXp) / XP_PER_LEVEL) * 100;
  if (xpFill) xpFill.style.width = `${xpPercent}%`;
  if (xpBar) xpBar.setAttribute("aria-valuenow", Math.round(xpPercent));
}

function renderHomeProgress() {
  const progress = getProgress();
  const el = document.getElementById("home-progress-summary");
  if (!el) return;

  if (progress.totalXp === 0 && progress.totalStars === 0) {
    el.textContent = "첫 밤 퀘스트를 시작하면 별과 XP를 모을 수 있어요.";
    return;
  }

  el.textContent = `Lv.${progress.level} · ⭐ ${progress.totalStars}개 · 다음 레벨까지 ${getXpToNextLevel(progress.totalXp)} XP`;
}

function updateHudVisibility(screenId) {
  const hud = document.getElementById("game-hud");
  if (!hud) return;
  hud.classList.toggle("hidden", !HUD_SCREENS.includes(screenId));
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
  }
  updateHudVisibility(screenId);
  if (HUD_SCREENS.includes(screenId)) {
    renderHud();
  }
}

function showRewardOverlay({ title, message, xp, stars, isFinal = false }) {
  document.getElementById("reward-title").textContent = title;
  document.getElementById("reward-message").textContent = message;
  document.getElementById("reward-gains").textContent =
    `+${xp} XP · +${stars} ⭐`;

  const continueBtn = document.getElementById("btn-reward-continue");
  continueBtn.textContent = isFinal ? "퀘스트 완료" : "다음 미션";

  const overlay = document.getElementById("reward-overlay");
  overlay.classList.remove("hidden");
}

function hideRewardOverlay() {
  document.getElementById("reward-overlay").classList.add("hidden");
}

function getStepRewardMessage(stepIndex) {
  return STEP_REWARD_MESSAGES[stepIndex] || STEP_REWARD_MESSAGES[0];
}

function renderQuestMap(containerId, activeIndex = 0, clearedCount = 0) {
  const container = document.getElementById(containerId);
  if (!container || !selectedRoutine) return;

  container.innerHTML = "";
  selectedRoutine.steps.forEach((step, index) => {
    const node = document.createElement("div");
    node.className = "quest-node";

    if (index < clearedCount) {
      node.classList.add("node--cleared");
    } else if (index === activeIndex) {
      node.classList.add("node--active");
    } else {
      node.classList.add("node--locked");
    }

    node.innerHTML =
      `<span class="node-num">${index + 1}</span>` +
      `<span class="node-label">${step.title}</span>`;
    container.appendChild(node);

    if (index < selectedRoutine.steps.length - 1) {
      const line = document.createElement("div");
      line.className = "quest-line";
      if (index < clearedCount) line.classList.add("quest-line--cleared");
      container.appendChild(line);
    }
  });
}

function trackEvent(type, payload = {}) {
  const events = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.events) || "[]"
  );
  events.push({
    id: Date.now(),
    type,
    ...payload,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
}

function getCompletionRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.records) || "[]");
}

function saveCompletionRecord(routineId) {
  const records = getCompletionRecords();
  const record = {
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    routineId,
    completed: true,
    completedAt: new Date().toISOString(),
  };
  records.push(record);
  localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeeklyCompletionCount() {
  const records = getCompletionRecords().filter((r) => r.completed);
  const weekStart = getWeekStart(new Date());
  return records.filter((r) => {
    const recordDate = new Date(r.date + "T00:00:00");
    return recordDate >= weekStart;
  }).length;
}

function clearTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function resetNextStepButton() {
  const btn = document.getElementById("btn-next-step");
  btn.textContent = "다음 단계";
  btn.disabled = true;
  rewardReady = false;
}

function updateProgressBar() {
  const step = selectedRoutine.steps[currentStepIndex];
  const stepElapsed = step.duration - remainingSeconds;
  const totalElapsed = elapsedBeforeCurrentStep + stepElapsed;
  const percent = Math.min((totalElapsed / TOTAL_ROUTINE_SECONDS) * 100, 100);

  const progressFill = document.getElementById("routine-progress");
  const progressBar = progressFill?.parentElement;
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
  if (progressBar) {
    progressBar.setAttribute("aria-valuenow", Math.round(percent));
  }
}

function renderCurrentStep() {
  const step = selectedRoutine.steps[currentStepIndex];
  document.getElementById("routine-step-label").textContent =
    `Stage ${currentStepIndex + 1}/3`;
  document.getElementById("routine-step-title").textContent = step.title;
  document.getElementById("routine-step-text").textContent = step.text;
  document.getElementById("routine-timer").textContent =
    formatTime(remainingSeconds);
  resetNextStepButton();
  renderQuestMap("routine-quest-map", currentStepIndex, currentStepIndex);
  updateProgressBar();
}

function startTimer(seconds) {
  clearTimer();
  hideRewardOverlay();
  remainingSeconds = seconds;
  currentStepDuration = seconds;
  renderCurrentStep();

  timerId = setInterval(() => {
    remainingSeconds--;
    document.getElementById("routine-timer").textContent =
      formatTime(remainingSeconds);
    updateProgressBar();

    if (remainingSeconds <= 0) {
      clearTimer();
      remainingSeconds = 0;
      document.getElementById("routine-timer").textContent = "0:00";
      const btn = document.getElementById("btn-next-step");
      btn.disabled = false;
      btn.textContent = "보상 받기";
      rewardReady = true;
      trackEvent("step_complete", {
        routineId: selectedRoutine.id,
        stepIndex: currentStepIndex,
      });
    }
  }, 1000);
}

function renderRecommendScreen() {
  if (!selectedRoutine) return;

  document.getElementById("recommend-title").textContent =
    selectedRoutine.title;
  document.getElementById("recommend-description").textContent =
    selectedRoutine.description;

  renderQuestMap("quest-map", 0, 0);

  const stepsList = document.getElementById("recommend-steps");
  stepsList.innerHTML = "";
  selectedRoutine.steps.forEach((step, index) => {
    const li = document.createElement("li");
    const mins =
      step.duration >= 60 ? `${step.duration / 60}분` : `${step.duration}초`;
    li.textContent = `Stage ${index + 1}. ${step.title} (${mins})`;
    stepsList.appendChild(li);
  });
}

function selectState(stateId) {
  selectedStateId = stateId;
  selectedRoutine = routines[stateId];
  localStorage.setItem(STORAGE_KEYS.lastState, stateId);

  document.querySelectorAll(".btn-state").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.state === stateId);
  });

  trackEvent("state_select", { stateId });
  renderRecommendScreen();
  showScreen("recommend-screen");
}

function startRoutine(routineId) {
  selectedRoutine = routines[routineId];
  currentStepIndex = 0;
  elapsedBeforeCurrentStep = 0;
  rewardReady = false;
  afterRewardAction = null;

  trackEvent("routine_start_click", { routineId });
  showScreen("routine-screen");

  const firstStep = selectedRoutine.steps[0];
  startTimer(firstStep.duration);
}

function claimStepReward() {
  if (!rewardReady || !selectedRoutine) return;

  const reward = getStepRewardMessage(currentStepIndex);
  addReward(REWARDS.stepXp, REWARDS.stepStars);

  const isLastStep =
    currentStepIndex >= selectedRoutine.steps.length - 1;

  rewardReady = false;
  document.getElementById("btn-next-step").disabled = true;
  document.getElementById("btn-next-step").textContent = "다음 단계";

  afterRewardAction = isLastStep ? "complete" : "next_step";

  showRewardOverlay({
    title: reward.title,
    message: reward.message,
    xp: REWARDS.stepXp,
    stars: REWARDS.stepStars,
    isFinal: isLastStep,
  });
}

function continueAfterReward() {
  hideRewardOverlay();

  if (afterRewardAction === "complete") {
    addReward(REWARDS.questBonusXp, REWARDS.questBonusStars);
    saveCompletionRecord(selectedRoutine.id);
    trackEvent("routine_complete", { routineId: selectedRoutine.id });

    const records = getCompletionRecords().filter((r) => r.completed);
    const progress = getProgress();

    document.getElementById("complete-bonus").textContent =
      `보너스 +${REWARDS.questBonusXp} XP · +${REWARDS.questBonusStars} ⭐ 획득!`;
    document.getElementById("complete-count").textContent =
      `총 ${records.length}번 클리어 · Lv.${progress.level} · ⭐ ${progress.totalStars}개`;

    afterRewardAction = null;
    showScreen("complete-screen");
    return;
  }

  if (afterRewardAction === "next_step") {
    elapsedBeforeCurrentStep += currentStepDuration;
    currentStepIndex++;
    afterRewardAction = null;

    const nextStep = selectedRoutine.steps[currentStepIndex];
    startTimer(nextStep.duration);
  }
}

function stopRoutine() {
  clearTimer();
  hideRewardOverlay();
  selectedRoutine = null;
  currentStepIndex = 0;
  remainingSeconds = 0;
  elapsedBeforeCurrentStep = 0;
  rewardReady = false;
  afterRewardAction = null;
  showScreen("home-screen");
}

function renderRecordsScreen() {
  const records = getCompletionRecords().filter((r) => r.completed);
  const weeklyCount = getWeeklyCompletionCount();
  const progress = getProgress();

  document.getElementById("records-weekly").textContent =
    weeklyCount > 0
      ? `이번 주에는 ${weeklyCount}번,\n밤 퀘스트를 클리어했어요.`
      : "아직 이번 주 클리어 기록이 없어요.";

  document.getElementById("records-level").textContent = `Lv.${progress.level}`;
  document.getElementById("records-stars").textContent = String(progress.totalStars);
  document.getElementById("records-xp-remaining").textContent =
    `${getXpToNextLevel(progress.totalXp)} XP`;
  document.getElementById("records-total").textContent = String(records.length);

  if (records.length > 0) {
    const last = records[records.length - 1];
    document.getElementById("records-last-date").textContent = formatDate(
      last.date
    );
    const routineTitle = routines[last.routineId]?.title || last.routineId;
    document.getElementById("records-last-routine").textContent = routineTitle;
  } else {
    document.getElementById("records-last-date").textContent = "-";
    document.getElementById("records-last-routine").textContent = "-";
  }

  const listEl = document.getElementById("records-list");
  listEl.innerHTML = "";

  if (records.length === 0) {
    const empty = document.createElement("li");
    empty.className = "records-empty";
    empty.textContent = "아직 클리어한 퀘스트가 없어요.";
    listEl.appendChild(empty);
  } else {
    [...records].reverse().slice(0, 10).forEach((record) => {
      const li = document.createElement("li");
      const title = routines[record.routineId]?.title || record.routineId;
      li.innerHTML =
        `<strong>${title}</strong><br>` +
        `<span class="record-date">${formatDate(record.date)}</span>`;
      listEl.appendChild(li);
    });
  }
}

function clearAllRecords() {
  if (
    !confirm(
      "저장된 모든 기록을 삭제할까요?\n이 작업은 되돌릴 수 없어요."
    )
  ) {
    return;
  }
  localStorage.removeItem(STORAGE_KEYS.records);
  localStorage.removeItem(STORAGE_KEYS.lastState);
  localStorage.removeItem(STORAGE_KEYS.events);
  localStorage.removeItem(STORAGE_KEYS.progress);
  renderRecordsScreen();
  renderHomeProgress();
}

function initApp() {
  trackEvent("app_open");
  initBackground();
  renderHud();
  renderHomeProgress();

  document.getElementById("btn-start").addEventListener("click", () => {
    showScreen("state-screen");
  });

  document.getElementById("btn-records").addEventListener("click", () => {
    renderRecordsScreen();
    trackEvent("record_view");
    showScreen("records-screen");
  });

  document.getElementById("btn-guide").addEventListener("click", () => {
    trackEvent("guide_view");
    showScreen("guide-screen");
  });

  document.getElementById("btn-state-back").addEventListener("click", () => {
    showScreen("home-screen");
  });

  document.querySelectorAll(".btn-state").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectState(btn.dataset.state);
    });
  });

  document.getElementById("btn-recommend-back").addEventListener("click", () => {
    showScreen("state-screen");
  });

  document.getElementById("btn-routine-start").addEventListener("click", () => {
    if (selectedRoutine) {
      startRoutine(selectedRoutine.id);
    }
  });

  document.getElementById("btn-next-step").addEventListener("click", () => {
    if (rewardReady) {
      claimStepReward();
    }
  });

  document.getElementById("btn-reward-continue").addEventListener("click", () => {
    continueAfterReward();
  });

  document.getElementById("btn-stop-routine").addEventListener("click", () => {
    stopRoutine();
  });

  document.getElementById("btn-complete-home").addEventListener("click", () => {
    renderHomeProgress();
    showScreen("home-screen");
  });

  document.getElementById("btn-complete-records").addEventListener("click", () => {
    renderRecordsScreen();
    trackEvent("record_view");
    showScreen("records-screen");
  });

  document.getElementById("btn-records-home").addEventListener("click", () => {
    renderHomeProgress();
    showScreen("home-screen");
  });

  document.getElementById("btn-clear-records").addEventListener("click", () => {
    clearAllRecords();
  });

  document.getElementById("btn-guide-home").addEventListener("click", () => {
    showScreen("home-screen");
  });
}

document.addEventListener("DOMContentLoaded", initApp);
