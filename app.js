const STORAGE_KEYS = {
  records: "mycalm_records",
  lastState: "mycalm_last_state",
  events: "mycalm_events",
};

const TOTAL_ROUTINE_SECONDS = 300;

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

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
  }
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
    `${currentStepIndex + 1}단계`;
  document.getElementById("routine-step-title").textContent = step.title;
  document.getElementById("routine-step-text").textContent = step.text;
  document.getElementById("routine-timer").textContent =
    formatTime(remainingSeconds);
  document.getElementById("btn-next-step").disabled = true;
  updateProgressBar();
}

function startTimer(seconds) {
  clearTimer();
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
      document.getElementById("btn-next-step").disabled = false;
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

  const stepsList = document.getElementById("recommend-steps");
  stepsList.innerHTML = "";
  selectedRoutine.steps.forEach((step, index) => {
    const li = document.createElement("li");
    const mins = step.duration >= 60 ? `${step.duration / 60}분` : `${step.duration}초`;
    li.textContent = `${index + 1}. ${step.title} (${mins})`;
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

  trackEvent("routine_start_click", { routineId });
  showScreen("routine-screen");

  const firstStep = selectedRoutine.steps[0];
  startTimer(firstStep.duration);
}

function goToNextStep() {
  elapsedBeforeCurrentStep += currentStepDuration;
  currentStepIndex++;

  if (currentStepIndex >= selectedRoutine.steps.length) {
    saveCompletionRecord(selectedRoutine.id);
    trackEvent("routine_complete", { routineId: selectedRoutine.id });

    const records = getCompletionRecords().filter((r) => r.completed);
    document.getElementById("complete-count").textContent =
      `지금까지 ${records.length}번, 잠들기 전 멈추는 연습을 했어요.`;

    showScreen("complete-screen");
    return;
  }

  const nextStep = selectedRoutine.steps[currentStepIndex];
  startTimer(nextStep.duration);
}

function stopRoutine() {
  clearTimer();
  selectedRoutine = null;
  currentStepIndex = 0;
  remainingSeconds = 0;
  elapsedBeforeCurrentStep = 0;
  showScreen("home-screen");
}

function renderRecordsScreen() {
  const records = getCompletionRecords().filter((r) => r.completed);
  const weeklyCount = getWeeklyCompletionCount();

  document.getElementById("records-weekly").textContent =
    weeklyCount > 0
      ? `이번 주에는 ${weeklyCount}번,\n잠들기 전 멈추는 연습을 했어요.`
      : "아직 이번 주 기록이 없어요.";

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
    empty.textContent = "아직 완료한 루틴이 없어요.";
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
  renderRecordsScreen();
}

function initApp() {
  trackEvent("app_open");

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
    goToNextStep();
  });

  document.getElementById("btn-stop-routine").addEventListener("click", () => {
    stopRoutine();
  });

  document.getElementById("btn-complete-home").addEventListener("click", () => {
    showScreen("home-screen");
  });

  document.getElementById("btn-complete-records").addEventListener("click", () => {
    renderRecordsScreen();
    trackEvent("record_view");
    showScreen("records-screen");
  });

  document.getElementById("btn-records-home").addEventListener("click", () => {
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
