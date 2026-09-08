const KEY = 'glassSalary_v1';

const defaultData = {
  dailyWage: 500,
  startDay: 26,
  endDay: 25,
  baseMonth: '',
  employees: [
    { name: 'ဝန်ထမ်း ၁', wage: 500 },
    { name: 'ဝန်ထမ်း ၂', wage: 500 }
  ],
  days: {}
};

function data() {
  try {
    return {
      ...defaultData,
      ...JSON.parse(localStorage.getItem(KEY) || '{}')
    };
  } catch {
    return { ...defaultData };
  }
}

function save(d) {
  localStorage.setItem(KEY, JSON.stringify(d));
}

function money(n) {
  return '฿' + Number(n || 0).toLocaleString('en-US');
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function currentPeriod() {
  const d = data();
  const now = new Date();

  let start = new Date(
    now.getFullYear(),
    now.getMonth(),
    d.startDay
  );

  let end;

  if (d.endDay >= d.startDay) {
    end = new Date(
      now.getFullYear(),
      now.getMonth(),
      d.endDay
    );
  } else {
    end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      d.endDay
    );
  }

  if (now < start) {
    start = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      d.startDay
    );

    end = new Date(
      now.getFullYear(),
      now.getMonth(),
      d.endDay
    );
  }

  return { start, end };
}

function keyDate(dt) {
  return (
    dt.getFullYear() +
    '-' +
    pad(dt.getMonth() + 1) +
    '-' +
    pad(dt.getDate())
  );
}

function renderDashboard() {
  const d = data();
  const p = currentPeriod();

  let work = 0;
  let off = 0;

  for (
    let x = new Date(p.start);
    x <= p.end;
    x.setDate(x.getDate() + 1)
  ) {
    const k = keyDate(x);

    if (d.days[k] === 'off') {
      off++;
    } else {
      work++;
    }
  }

  const wage = document.getElementById('wage');
  const days = document.getElementById('days');
  const worked = document.getElementById('worked');
  const offEl = document.getElementById('off');
  const off2 = document.getElementById('off2');
  const salary = document.getElementById('salary');
  const period = document.getElementById('period');
  const progress = document.getElementById('progress');

  if (wage) wage.textContent = money(d.dailyWage);
  if (days) days.textContent = work;
  if (worked) worked.textContent = work;
  if (offEl) offEl.textContent = off;
  if (off2) off2.textContent = off;
  if (salary) salary.textContent = money(work * d.dailyWage);

  if (period) {
    period.textContent =
      `${keyDate(p.start)}  →  ${keyDate(p.end)}`;
  }

  if (progress) {
    const total = work + off;
    progress.style.width =
      total ? (work / total * 100) + '%' : '0%';
  }
}

let calMonth = new Date();

function initCalendar() {
  calMonth = new Date();
  renderCalendar();
}

function changeMonth(n) {
  calMonth.setMonth(calMonth.getMonth() + n);
  renderCalendar();
}

function renderCalendar() {
  const d = data();

  const y = calMonth.getFullYear();
  const m = calMonth.getMonth();

  const title = calMonth.toLocaleDateString(
    'my-MM',
    {
      year: 'numeric',
      month: 'long'
    }
  );

  const monthTitle =
    document.getElementById('monthTitle');

  const calendar =
    document.getElementById('calendar');

  if (!calendar) return;

  if (monthTitle) {
    monthTitle.textContent = title;
  }

  calendar.innerHTML = [
    'တနင်္ဂနွေ',
    'တနင်္လာ',
    'အင်္ဂါ',
    'ဗုဒ္ဓဟူး',
    'ကြာသပတေး',
    'သောကြာ',
    'စနေ'
  ]
    .map(x => `<div class="dow">${x}</div>`)
    .join('');

  const first =
    new Date(y, m, 1).getDay();

  const days =
    new Date(y, m + 1, 0).getDate();

  for (let i = 0; i < first; i++) {
    calendar.innerHTML +=
      '<div class="day empty"></div>';
  }

  for (let n = 1; n <= days; n++) {
    const dt = new Date(y, m, n);
    const k = keyDate(dt);

    const isOff =
      d.days[k] === 'off';

    calendar.innerHTML += `
      <div
        class="day ${isOff ? 'off' : 'work'}"
        onclick="toggleDay('${k}')"
      >
        <div class="daynum">${n}</div>
        <div class="daylabel">
          ${isOff ? 'ပိတ်ရက်' : 'အလုပ်ဆင်း'}
        </div>
      </div>
    `;
  }
}

