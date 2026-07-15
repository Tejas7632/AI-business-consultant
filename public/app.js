/**
 * Startup Blueprint Generator — Frontend Application
 *
 * Responsibilities:
 *  1. Check server health on load and update the status badge
 *  2. Collect form input and POST to /api/generate → receive { jobId }
 *  3. Open SSE stream to /api/generate/stream/:jobId
 *  4. Render live progress (progress bar + section log)
 *  5. When "done" event arrives, render the blueprint with tabs
 *  6. Copy / Download actions (Markdown + JSON)
 *
 * No external dependencies — plain vanilla JS that works in any modern browser.
 * The markdown parsing is done server-side (content is already Markdown);
 * we use a lightweight inline renderer so we don't need a CDN script.
 */

'use strict';

// ── Markdown renderer (minimal — covers the tags Granite outputs) ─────────────
const md = (() => {
  function escape(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function inline(s) {
    return s
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  }
  return function render(raw) {
    const lines = raw.split('\n');
    const out = [];
    let inCode = false, inTable = false, inUl = false, inOl = false;

    const closeUl = () => { if (inUl) { out.push('</ul>'); inUl = false; } };
    const closeOl = () => { if (inOl) { out.push('</ol>'); inOl = false; } };
    const closeTbl = () => { if (inTable) { out.push('</tbody></table>'); inTable = false; } };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Fenced code blocks
      if (line.startsWith('```')) {
        if (inCode) { out.push('</code></pre>'); inCode = false; }
        else        { closeUl(); closeOl(); closeTbl(); out.push('<pre><code>'); inCode = true; }
        continue;
      }
      if (inCode) { out.push(escape(line) + '\n'); continue; }

      // Tables
      if (line.includes('|') && line.trim().startsWith('|')) {
        const cells = line.trim().replace(/^\||\|$/g,'').split('|').map(c => c.trim());
        if (!inTable) {
          closeUl(); closeOl();
          out.push('<table><thead><tr>' + cells.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>');
          inTable = true;
          i++; // skip separator row
          continue;
        }
        // Skip separator-only rows (--- style)
        if (cells.every(c => /^[-:]+$/.test(c))) continue;
        out.push('<tr>' + cells.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>');
        continue;
      }
      if (inTable && !line.includes('|')) closeTbl();

      // Headings
      const hm = line.match(/^(#{1,4})\s+(.*)/);
      if (hm) { closeUl(); closeOl(); closeTbl(); const lvl = hm[1].length; out.push(`<h${lvl}>${inline(hm[2])}</h${lvl}>`); continue; }

      // HR
      if (/^---+$/.test(line.trim())) { closeUl(); closeOl(); closeTbl(); out.push('<hr>'); continue; }

      // Blockquote
      if (line.startsWith('> ')) { closeUl(); closeOl(); out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`); continue; }

      // Unordered list
      if (/^[-*]\s/.test(line)) {
        closeOl(); closeTbl();
        if (!inUl) { out.push('<ul>'); inUl = true; }
        out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`);
        continue;
      }

      // Ordered list
      if (/^\d+\.\s/.test(line)) {
        closeUl(); closeTbl();
        if (!inOl) { out.push('<ol>'); inOl = true; }
        out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`);
        continue;
      }

      // Blank line
      if (!line.trim()) { closeUl(); closeOl(); closeTbl(); out.push(''); continue; }

      // Paragraph
      closeUl(); closeOl(); closeTbl();
      out.push(`<p>${inline(line)}</p>`);
    }
    closeUl(); closeOl(); closeTbl();
    if (inCode) out.push('</code></pre>');
    return out.join('\n');
  };
})();

// ── DOM refs ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const form          = $('blueprint-form');
const submitBtn     = $('submit-btn');
const submitLabel   = $('submit-label');
const submitSpinner = $('submit-spinner');
const ideaTA        = $('idea');
const ideaCount     = $('idea-count');
const ideaError     = $('idea-error');
const statusBadge   = $('status-badge');

// Output panels
const emptyState    = $('empty-state');
const progressState = $('progress-state');
const resultState   = $('result-state');
const errorState    = $('error-state');

const progressBar      = $('progress-bar');
const progressPct      = $('progress-pct');
const progressSections = $('progress-sections');
const progressEta      = $('progress-eta');
const progressSubtitle = $('progress-subtitle');
const sectionLog       = $('section-log');

const resultTitle    = $('result-title');
const sectionTabs    = $('section-tabs');
const blueprintContent = $('blueprint-content');

const copyMdBtn      = $('copy-md-btn');
const downloadMdBtn  = $('download-md-btn');
const downloadJsonBtn= $('download-json-btn');
const newBtn         = $('new-btn');
const retryBtn       = $('retry-btn');
const toast          = $('toast');

// ── App state ─────────────────────────────────────────────────────────────────
let currentBlueprint = null;
let activeSection    = null;

const SECTION_ORDER = [
  'executiveSummary','businessModelCanvas','targetMarket','competitorAnalysis',
  'revenueModel','estimatedBudget','goToMarketStrategy','fundingOpportunities',
  'governmentSchemes','legalConsiderations','riskAssessment','implementationRoadmap'
];

const SECTION_SHORT_LABELS = {
  executiveSummary:      'Summary',
  businessModelCanvas:   'BMC',
  targetMarket:          'Market',
  competitorAnalysis:    'Competitors',
  revenueModel:          'Revenue',
  estimatedBudget:       'Budget',
  goToMarketStrategy:    'GTM',
  fundingOpportunities:  'Funding',
  governmentSchemes:     'Govt Schemes',
  legalConsiderations:   'Legal',
  riskAssessment:        'Risks',
  implementationRoadmap: 'Roadmap',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function showPanel(name) {
  hide(emptyState); hide(progressState); hide(resultState); hide(errorState);
  if (name === 'empty')    show(emptyState);
  if (name === 'progress') show(progressState);
  if (name === 'result')   show(resultState);
  if (name === 'error')    show(errorState);
}

function showToast(msg, duration = 2500) {
  toast.textContent = msg;
  show(toast);
  setTimeout(() => hide(toast), duration);
}

function setGenerating(isGenerating) {
  submitBtn.disabled = isGenerating;
  submitLabel.textContent = isGenerating ? 'Generating…' : 'Generate Blueprint';
  if (isGenerating) show(submitSpinner); else hide(submitSpinner);
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
}

// ── Health check ──────────────────────────────────────────────────────────────
async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (data.status === 'ok') {
      statusBadge.textContent = 'Connected';
      statusBadge.classList.remove('badge-red');
      statusBadge.classList.add('badge-green');
    } else {
      throw new Error(data.message);
    }
  } catch {
    statusBadge.textContent = 'Offline';
    statusBadge.classList.remove('badge-green');
    statusBadge.classList.add('badge-red');
  }
}

// ── Form validation ───────────────────────────────────────────────────────────
function validateForm() {
  let ok = true;
  const ideaVal = ideaTA.value.trim();
  if (ideaVal.length < 10) {
    ideaTA.classList.add('invalid');
    ideaError.textContent = 'Please describe your startup idea (at least 10 characters).';
    ideaError.classList.add('visible');
    ok = false;
  } else {
    ideaTA.classList.remove('invalid');
    ideaError.classList.remove('visible');
  }
  return ok;
}

ideaTA.addEventListener('input', () => {
  ideaCount.textContent = ideaTA.value.length;
  if (ideaTA.value.trim().length >= 10) {
    ideaTA.classList.remove('invalid');
    ideaError.classList.remove('visible');
  }
});

// ── Blueprint rendering ───────────────────────────────────────────────────────
function renderBlueprint(blueprint) {
  currentBlueprint = blueprint;

  // Set title
  const title = blueprint.startupIdea?.slice(0, 50) + (blueprint.startupIdea?.length > 50 ? '…' : '');
  resultTitle.textContent = `Blueprint: ${title}`;

  // Build tabs
  sectionTabs.innerHTML = '';
  SECTION_ORDER.forEach(key => {
    const section = blueprint[key];
    if (!section) return;
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.dataset.key = key;
    btn.textContent = SECTION_SHORT_LABELS[key] || key;
    btn.setAttribute('role', 'tab');
    btn.addEventListener('click', () => switchTab(key));
    sectionTabs.appendChild(btn);
  });

  // Show first tab
  const firstKey = SECTION_ORDER.find(k => blueprint[k]);
  if (firstKey) switchTab(firstKey);

  showPanel('result');
}

function switchTab(key) {
  activeSection = key;
  // Update tab active state
  sectionTabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.key === key);
  });
  // Render markdown content
  const section = currentBlueprint[key];
  if (!section) return;
  blueprintContent.innerHTML = md(section.content || '');
  blueprintContent.scrollTop = 0;
}

// ── SSE progress handler ──────────────────────────────────────────────────────
function startSSEStream(jobId, input) {
  showPanel('progress');
  sectionLog.innerHTML = '';

  const loggedSections = new Set();

  // Add "Connecting" log entry
  addLogEntry('Connecting to IBM watsonx.ai…', false);

  const es = new EventSource(`/api/generate/stream/${encodeURIComponent(jobId)}`);

  es.addEventListener('progress', e => {
    const p = JSON.parse(e.data);

    // Update bar
    progressBar.style.width = p.percentComplete + '%';
    progressPct.textContent = p.percentComplete + '%';
    progressSections.textContent = `${p.completedSections} / ${p.totalSections} sections`;
    progressSubtitle.textContent = `Generating: ${p.currentSection}`;
    if (p.estimatedRemainingSeconds > 0) {
      progressEta.textContent = `~${p.estimatedRemainingSeconds}s left`;
    }

    // Add section log entry once per section
    const sectionName = p.currentSection;
    if (sectionName && !loggedSections.has(sectionName) && p.percentComplete > 0) {
      loggedSections.add(sectionName);
      addLogEntry(sectionName, false);
      // Mark the previous one as done
      const items = sectionLog.querySelectorAll('.log-dot:not(.done)');
      if (items.length > 1) items[0].classList.add('done');
    }
  });

  es.addEventListener('done', e => {
    es.close();
    const data = JSON.parse(e.data);
    setGenerating(false);

    // Mark all log dots done
    sectionLog.querySelectorAll('.log-dot').forEach(d => d.classList.add('done'));
    progressBar.style.width = '100%';
    progressPct.textContent = '100%';

    renderBlueprint(data.blueprint);
  });

  es.addEventListener('error', e => {
    es.close();
    setGenerating(false);
    let msg = 'Generation failed. Please check your API credentials and try again.';
    try { msg = JSON.parse(e.data).message || msg; } catch {}
    $('error-message').textContent = msg;
    showPanel('error');
  });

  es.onerror = () => {
    es.close();
    setGenerating(false);
    $('error-message').textContent = 'Connection to the server was lost. Please try again.';
    showPanel('error');
  };
}

function addLogEntry(label, done) {
  const item = document.createElement('div');
  item.className = 'section-log-item';
  item.innerHTML = `<span class="log-dot${done ? ' done' : ''}"></span><span>${label}</span>`;
  sectionLog.appendChild(item);
  sectionLog.scrollTop = sectionLog.scrollHeight;
}

// ── Form submit ───────────────────────────────────────────────────────────────
form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validateForm()) return;

  const input = {
    idea:               $('idea').value.trim(),
    industry:           $('industry').value,
    targetGeography:    $('targetGeography').value,
    stage:              $('stage').value,
    fundingStage:       $('fundingStage').value,
    problemStatement:   $('problemStatement').value.trim() || undefined,
    founderBackground:  $('founderBackground').value.trim() || undefined,
    existingTraction:   $('existingTraction').value.trim() || undefined,
    additionalContext:  $('additionalContext').value.trim() || undefined,
  };

  setGenerating(true);

  try {
    const res  = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }
    const { jobId } = await res.json();
    startSSEStream(jobId, input);
  } catch (err) {
    setGenerating(false);
    $('error-message').textContent = err.message || 'Failed to start generation.';
    showPanel('error');
  }
});

// ── Toolbar actions ───────────────────────────────────────────────────────────
copyMdBtn.addEventListener('click', async () => {
  if (!currentBlueprint?.markdownReport) return;
  try {
    await navigator.clipboard.writeText(currentBlueprint.markdownReport);
    showToast('Markdown copied to clipboard!');
  } catch {
    showToast('Copy failed — try the Download button instead.');
  }
});

downloadMdBtn.addEventListener('click', () => {
  if (!currentBlueprint?.markdownReport) return;
  const slug = slugify(currentBlueprint.startupIdea || 'blueprint');
  downloadFile(currentBlueprint.markdownReport, `blueprint-${slug}.md`, 'text/markdown');
});

downloadJsonBtn.addEventListener('click', () => {
  if (!currentBlueprint) return;
  const slug = slugify(currentBlueprint.startupIdea || 'blueprint');
  downloadFile(JSON.stringify(currentBlueprint, null, 2), `blueprint-${slug}.json`, 'application/json');
});

newBtn.addEventListener('click', () => {
  currentBlueprint = null;
  setGenerating(false);
  showPanel('empty');
});

retryBtn.addEventListener('click', () => {
  showPanel('empty');
});

// ── Init ──────────────────────────────────────────────────────────────────────
checkHealth();
showPanel('empty');
