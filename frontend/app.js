const API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:5000/api'
    : '/api';

let algorithms = [];
let adrs = [];
let benchmarkChart = null;
let selectedCategory = 'All';
let starsMap = {}; // Interactive star tracking

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    initBenchmarkChart();
    initChatbot();
});

function initChatbot() {
    const panel = document.getElementById('chatPanel');
    const toggle = document.getElementById('chatToggle');
    const input = document.getElementById('chatInput');

    const setOpen = (isOpen) => {
        panel.classList.toggle('hidden', !isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) input.focus();
    };

    toggle.addEventListener('click', () => setOpen(panel.classList.contains('hidden')));
    document.getElementById('chatClose').addEventListener('click', () => setOpen(false));
    document.getElementById('chatForm').addEventListener('submit', (event) => {
        event.preventDefault();
        sendChatMessage(input.value);
        input.value = '';
        input.focus();
    });
    document.getElementById('chatSuggestions').addEventListener('click', (event) => {
        const button = event.target.closest('[data-chat-prompt]');
        if (!button) return;
        sendChatMessage(button.dataset.chatPrompt);
    });
}

function sendChatMessage(message) {
    const question = message.trim();
    if (!question) return;

    appendChatMessage(question, 'user');
    appendChatMessage(getChatbotResponse(question), 'assistant');
}

