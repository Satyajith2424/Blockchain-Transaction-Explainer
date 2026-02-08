let searchHistory = JSON.parse(localStorage.getItem('txHistory')) || [];
let currentMode = 'beginner';
let currentTransaction = null;

// DOM Elements
const transactionHashInput = document.getElementById('transactionHash');
const pasteBtn = document.getElementById('pasteBtn');
const beginnerModeBtn = document.getElementById('beginnerMode');
const expertModeBtn = document.getElementById('expertMode');
const modeDescription = document.getElementById('modeDescription');
const explainBtn = document.getElementById('explainBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const resultsTab = document.getElementById('resultsTab');
const historyTab = document.getElementById('historyTab');
const resultsContent = document.getElementById('resultsContent');
const historyContent = document.getElementById('historyContent');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Result elements
const resultHash = document.getElementById('resultHash');
const resultStatus = document.getElementById('resultStatus');
const fromAddress = document.getElementById('fromAddress');
const toAddress = document.getElementById('toAddress');
const amount = document.getElementById('amount');
const gasUsed = document.getElementById('gasUsed');
const transactionType = document.getElementById('transactionType');
const timestamp = document.getElementById('timestamp');
const explanation = document.querySelector('#explanation p');
const copyHashBtn = document.getElementById('copyHashBtn');

// Initialize
function init() {
    updateModeUI();
    loadHistory();
    setupEventListeners();

    // Try to load last transaction from localStorage.
    const lastTx = localStorage.getItem('lastTransaction');
    if (lastTx) {
        try {
            const tx = JSON.parse(lastTx);
            displayTransaction(tx);
            resultsSection.classList.remove('hidden');
        } catch (e) {
            console.error('Error loading last transaction:', e);
            // If last transaction is corrupted, check history
            checkAndShowHistory();
        }
    } else {
        // No last transaction, check history
        checkAndShowHistory();
    }
}

function checkAndShowHistory() {
    if (searchHistory.length > 0) {
        resultsSection.classList.remove('hidden');
        showHistoryTab();
    }
}

function setupEventListeners() {
    // Paste button
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            transactionHashInput.value = text;
            showToast('Transaction hash pasted!', 'success');
        } catch (err) {
            showToast('Unable to paste from clipboard', 'error');
        }
    });

    // Mode selection
    beginnerModeBtn.addEventListener('click', () => {
        currentMode = 'beginner';
        updateModeUI();
    });

    expertModeBtn.addEventListener('click', () => {
        currentMode = 'expert';
        updateModeUI();
    });

    // Explain button
    explainBtn.addEventListener('click', explainTransaction);

    // Enter key in input field
    transactionHashInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            explainTransaction();
        }
    });

    // Tab switching
    resultsTab.addEventListener('click', () => {
        showResultsTab();
    });

    historyTab.addEventListener('click', () => {
        showHistoryTab();
    });

    // Clear history
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Copy hash button
    copyHashBtn.addEventListener('click', copyHashToClipboard);
}

function updateModeUI() {
    if (currentMode === 'beginner') {
        beginnerModeBtn.classList.add('border-primary-500', 'bg-primary-50', 'text-primary-700');
        beginnerModeBtn.classList.remove('border-gray-300', 'text-gray-600');
        expertModeBtn.classList.add('border-gray-300', 'text-gray-600');
        expertModeBtn.classList.remove('border-primary-500', 'bg-primary-50', 'text-primary-700');
        modeDescription.textContent = 'Simple explanations with everyday analogies';
    } else {
        expertModeBtn.classList.add('border-primary-500', 'bg-primary-50', 'text-primary-700');
        expertModeBtn.classList.remove('border-gray-300', 'text-gray-600');
        beginnerModeBtn.classList.add('border-gray-300', 'text-gray-600');
        beginnerModeBtn.classList.remove('border-primary-500', 'bg-primary-50', 'text-primary-700');
        modeDescription.textContent = 'Technical details and blockchain terminology';
    }
}

async function explainTransaction() {
    const hash = transactionHashInput.value.trim();

    if (!hash) {
        showToast('Please enter a transaction hash', 'error');
        return;
    }

    if (!hash.startsWith('0x') || hash.length !== 66) {
        showToast('Please enter a valid Ethereum transaction hash (0x followed by 64 characters)', 'error');
        return;
    }

    // Show loading
    loadingIndicator.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    explainBtn.disabled = true;
    explainBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';

    // Allow time for UI update
    await new Promise(r => setTimeout(r, 100));

    try {
        const response = await fetch('/explain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hash: hash,
                mode: currentMode
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch transaction details');
        }

        // Add to history
        addToHistory(data);

        // Display results
        displayTransaction(data);
        resultsSection.classList.remove('hidden');

        showToast('Transaction analyzed successfully!', 'success');

    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'error');
    } finally {
        // Hide loading
        loadingIndicator.classList.add('hidden');
        explainBtn.disabled = false;
        explainBtn.innerHTML = '<i class="fas fa-search mr-2"></i> Explain Transaction';
    }
}

