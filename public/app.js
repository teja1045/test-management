const state = {
  meta: { validStatus: [], validSeverity: [] },
  defects: [],
  dashboard: null
};

const summaryEl = document.getElementById('summary');
const severityBarsEl = document.getElementById('severityBars');
const defectTableBody = document.getElementById('defectTableBody');
const createDefectForm = document.getElementById('createDefectForm');
const messageEl = document.getElementById('message');
const statusSelect = document.getElementById('statusSelect');
const severitySelect = document.getElementById('severitySelect');
const filterStatus = document.getElementById('filterStatus');
const filterSeverity = document.getElementById('filterSeverity');
const searchInput = document.getElementById('searchInput');

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Request failed');
  }
  return response.json();
}

function renderSelectors() {
  const statuses = state.meta.validStatus.map((s) => `<option value="${s}">${s}</option>`).join('');
  const severities = state.meta.validSeverity.map((s) => `<option value="${s}">${s}</option>`).join('');

  statusSelect.innerHTML = statuses;
  severitySelect.innerHTML = severities;
  filterStatus.innerHTML = '<option value="">All Status</option>' + statuses;
  filterSeverity.innerHTML = '<option value="">All Severity</option>' + severities;
}

function renderDashboard() {
  const d = state.dashboard;
  if (!d) return;

  const metrics = [
    ['Total', d.summary.total],
    ['Open', d.summary.open],
    ['In Progress', d.summary.inProgress],
    ['Resolved', d.summary.resolved],
    ['Closed', d.summary.closed]
  ];

  summaryEl.innerHTML = metrics
    .map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`)
    .join('');

  const max = Math.max(...Object.values(d.bySeverity), 1);
  severityBarsEl.innerHTML = Object.entries(d.bySeverity)
    .map(([label, value]) => {
      const width = (value / max) * 100;
      return `
        <div class="bar">
          <span>${label}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
          <strong>${value}</strong>
        </div>`;
    })
    .join('');
}

function renderDefects() {
  if (!state.defects.length) {
    defectTableBody.innerHTML = '<tr><td colspan="7">No defects found</td></tr>';
    return;
  }

  defectTableBody.innerHTML = state.defects
    .map((d) => `
      <tr>
        <td>${d.id}</td>
        <td>${d.title}</td>
        <td>
          <select onchange="updateStatus('${d.id}', this.value)">
            ${state.meta.validStatus
              .map((status) => `<option value="${status}" ${status === d.status ? 'selected' : ''}>${status}</option>`)
              .join('')}
          </select>
        </td>
        <td>${d.severity}</td>
        <td>${d.assignee}</td>
        <td>${new Date(d.updatedAt).toLocaleString()}</td>
        <td><button class="delete" onclick="removeDefect('${d.id}')">Delete</button></td>
      </tr>`)
    .join('');
}

async function loadDefects() {
  const params = new URLSearchParams();
  if (filterStatus.value) params.set('status', filterStatus.value);
  if (filterSeverity.value) params.set('severity', filterSeverity.value);
  if (searchInput.value) params.set('q', searchInput.value);
  state.defects = await api(`/api/defects?${params.toString()}`);
  renderDefects();
}

async function refresh() {
  state.dashboard = await api('/api/dashboard');
  renderDashboard();
  await loadDefects();
}

createDefectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(createDefectForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await api('/api/defects', { method: 'POST', body: JSON.stringify(payload) });
    messageEl.textContent = 'Defect added successfully.';
    createDefectForm.reset();
    statusSelect.value = 'Open';
    severitySelect.value = 'Medium';
    await refresh();
  } catch (error) {
    messageEl.textContent = error.message;
  }
});

window.updateStatus = async (id, status) => {
  try {
    await api(`/api/defects/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await refresh();
  } catch (error) {
    messageEl.textContent = error.message;
  }
};

window.removeDefect = async (id) => {
  if (!confirm(`Delete defect ${id}?`)) return;
  try {
    await api(`/api/defects/${id}`, { method: 'DELETE' });
    await refresh();
  } catch (error) {
    messageEl.textContent = error.message;
  }
};

[filterStatus, filterSeverity].forEach((el) => el.addEventListener('change', loadDefects));
searchInput.addEventListener('input', loadDefects);

(async function init() {
  state.meta = await api('/api/meta');
  renderSelectors();
  statusSelect.value = 'Open';
  severitySelect.value = 'Medium';
  await refresh();
})();