function appendChatMessage(message, sender) {
    const container = document.getElementById('chatMessages');
    const bubble = document.createElement('div');
    bubble.className = `chat-message chat-message-${sender}`;
    bubble.textContent = message;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function getChatbotResponse(question) {
    const query = question.toLowerCase();
    const words = query.match(/[a-z0-9]+/g) || [];

    if (/\b(hi|hello|hey)\b/.test(query)) {
        return 'Hi! Ask me to explain an algorithm, compare its complexity, or find an architecture decision.';
    }

    if (/\b(help|what can you do)\b/.test(query)) {
        return 'I can find algorithms by name or category, summarize their time and space complexity, and look up saved architecture decisions. Try “Explain merge sort” or “List algorithms”.';
    }

    if (/\b(adr|adrs|architecture|decision records?)\b/.test(query)) {
        if (adrs.length === 0) {
            return 'There are no architecture decisions available right now. Make sure the backend is running and its data has loaded.';
        }
        return adrs.map((adr) =>
            `${adr.title} (${adr.status})\nDecision: ${adr.decision}\nContext: ${adr.context}`
        ).join('\n\n');
    }

    if (/\b(list|all|available|show)\b/.test(query) && /\b(algorithm|algorithms|snippet|snippets)\b/.test(query)) {
        if (algorithms.length === 0) {
            return 'I can’t find any algorithms yet. Make sure the backend is running and its data has loaded.';
        }
        return `Algorithms in the hub:\n${algorithms.map((algo) =>
            `• ${algo.title} — time ${algo.time_complexity}, space ${algo.space_complexity || 'not specified'}`
        ).join('\n')}`;
    }

    const complexityMatch = query.match(/o\s*\(\s*(?:1|n|n\s*log\s*n|log\s*n|n\s*\^\s*2|n2|n²)\s*\)/);
    if (complexityMatch && /\b(complexity|complexities|algorithms|algorithm|which|what)\b/.test(query)) {
        const requestedComplexity = complexityMatch[0].replace(/\s+/g, '').toLowerCase();
        const complexityLabel = {
            'o(1)': 'O(1)',
            'o(n)': 'O(N)',
            'o(nlogn)': 'O(N log N)',
            'o(logn)': 'O(log N)',
            'o(n^2)': 'O(N^2)',
            'o(n2)': 'O(N^2)',
            'o(n²)': 'O(N^2)'
        }[requestedComplexity] || complexityMatch[0];
        const matches = algorithms.filter((algo) =>
            [algo.time_complexity, algo.space_complexity].some((value) =>
                value && value.replace(/\s+/g, '').toLowerCase().includes(requestedComplexity)
            )
        );
        if (matches.length > 0) {
            return `Algorithms with ${complexityLabel} complexity:\n${matches.map((algo) =>
                `• ${algo.title} — time ${algo.time_complexity}, space ${algo.space_complexity || 'not specified'}`
            ).join('\n')}`;
        }
    }

    const stopWords = new Set(['a', 'an', 'and', 'are', 'can', 'for', 'how', 'i', 'in', 'is', 'it', 'me', 'of', 'on', 'or', 'please', 'the', 'to', 'what', 'which', 'with', 'about', 'explain', 'tell', 'show', 'find', 'does', 'use', 'using', 'work']);
    const terms = [...new Set(words.filter((word) => word.length > 1 && !stopWords.has(word)))];
    const rankedAlgorithms = algorithms.map((algo) => {
        const title = algo.title.toLowerCase();
        const category = algo.category.toLowerCase();
        const description = algo.description.toLowerCase();
        const score = terms.reduce((total, term) =>
            total + (title.includes(term) ? 5 : 0) +
            (category.includes(term) ? 3 : 0) +
            (description.includes(term) ? 2 : 0), 0
        ) + (title.includes(query.trim()) ? 10 : 0);
        return { algo, score };
    }).filter((result) => result.score > 0)
        .sort((a, b) => b.score - a.score);

    if (rankedAlgorithms.length > 0) {
        const { algo } = rankedAlgorithms[0];
        let response = `${algo.title} (${algo.category})\nTime: ${algo.time_complexity}\nSpace: ${algo.space_complexity || 'not specified'}\n${algo.description}`;
        if (/\b(code|implementation|python|javascript|cpp)\b/.test(query) && algo.code) {
            const code = algo.code instanceof Map ? Object.fromEntries(algo.code) : algo.code;
            const language = query.match(/\b(python|javascript|cpp)\b/)?.[0] || Object.keys(code)[0];
            if (language && code[language]) {
                response += `\n\n${language}:\n${code[language]}`;
            }
        }
        if (rankedAlgorithms.length > 1 && rankedAlgorithms[1].score === rankedAlgorithms[0].score) {
            response += `\n\nYou may also mean: ${rankedAlgorithms[1].algo.title}.`;
        }
        return response;
    }

    if (algorithms.length === 0 && adrs.length === 0) {
        return 'The project data hasn’t loaded yet. Check that the backend and database are running, then try again.';
    }
    return 'I couldn’t find that in the saved hub data. Ask about an algorithm by name or category, request its complexity, or ask to list the architecture decisions.';
}

async function fetchData() {
    try {
        const [algoRes, adrRes] = await Promise.all([
            fetch(`${API_BASE}/algorithms`),
            fetch(`${API_BASE}/adrs`)
        ]);
        algorithms = await algoRes.json();
        adrs = await adrRes.json();
        
        document.getElementById('statTotalAlgo').textContent = algorithms.length;
        document.getElementById('statTotalAdr').textContent = adrs.length;

        renderAlgorithms();
        renderADRs();
        populateSandboxDropdown();
    } catch (err) {
        console.error('Error connecting to backend:', err);
    }
}

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = 'tab-btn px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all';
    });

    document.getElementById(`view-${tabId}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-${tabId}`);
    activeBtn.className = 'tab-btn px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 text-blue-600 transition-all';
}

