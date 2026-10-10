const API_BASE = 'http://localhost:5000/api';

let algorithms = [];
let adrs = [];
let currentCategory = 'All';
let benchmarkChart = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    initBenchmarkChart();
});

async function fetchData() {
    try {
        const [algoRes, adrRes] = await Promise.all([
            fetch(`${API_BASE}/algorithms`),
            fetch(`${API_BASE}/adrs`)
        ]);
        algorithms = await algoRes.json();
        adrs = await adrRes.json();
        renderAlgorithms();
        renderADRs();
    } catch (err) {
        console.error('Error connecting to Express backend:', err);
    }
}

// Render Algorithms
function renderAlgorithms() {
    const container = document.getElementById('algoContainer');
    const search = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = algorithms.filter(algo => {
        const matchesCategory = currentCategory === 'All' || algo.category === currentCategory;
        const matchesSearch = algo.title.toLowerCase().includes(search) || 
                              algo.description.toLowerCase().includes(search) ||
                              algo.time_complexity.toLowerCase().includes(search);
        return matchesCategory && matchesSearch;
    });

    document.getElementById('algoCount').textContent = `${filtered.length} items`;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">No matching algorithms found.</div>`;
        return;
    }

    container.innerHTML = filtered.map(algo => {
        // Handle code format safely (whether it's an object/Map or plain object)
        const codeObj = algo.code instanceof Map ? Object.fromEntries(algo.code) : (algo.code || {});
        const languages = Object.keys(codeObj);
        const defaultLang = languages[0] || 'javascript';
        const defaultCode = codeObj[defaultLang] || '// No code provided';

        return `
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300">
                <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">${algo.category}</span>
                            <span class="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Time: ${algo.time_complexity}</span>
                            <span class="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Space: ${algo.space_complexity}</span>
                        </div>
                        <h3 class="text-base font-semibold text-slate-900">${algo.title}</h3>
                    </div>
                </div>
                <div class="p-5 space-y-4">
                    <p class="text-sm text-slate-600">${algo.description}</p>
                    
                    <!-- Code Block with Language Tabs -->
                    <div class="rounded-lg bg-slate-900 text-slate-100 overflow-hidden text-xs">
                        <div class="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                            <div class="flex space-x-2" id="langTabs-${algo.id || algo._id}">
                                ${languages.map((lang, idx) => `
                                    <button onclick="switchLang('${algo.id || algo._id}', '${lang}')" class="lang-tab-${algo.id || algo._id} px-2.5 py-1 rounded text-xs font-medium uppercase ${idx === 0 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'} transition-all">${lang}</button>
                                `).join('')}
                            </div>
                            <button onclick="copyCode('${algo.id || algo._id}')" class="text-slate-400 hover:text-white px-2 py-1 rounded transition-all">📋 Copy</button>
                        </div>
                        <pre class="p-4 overflow-x-auto font-mono leading-relaxed" id="codeBlock-${algo.id || algo._id}">${escapeHtml(defaultCode)}</pre>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Switch Language Snippet
function switchLang(algoId, lang) {
    const algo = algorithms.find(a => (a.id === algoId || a._id === algoId));
    if (!algo) return;
    const codeObj = algo.code instanceof Map ? Object.fromEntries(algo.code) : (algo.code || {});
    if (!codeObj[lang]) return;
    
    document.getElementById(`codeBlock-${algoId}`).textContent = codeObj[lang];
    const tabs = document.querySelectorAll(`.lang-tab-${algoId}`);
    tabs.forEach(tab => {
        if (tab.textContent.toLowerCase() === lang.toLowerCase()) {
            tab.className = `lang-tab-${algoId} px-2.5 py-1 rounded text-xs font-medium uppercase bg-indigo-600 text-white transition-all`;
        } else {
            tab.className = `lang-tab-${algoId} px-2.5 py-1 rounded text-xs font-medium uppercase text-slate-400 hover:text-white transition-all`;
        }
    });
}

function copyCode(algoId) {
    const codeText = document.getElementById(`codeBlock-${algoId}`).textContent;
    navigator.clipboard.writeText(codeText);
    alert('Code copied to clipboard!');
}

// Render ADRs
function renderADRs() {
    const container = document.getElementById('adrContainer');
    document.getElementById('adrCount').textContent = `${adrs.length} records`;

    container.innerHTML = adrs.map(adr => `
        <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold text-slate-900">${adr.title}</h4>
                <span class="text-xs px-2 py-0.5 rounded font-medium ${adr.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">${adr.status}</span>
            </div>
            <p class="text-xs text-slate-600"><strong class="text-slate-700">Context:</strong> ${adr.context}</p>
            <p class="text-xs text-slate-600"><strong class="text-slate-700">Decision:</strong> ${adr.decision}</p>
        </div>
    `).join('');
}

// Filter Hub
function filterHub() {
    renderAlgorithms();
}

function filterCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.textContent === cat) {
            btn.className = 'category-btn active px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white transition-all whitespace-nowrap';
        } else {
            btn.className = 'category-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all whitespace-nowrap';
        }
    });
    renderAlgorithms();
}

// Modals
function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('flex');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('flex');
    document.getElementById(id).classList.add('hidden');
}

// Create Algorithm
async function handleCreateAlgorithm(e) {
    e.preventDefault();
    const newAlgo = {
        title: document.getElementById('newAlgoTitle').value,
        category: document.getElementById('newAlgoCategory').value,
        time_complexity: document.getElementById('newAlgoTime').value,
        space_complexity: document.getElementById('newAlgoSpace').value,
        description: document.getElementById('newAlgoDesc').value,
        code: {
            python: document.getElementById('newAlgoPython').value,
            javascript: "// Add custom JS implementation here"
        }
    };

    const res = await fetch(`${API_BASE}/algorithms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlgo)
    });
    if (res.ok) {
        closeModal('algoModal');
        fetchData();
        e.target.reset();
    }
}

// Create ADR
async function handleCreateADR(e) {
    e.preventDefault();
    const newAdr = {
        title: document.getElementById('newAdrTitle').value,
        status: document.getElementById('newAdrStatus').value,
        context: document.getElementById('newAdrContext').value,
        decision: document.getElementById('newAdrDecision').value,
        consequences: document.getElementById('newAdrConsequences').value
    };

    const res = await fetch(`${API_BASE}/adrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdr)
    });
    if (res.ok) {
        closeModal('adrModal');
        fetchData();
        e.target.reset();
    }
}

// Chart.js Benchmark Initialization
function initBenchmarkChart() {
    const ctx = document.getElementById('benchmarkChart').getContext('2d');
    benchmarkChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'O(N log N)',
                    data: [],
                    borderColor: '#2563EB',
                    backgroundColor: '#2563EB',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'O(N²)',
                    data: [],
                    borderColor: '#94A3B8',
                    backgroundColor: '#94A3B8',
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 } } }
            }
        }
    });
    updateBenchmarkChart();
}

function updateBenchmarkChart() {
    const n = parseInt(document.getElementById('scaleSlider').value);
    document.getElementById('sliderValue').textContent = n.toLocaleString();

    const labels = [Math.floor(n*0.2), Math.floor(n*0.4), Math.floor(n*0.6), Math.floor(n*0.8), n];
    const nLogN = labels.map(val => Math.round(val * Math.log2(val || 1)));
    const nSquared = labels.map(val => Math.round((val * val) / 100)); // scaled for chart readability

    benchmarkChart.data.labels = labels;
    benchmarkChart.data.datasets[0].data = nLogN;
    benchmarkChart.data.datasets[1].data = nSquared;
    benchmarkChart.update();
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}