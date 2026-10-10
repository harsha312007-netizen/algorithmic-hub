const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (update URI if using MongoDB Atlas)
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

// Seed Initial Data if Database is Empty
async function seedDatabase() {
    try {
        const algoCount = await Algorithm.countDocuments();
        if (algoCount === 0) {
            await Algorithm.insertMany([
                {
                    title: "LRU Cache Implementation",
                    category: "Data Structures",
                    time_complexity: "O(1) Get/Put",
                    space_complexity: "O(Capacity)",
                    description: "Least Recently Used cache using a Hash Map and Doubly Linked List for optimal eviction.",
                    code: {
                        python: "class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}",
                        cpp: "class LRUCache {\n    int cap;\npublic:\n    LRUCache(int capacity) : cap(capacity) {}\n};",
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
                        cpp: "class TokenBucket {\npublic:\n    TokenBucket(double cap, double rate) {}\n};",
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
                        javascript: "function mergeSort(arr) {\n    if (arr.length <= 1) return arr;\n    const mid = Math.floor(arr.length / 2);\n    // Merge logic here...\n}"
                    }
                }
            ]);
            console.log('Default algorithms seeded.');
        }

        const adrCount = await ADR.countDocuments();
        if (adrCount === 0) {
            await ADR.insertMany([
                {
                    title: "ADR-001: PostgreSQL for ACID Compliance",
                    status: "Accepted",
                    context: "Microservices require reliable transactional consistency across billing ledgers.",
                    decision: "Adopt PostgreSQL with connection pooling.",
                    consequences: "Strong transactional guarantees and rich indexing support."
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

app.post('/api/adrs', async (req, res) => {
    try {
        const newItem = new ADR(req.body);
        const saved = await newItem.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