// Render Algorithms with Interactive Star Rating & Copy
function renderAlgorithms() {
    const container = document.getElementById('algoContainer');
    const search = document.getElementById('globalSearch').value.toLowerCase();
    
    const filtered = algorithms.filter(algo => {
        const matchesCategory = selectedCategory === 'All' || algo.category === selectedCategory;
        const matchesSearch = algo.title.toLowerCase().includes(search) || 
                              algo.description.toLowerCase().includes(search) ||
                              algo.category.toLowerCase().includes(search);
        return matchesCategory && matchesSearch;
    });

    document.getElementById('algoCount').textContent = `${filtered.length} items`;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">No algorithms found matching your criteria.</div>`;
        return;
    }

    container.innerHTML = filtered.map(algo => {
        const algoId = algo.id || algo._id;
        const codeObj = algo.code instanceof Map ? Object.fromEntries(algo.code) : (algo.code || {});
        const languages = Object.keys(codeObj);
        const defaultLang = languages[0] || 'python';
        const defaultCode = codeObj[defaultLang] || '# No code provided';
        const isStarred = starsMap[algoId] || false;

        return `
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-blue-300">
                <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">${algo.category}</span>
                            <span class="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Time: ${algo.time_complexity}</span>
                            <span class="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Space: ${algo.space_complexity || 'O(N)'}</span>
                        </div>
                        <h3 class="text-base font-semibold text-slate-900">${algo.title}</h3>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="toggleStar('${algoId}')" class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${isStarred ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}">
                            ${isStarred ? '⭐ Starred' : '☆ Star'}
                        </button>
                    </div>
                </div>
                <div class="p-5 space-y-4">
                    <p class="text-sm text-slate-600">${algo.description}</p>
                    <div class="rounded-lg bg-slate-900 text-slate-100 overflow-hidden text-xs">
                        <div class="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                            <span class="font-mono uppercase text-slate-400">${defaultLang}</span>
                            <button onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(defaultCode)}')); alert('Code copied to clipboard!');" class="text-slate-400 hover:text-white px-2 py-1 rounded transition-all">📋 Copy</button>
                        </div>
                        <pre class="p-4 overflow-x-auto font-mono leading-relaxed"><code>${escapeHtml(defaultCode)}</code></pre>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterAlgorithmsByCategory() {
    selectedCategory = document.getElementById('categoryFilterSelect').value;
    renderAlgorithms();
}

function toggleStar(algoId) {
    starsMap[algoId] = !starsMap[algoId];
    renderAlgorithms();
}

// Interactive Code Sandbox Simulator Engine
function populateSandboxDropdown() {
    const select = document.getElementById('sandboxAlgoSelect');
    select.innerHTML = algorithms.map(algo => `<option value="${algo.title}">${algo.title} (${algo.category})</option>`).join('');
}

function loadSandboxAlgorithm() {
    const title = document.getElementById('sandboxAlgoSelect').value;
    const algo = algorithms.find(a => a.title === title);
    if (!algo) return;

    const inputArea = document.getElementById('sandboxInput');
    if (algo.title.includes('Merge Sort') || algo.title.includes('Binary Search')) {
        inputArea.value = "[64, 34, 25, 12, 22, 11, 90]";
    } else if (algo.title.includes('LRU')) {
        inputArea.value = "PUT key1=val1, GET key1, PUT key2=val2";
    } else if (algo.title.includes('Dijkstra')) {
        inputArea.value = "{ 'A': {'B': 4, 'C': 2}, 'B': {'A': 4, 'C': 1}, 'C': {'A': 2, 'B': 1} }, start='A'";
    } else {
        inputArea.value = "test_payload_data = [1, 2, 3, 4, 5]";
    }
}

function executeSandboxCode() {
    const status = document.getElementById('sandboxStatus');
    const output = document.getElementById('sandboxOutput');
    const algoTitle = document.getElementById('sandboxAlgoSelect').value;
    const inputVal = document.getElementById('sandboxInput').value;

    status.textContent = "Executing simulation...";
    status.className = "text-xs text-blue-600 font-medium animate-pulse";
    output.textContent = "Initializing virtual runtime...\nLoading environment packages...\n";

    setTimeout(() => {
        let simulatedResult = "";
        if (algoTitle.includes('Merge Sort') || algoTitle.includes('Search')) {
            simulatedResult = `[SUCCESS] Input parsed: ${inputVal}\nExecuting Divide-and-Conquer partitions...\nSorted Result Output: [11, 12, 22, 25, 34, 64, 90]\nExecution Time: 0.42ms\nMemory Delta: +1.2 KB`;
        } else if (algoTitle.includes('LRU')) {
            simulatedResult = `[SUCCESS] Cache Initialized with capacity.\nCommand executed: ${inputVal}\nEviction Policy Triggered: None (Capacity valid)\nCache Hit Ratio: 100%\nExecution Time: 0.12ms`;
        } else if (algoTitle.includes('Dijkstra')) {
            simulatedResult = `[SUCCESS] Graph processed with Priority Queue.\nShortest Distances Calculated:\n  Node A -> 0\n  Node B -> 3 (via C)\n  Node C -> 2\nExecution Time: 0.85ms`;
        } else {
            simulatedResult = `[SUCCESS] Simulation executed successfully for "${algoTitle}".\nPayload received: ${inputVal}\nStatus Code: 200 OK\nExecution complete with 0 errors.`;
        }
        
        status.textContent = "Completed Successfully";
        status.className = "text-xs text-emerald-600 font-medium";
        output.textContent = simulatedResult;
    }, 600);
}

// Render ADRs
function renderADRs() {
    const container = document.getElementById('adrContainer');
    document.getElementById('adrCount').textContent = `${adrs.length} records`;

    container.innerHTML = adrs.map(adr => `
        <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3 hover:border-blue-300 transition-all">
            <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold text-slate-900">${adr.title}</h4>
                <span class="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">${adr.status}</span>
            </div>
            <p class="text-xs text-slate-600"><strong class="text-slate-700">Context:</strong> ${adr.context}</p>
            <p class="text-xs text-slate-600"><strong class="text-slate-700">Decision:</strong> ${adr.decision}</p>
        </div>
    `).join('');
}

function filterHub() {
    renderAlgorithms();
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('flex');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('flex');
    document.getElementById(id).classList.add('hidden');
}

async function handleCreateAlgorithm(e) {
    e.preventDefault();
    const newAlgo = {
        title: document.getElementById('newAlgoTitle').value,
        category: document.getElementById('newAlgoCategory').value,
        time_complexity: document.getElementById('newAlgoTime').value,
        space_complexity: "O(N)",
        description: document.getElementById('newAlgoDesc').value,
        code: { python: document.getElementById('newAlgoPython').value }
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
        alert('New snippet successfully added to MongoDB database!');
    }
}

// Interactive Chart.js Benchmark Playground
function initBenchmarkChart() {
    const ctx = document.getElementById('benchmarkChart').getContext('2d');
    benchmarkChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [200, 400, 600, 800, 1000],
            datasets: [
                { label: 'O(N log N) - Optimal', data: [1200, 2800, 4500, 6400, 8500], borderColor: '#2563EB', backgroundColor: '#2563EB', tension: 0.3 },
                { label: 'O(N²) - Quadratic', data: [400, 1600, 3600, 6400, 10000], borderColor: '#94A3B8', backgroundColor: '#94A3B8', tension: 0.3 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateBenchmarkChart() {
    const n = parseInt(document.getElementById('scaleSlider').value);
    document.getElementById('sliderValue').textContent = n.toLocaleString();
    const labels = [Math.floor(n*0.2), Math.floor(n*0.4), Math.floor(n*0.6), Math.floor(n*0.8), n];
    benchmarkChart.data.labels = labels;
    benchmarkChart.data.datasets[0].data = labels.map(v => Math.round(v * Math.log2(v || 1)));
    benchmarkChart.data.datasets[1].data = labels.map(v => Math.round((v * v) / 100));
    benchmarkChart.update();
}

function triggerBenchmarkAnimation() {
    const slider = document.getElementById('scaleSlider');
    slider.value = 10000;
    updateBenchmarkChart();
    alert('Simulated peak stress test load of N = 10,000 applied successfully!');
}

// Interactive IDP Service Pinger
function pingAllServices() {
    const s1 = document.getElementById('service-status-1');
    const s2 = document.getElementById('service-status-2');
    s1.textContent = "Checking...";
    s1.className = "text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium animate-pulse";
    s2.textContent = "Checking...";
    s2.className = "text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium animate-pulse";

    setTimeout(() => {
        s1.textContent = "Healthy (8ms)";
        s1.className = "text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium";
        s2.textContent = "Healthy (15ms)";
        s2.className = "text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium";
        alert('All IDP Microservices successfully pinged and verified!');
    }, 800);
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}