function displayTransaction(tx) {
    currentTransaction = tx;

    // Update UI elements
    resultHash.textContent = tx.hash;
    fromAddress.textContent = tx.from;
    toAddress.textContent = tx.to;
    amount.textContent = `${tx.amount} ETH`;
    gasUsed.textContent = tx.gasUsed;
    transactionType.textContent = tx.transactionType;
    timestamp.textContent = tx.timestamp;
    explanation.textContent = tx.explanation;

    // Update status badge
    resultStatus.textContent = tx.status;
    resultStatus.className = 'px-3 py-1 rounded-full text-sm font-medium ' +
        (tx.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');

    // Update transaction type badge
    transactionType.className = 'px-3 py-1 rounded-full text-sm font-medium ' +
        (tx.transactionType === 'Transfer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800');



    // Save to localStorage
    localStorage.setItem('lastTransaction', JSON.stringify(tx));
}

function addToHistory(tx) {
    if (!tx || !tx.hash) {
        console.error("Invalid transaction data for history:", tx);
        return;
    }

    // Check if already in history
    const existingIndex = searchHistory.findIndex(item => item.hash === tx.hash);

    const historyItem = {
        hash: tx.hash,
        from: tx.from || "",
        to: tx.to || "",
        amount: tx.amount || "",
        gasUsed: tx.gasUsed || "",
        status: tx.status || "",
        transactionType: tx.transactionType || tx.type || "",
        mode: currentMode,
        explanation: tx.explanation || "",
        timestamp: tx.timestamp || "",
        searchedAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
        searchHistory[existingIndex] = historyItem;
    } else {
        searchHistory.unshift(historyItem);

        // Keep only last 10 items
        if (searchHistory.length > 10) {
            searchHistory = searchHistory.slice(0, 10);
        }
    }

    // Save to localStorage
    localStorage.setItem('txHistory', JSON.stringify(searchHistory));

    // Update UI
    loadHistory();
}


function loadHistory() {
    searchHistory = JSON.parse(localStorage.getItem('txHistory')) || [];
    if (searchHistory.length === 0) {
        historyList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-history text-3xl mb-3"></i>
                <p>No search history yet</p>
                <p class="text-sm mt-1">Your searched transactions will appear here</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = searchHistory.map((item, index) => `
        <div class="history-item bg-gray-50 hover:bg-gray-100 rounded-lg p-4" data-hash="${item.hash}">
            <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center mb-1">
                        <code class="text-sm font-mono text-gray-800 truncate">${item.hash.substring(0, 24)}...</code>
                        <span class="ml-2 px-2 py-0.5 text-xs rounded-full ${item.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${item.status}
                        </span>
                        <span class="ml-2 px-2 py-0.5 text-xs rounded-full ${['Transfer'].includes(item.transactionType || item.type) ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">
                            ${item.transactionType || item.type}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 truncate">${item.explanation}</p>
                    <div class="flex items-center mt-2 text-xs text-gray-500">
                        <span class="mr-3"><i class="fas fa-user mr-1"></i> ${item.from.substring(0, 12)}...</span>
                        <span><i class="fas fa-arrow-right mr-1"></i> ${item.to.substring(0, 12)}...</span>
                        <span class="ml-auto">${new Date(item.searchedAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <button class="ml-4 px-3 py-1 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors view-history-btn">
                    View
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to history items
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('view-history-btn')) {
                const hash = item.getAttribute('data-hash');
                loadTransactionFromHistory(hash);
            }
        });
    });

    // Add event listeners to view buttons
    document.querySelectorAll('.view-history-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const hash = btn.closest('.history-item').getAttribute('data-hash');
            loadTransactionFromHistory(hash);
        });
    });
}

function loadTransactionFromHistory(hash) {
    const tx = searchHistory.find(item => item.hash === hash);
    if (tx) {
        displayTransaction(tx);
        showResultsTab();
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        showToast('Transaction loaded from history', 'success');
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all search history?')) {
        searchHistory = [];
        localStorage.removeItem('txHistory');
        loadHistory();
        showToast('History cleared', 'success');
    }
}

function showResultsTab() {
    resultsTab.classList.add('tab-active');
    resultsTab.classList.remove('text-gray-500');
    historyTab.classList.remove('tab-active');
    historyTab.classList.add('text-gray-500');
    resultsContent.classList.remove('hidden');
    historyContent.classList.add('hidden');
}

function showHistoryTab() {
    historyTab.classList.add('tab-active');
    historyTab.classList.remove('text-gray-500');
    resultsTab.classList.remove('tab-active');
    resultsTab.classList.add('text-gray-500');
    historyContent.classList.remove('hidden');
    resultsContent.classList.add('hidden');
    loadHistory();
}

async function copyHashToClipboard() {
    if (!currentTransaction) return;

    try {
        await navigator.clipboard.writeText(currentTransaction.hash);

        // Visual feedback
        const originalText = copyHashBtn.innerHTML;
        copyHashBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyHashBtn.classList.add('copied');

        setTimeout(() => {
            copyHashBtn.innerHTML = originalText;
            copyHashBtn.classList.remove('copied');
        }, 2000);

        showToast('Transaction hash copied to clipboard', 'success');
    } catch (err) {
        showToast('Failed to copy to clipboard', 'error');
    }
}

function showToast(message, type) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white font-medium transform translate-y-2 opacity-0 transition-all duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
