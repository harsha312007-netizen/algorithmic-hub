const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/algorithmic_hub';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schemas & Models
const algorithmSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    time_complexity: { type: String, required: true },
    space_complexity: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: Map, of: String, required: true }
});

const adrSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, required: true },
    context: { type: String, required: true },
    decision: { type: String, required: true },
    consequences: { type: String, required: true }
});

const Algorithm = mongoose.model('Algorithm', algorithmSchema);
const ADR = mongoose.model('ADR', adrSchema);

// Seed or Sync Comprehensive Initial Data automatically
async function seedDatabase() {
    try {
        const defaultAlgorithms = [
            {
                title: "LRU Cache Implementation",
                category: "Data Structures",
                time_complexity: "O(1)",
                space_complexity: "O(Capacity)",
                description: "Least Recently Used cache using a Hash Map and Doubly Linked List for optimal eviction.",
                code: {
                    python: "class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}",
                    javascript: "class LRUCache {\n    constructor(capacity) {\n        this.capacity = capacity;\n        this.map = new Map();\n    }\n}"
                }
            },
            {
                title: "Token Bucket Rate Limiter",
                category: "Concurrency",
                time_complexity: "O(1)",
                space_complexity: "O(N)",
                description: "Thread-safe distributed rate limiter algorithm for controlling request throughput in API gateways.",
                code: {
                    python: "import time\nclass TokenBucket:\n    def __init__(self, capacity, rate): pass",
                    javascript: "class TokenBucket {\n    constructor(capacity, refillRate) { }\n}"
                }
            },
            {
                title: "Dijkstra’s Shortest Path",
                category: "Graph Theory",
                time_complexity: "O((V + E) log V)",
                space_complexity: "O(V)",
                description: "Finds the shortest paths between nodes in a weighted graph using an optimized priority queue.",
                code: {
                    python: "import heapq\n\ndef dijkstra(graph, start):\n    distances = {node: float('inf') for node in graph}\n    distances[start] = 0\n    pq = [(0, start)]\n    while pq:\n        curr_dist, curr_node = heapq.heappop(pq)\n        if curr_dist > distances[curr_node]: continue\n        for neighbor, weight in graph[curr_node].items():\n            dist = curr_dist + weight\n            if dist < distances[neighbor]:\n                distances[neighbor] = dist\n                heapq.heappush(pq, (dist, neighbor))\n    return distances",
                    javascript: "function dijkstra(graph, start) {\n    const distances = {};\n    Object.keys(graph).forEach(node => distances[node] = Infinity);\n    distances[start] = 0;\n}"
                }
            },
            {
                title: "Merge Sort",
                category: "Sorting & Searching",
                time_complexity: "O(N log N)",
                space_complexity: "O(N)",
                description: "Stable, efficient divide-and-conquer sorting algorithm that splits arrays and merges sorted halves.",
                code: {
                    python: "def merge_sort(arr):\n    if len(arr) <= 1: return arr\n    mid = len(arr) // 2\n    left, right = merge_sort(arr[:mid]), merge_sort(arr[mid:])\n    return merge(left, right)",
                    javascript: "function mergeSort(arr) {\n    if (arr.length <= 1) return arr;\n    const mid = Math.floor(arr.length / 2);\n}"
                }
            },
            {
                title: "Binary Search Tree Operations",
                category: "Data Structures",
                time_complexity: "O(log N)",
                space_complexity: "O(N)",
                description: "Hierarchical data structure enabling efficient searching, insertion, and ordered traversal.",
                code: {
                    python: "class TreeNode:\n    def __init__(self, val=0):\n        self.val = val\n        self.left = None\n        self.right = None\n\ndef insert(root, val):\n    if not root: return TreeNode(val)\n    if val < root.val: root.left = insert(root.left, val)\n    else: root.right = insert(root.right, val)\n    return root",
                    javascript: "class TreeNode {\n    constructor(val) { this.val = val; this.left = null; this.right = null; }\n}\nfunction insert(root, val) {\n    if (!root) return new TreeNode(val);\n    if (val < root.val) root.left = insert(root.left, val);\n    else root.right = insert(root.right, val);\n    return root;\n}"
                }
            },
            {
                title: "Breadth-First Search (BFS)",
                category: "Graph Theory",
                time_complexity: "O(V + E)",
                space_complexity: "O(V)",
                description: "Iterative graph traversal algorithm exploring neighbor nodes level by level using a queue.",
                code: {
                    python: "from collections import deque\n\ndef bfs(graph, start):\n    visited, queue = set([start]), deque([start])\n    while queue:\n        node = queue.popleft()\n        for neighbor in graph.get(node, []):\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)",
                    javascript: "function bfs(graph, start) {\n    const visited = new Set([start]);\n    const queue = [start];\n    while (queue.length > 0) {\n        const node = queue.shift();\n    }\n}"
                }
            },
            {
                title: "0/1 Knapsack Problem",
                category: "Dynamic Programming",
                time_complexity: "O(N * W)",
                space_complexity: "O(N * W)",
                description: "Classic DP optimization problem finding the maximum value subset of items within weight capacity W.",
                code: {
                    python: "def knapsack(W, wt, val, n):\n    K = [[0 for x in range(W + 1)] for x in range(n + 1)]\n    for i in range(n + 1):\n        for w in range(W + 1):\n            if i == 0 or w == 0: K[i][w] = 0\n            elif wt[i-1] <= w:\n                K[i][w] = max(val[i-1] + K[i-1][w-wt[i-1]], K[i-1][w])\n            else: K[i][w] = K[i-1][w]\n    return K[n][W]",
                    javascript: "function knapsack(W, wt, val, n) {\n    // DP table approach for optimal weight-value pairing\n}"
                }
            },
            {
                title: "KMP String Pattern Matching",
                category: "String Algorithms",
                time_complexity: "O(N + M)",
                space_complexity: "O(M)",
                description: "Searches for occurrences of a pattern within a main text string using a preprocessed LPS array.",
                code: {
                    python: "def KMPSearch(pat, txt):\n    M, N = len(pat), len(txt)\n    lps = [0]*M\n    j = 0\n    computeLPSArray(pat, M, lps)\n    i = 0\n    while i < N:\n        if pat[j] == txt[i]: i, j = i + 1, j + 1\n        if j == M: j = lps[j-1]\n        elif i < N and pat[j] != txt[i]:\n            if j != 0: j = lps[j-1]\n            else: i += 1",
                    javascript: "function kmpSearch(pattern, text) {\n    // Linear time substring search implementation\n}"
                }
            },
            {
                title: "Stack Implementation",
                category: "Data Structures",
                time_complexity: "O(1) Push/Pop",
                space_complexity: "O(N)",
                description: "Linear Last-In-First-Out (LIFO) data structure supporting push, pop, and peek operations.",
                code: {
                    python: "class Stack:\n    def __init__(self):\n        self.items = []\n    def push(self, item): self.items.append(item)\n    def pop(self): return self.items.pop() if self.items else None\n    def peek(self): return self.items[-1] if self.items else None",
                    javascript: "class Stack {\n    constructor() { this.items = []; }\n    push(item) { this.items.push(item); }\n    pop() { return this.items.pop(); }\n}"
                }
            },
            {
                title: "Queue Implementation",
                category: "Data Structures",
                time_complexity: "O(1) Enqueue/Dequeue",
                space_complexity: "O(N)",
                description: "Linear First-In-First-Out (FIFO) data structure used widely in graph traversal and task scheduling.",
                code: {
                    python: "from collections import deque\nclass Queue:\n    def __init__(self):\n        self.items = deque()\n    def enqueue(self, item): self.items.append(item)\n    def dequeue(self, item): return self.items.popleft() if self.items else None",
                    javascript: "class Queue {\n    constructor() { this.items = []; }\n    enqueue(item) { this.items.push(item); }\n    dequeue() { return this.items.shift(); }\n}"
                }
            },
            {
                title: "Hash Table with Linear Probing",
                category: "Data Structures",
                time_complexity: "O(1) Average",
                space_complexity: "O(N)",
                description: "Associative array implementing open addressing and linear probing to resolve collision hashes.",
                code: {
                    python: "class LinearProbeHashTable:\n    def __init__(self, capacity=10):\n        self.capacity = capacity\n        self.keys = [None] * capacity\n        self.values = [None] * capacity\n    def put(self, key, val):\n        idx = hash(key) % self.capacity\n        while self.keys[idx] is not None:\n            if self.keys[idx] == key: self.values[idx] = val; return\n            idx = (idx + 1) % self.capacity\n        self.keys[idx], self.values[idx] = key, val",
                    javascript: "class LinearProbeHashTable {\n    constructor(capacity = 10) {\n        this.capacity = capacity;\n        this.keys = new Array(capacity).fill(null);\n        this.values = new Array(capacity).fill(null);\n    }\n}"
                }
            }
        ];

        for (const algo of defaultAlgorithms) {
            const exists = await Algorithm.findOne({ title: algo.title });
            if (!exists) {
                await Algorithm.create(algo);
            }
        }
        console.log('Database synced with all algorithms & data structures.');

        const adrCount = await ADR.countDocuments();
        if (adrCount === 0) {
            await ADR.insertMany([
                {
                    title: "ADR-001: PostgreSQL for ACID Compliance",
                    status: "Accepted",
                    context: "Microservices require reliable transactional consistency across billing ledgers.",
                    decision: "Adopt PostgreSQL with connection pooling.",
                    consequences: "Strong transactional guarantees and rich indexing support."
                },
                {
                    title: "ADR-002: MongoDB for Algorithmic Knowledge Repository",
                    status: "Accepted",
                    context: "Algorithms and multi-language code snippets have dynamic, flexible JSON-like schemas.",
                    decision: "Use MongoDB with Mongoose ODM for rapid document storage and retrieval.",
                    consequences: "Easy iteration over code maps without rigid relational migration overhead."
                }
            ]);
            console.log('Default ADRs seeded.');
        }
    } catch (err) {
        console.error('Seeding error:', err);
    }
}

seedDatabase();

// API Routes
app.get('/api/algorithms', async (req, res) => {
    try {
        const items = await Algorithm.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/algorithms', async (req, res) => {
    try {
        const newItem = new Algorithm(req.body);
        const saved = await newItem.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/adrs', async (req, res) => {
    try {
        const items = await ADR.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/health', (req, res) => {
    const isDatabaseConnected = mongoose.connection.readyState === 1;
    res.status(isDatabaseConnected ? 200 : 503).json({
        status: isDatabaseConnected ? 'ok' : 'waiting for database'
    });
});

app.post('/api/adrs', async (req, res) => {
    try {
        const newItem = new ADR(req.body);
        const saved = await newItem.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