function toggleDay(k) {
  const d = data();

  d.days[k] =
    d.days[k] === 'off'
      ? 'work'
      : 'off';

  save(d);
  renderCalendar();

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }
}

function setAll(type) {
  const d = data();

  const y = calMonth.getFullYear();
  const m = calMonth.getMonth();

  const days =
    new Date(y, m + 1, 0).getDate();

  for (let n = 1; n <= days; n++) {
    d.days[
      keyDate(new Date(y, m, n))
    ] = type;
  }

  save(d);
  renderCalendar();
}

function saveAndRefresh() {
  renderCalendar();

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }

  alert('သိမ်းပြီးပါပြီ ✓');
}

function initSettings() {
  const d = data();

  const dailyWage =
    document.getElementById('dailyWage');

  const startDay =
    document.getElementById('startDay');

  const endDay =
    document.getElementById('endDay');

  const baseMonth =
    document.getElementById('baseMonth');

  if (dailyWage) {
    dailyWage.value = d.dailyWage;
  }

  if (startDay) {
    startDay.value = d.startDay;
  }

  if (endDay) {
    endDay.value = d.endDay;
  }

  if (baseMonth) {
    baseMonth.value =
      d.baseMonth ||
      new Date().toISOString().slice(0, 7);
  }
}

function saveSettings() {
  const d = data();

  const dailyWage =
    document.getElementById('dailyWage');

  const startDay =
    document.getElementById('startDay');

  const endDay =
    document.getElementById('endDay');

  const baseMonth =
    document.getElementById('baseMonth');

  if (dailyWage) {
    d.dailyWage =
      Number(dailyWage.value) || 0;
  }

  if (startDay) {
    d.startDay =
      Math.min(
        31,
        Math.max(
          1,
          Number(startDay.value) || 1
        )
      );
  }

  if (endDay) {
    d.endDay =
      Math.min(
        31,
        Math.max(
          1,
          Number(endDay.value) || 1
        )
      );
  }

  if (baseMonth) {
    d.baseMonth =
      baseMonth.value;
  }

  d.employees =
    (d.employees || []).map(e => ({
      ...e,
      wage: d.dailyWage
    }));

  save(d);

  const toast =
    document.getElementById('toast');

  if (toast) {
    toast.textContent =
      'ဆက်တင်များ သိမ်းပြီးပါပြီ ✓';
  }
}

function addEmployee() {
  const name =
    prompt('ဝန်ထမ်းအမည်ထည့်ပါ');

  if (!name) return;

  const d = data();

  d.employees.push({
    name: name,
    wage: d.dailyWage
  });

  save(d);
  renderEmployees();
}

function renderEmployees() {
  const d = data();

  const el =
    document.getElementById('employees');

  if (!el) return;

  el.innerHTML =
    d.employees
      .map((e, i) => `
        <div class="employee">

          <div class="empinfo">

            <div class="avatar">
              ${e.name.trim().charAt(0)}
            </div>

            <div>
              <div class="empname">
                ${e.name}
              </div>

              <div class="empmeta">
                နေ့စဉ်လုပ်ခ
                ${money(e.wage || d.dailyWage)}
              </div>
            </div>

          </div>

          <div>
            <b>
              ${money(
                (e.wage || d.dailyWage) *
                countWorkDays()
              )}
            </b>

            <div class="empmeta">
              ခန့်မှန်းလစာ
            </div>
          </div>

        </div>
      `)
      .join('');
}

function countWorkDays() {
  const p = currentPeriod();
  const d = data();

  let w = 0;

  for (
    let x = new Date(p.start);
    x <= p.end;
    x.setDate(x.getDate() + 1)
  ) {
    if (
      d.days[keyDate(x)] !== 'off'
    ) {
      w++;
    }
  }

  return w;
}
