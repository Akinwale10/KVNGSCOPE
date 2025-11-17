// ========================================
// FIREBASE CONFIGURATION
// ========================================

// Firebase configuration - Users should replace these with their own Firebase project credentials
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db = null;
let firebaseInitialized = false;

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log('Firebase initialized successfully');
    }
} catch (error) {
    console.warn('Firebase initialization failed:', error.message);
    console.warn('Falling back to localStorage only. Update firebaseConfig in app.js to enable cloud sync.');
}

// ========================================
// DATA MODELS & STORAGE
// ========================================

// Games organized by day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
// Each day has different Baba Ijebu games with unique times
const gamesByDay = {
    0: [ // Sunday
        { id: 101, name: 'Sunday Special', time: '08:00' },
        { id: 102, name: 'Holy Draw', time: '10:00' },
        { id: 103, name: 'Weekend Winner', time: '12:00' },
        { id: 104, name: 'Sunday Fortune', time: '14:00' },
        { id: 105, name: 'Blessed Lotto', time: '16:00' },
        { id: 106, name: 'Evening Glory', time: '18:00' },
        { id: 107, name: 'Sunday Sunset', time: '20:00' },
        { id: 108, name: 'Night Blessing', time: '22:00' }
    ],
    1: [ // Monday
        { id: 201, name: 'Monday Starter', time: '08:00' },
        { id: 202, name: 'Morning Rush', time: '10:00' },
        { id: 203, name: 'Midday Magic', time: '12:00' },
        { id: 204, name: 'Afternoon Luck', time: '14:00' },
        { id: 205, name: 'Evening Power', time: '16:00' },
        { id: 206, name: 'Night Champion', time: '18:00' },
        { id: 207, name: 'Monday Close', time: '20:00' },
        { id: 208, name: 'Late Winner', time: '22:00' }
    ],
    2: [ // Tuesday
        { id: 301, name: 'Tuesday Dawn', time: '08:00' },
        { id: 302, name: 'Golden Tuesday', time: '10:00' },
        { id: 303, name: 'Mid-Week Start', time: '12:00' },
        { id: 304, name: 'Lucky Tuesday', time: '14:00' },
        { id: 305, name: 'Tuesday Thunder', time: '16:00' },
        { id: 306, name: 'Evening Star', time: '18:00' },
        { id: 307, name: 'Night Fortune', time: '20:00' },
        { id: 308, name: 'Final Tuesday', time: '22:00' }
    ],
    3: [ // Wednesday
        { id: 401, name: 'Wednesday Wonder', time: '08:00' },
        { id: 402, name: 'Mid-Week Special', time: '10:00' },
        { id: 403, name: 'Hump Day Draw', time: '12:00' },
        { id: 404, name: 'Wednesday Wealth', time: '14:00' },
        { id: 405, name: 'Midweek Master', time: '16:00' },
        { id: 406, name: 'Evening Jackpot', time: '18:00' },
        { id: 407, name: 'Wednesday Night', time: '20:00' },
        { id: 408, name: 'Late Midweek', time: '22:00' }
    ],
    4: [ // Thursday
        { id: 501, name: 'Thursday Thrill', time: '08:00' },
        { id: 502, name: 'Morning Jackpot', time: '10:00' },
        { id: 503, name: 'Thursday Peak', time: '12:00' },
        { id: 504, name: 'Lucky Thursday', time: '14:00' },
        { id: 505, name: 'Thursday Gold', time: '16:00' },
        { id: 506, name: 'Evening Thunder', time: '18:00' },
        { id: 507, name: 'Thursday Night', time: '20:00' },
        { id: 508, name: 'Late Thunder', time: '22:00' }
    ],
    5: [ // Friday
        { id: 601, name: 'Friday Freedom', time: '08:00' },
        { id: 602, name: 'TGIF Special', time: '10:00' },
        { id: 603, name: 'Friday Fortune', time: '12:00' },
        { id: 604, name: 'Weekend Preview', time: '14:00' },
        { id: 605, name: 'Friday Flash', time: '16:00' },
        { id: 606, name: 'Friday Night Lights', time: '18:00' },
        { id: 607, name: 'Party Draw', time: '20:00' },
        { id: 608, name: 'Friday Finale', time: '22:00' }
    ],
    6: [ // Saturday
        { id: 701, name: 'Saturday Sunrise', time: '08:00' },
        { id: 702, name: 'Weekend Bonanza', time: '10:00' },
        { id: 703, name: 'Saturday Special', time: '12:00' },
        { id: 704, name: 'Jackpot Saturday', time: '14:00' },
        { id: 705, name: 'Saturday Gold', time: '16:00' },
        { id: 706, name: 'Prime Saturday', time: '18:00' },
        { id: 707, name: 'Saturday Night Fever', time: '20:00' },
        { id: 708, name: 'Weekend Closer', time: '22:00' }
    ]
};

// Get games for a specific date
function getGamesForDate(dateString) {
    const date = new Date(dateString + 'T00:00:00'); // Ensure proper parsing
    const dayOfWeek = date.getDay();
    return gamesByDay[dayOfWeek] || [];
}

// Transaction array stored in memory and localStorage
let transactions = [];

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Get current month in YYYY-MM format
function getCurrentMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

// Format number as Nigerian Naira currency
function formatCurrency(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) {
        return '₦0.00';
    }
    return '₦' + parseFloat(amount).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Generate unique ID for transactions
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// ========================================
// LOCALSTORAGE OPERATIONS
// ========================================

// Load transactions from localStorage
function loadTransactions() {
    const stored = localStorage.getItem('kvngHorlaTransactions');
    if (stored) {
        try {
            transactions = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading transactions:', e);
            transactions = [];
        }
    }
}

// Save transactions to localStorage
function saveTransactions() {
    try {
        localStorage.setItem('kvngHorlaTransactions', JSON.stringify(transactions));
    } catch (e) {
        console.error('Error saving transactions:', e);
    }
}

// ========================================
// FIREBASE OPERATIONS
// ========================================

// Save all transactions to Firebase Firestore
async function saveToFirebase() {
    if (!firebaseInitialized || !db) {
        alert('Firebase is not configured. Please update the Firebase configuration in app.js to enable cloud sync.\n\nYour data is still saved locally in your browser.');
        return false;
    }

    const saveBtn = document.getElementById('saveToFirebaseBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Saving...';

    try {
        // Save each transaction to Firestore
        const batch = db.batch();
        
        transactions.forEach(transaction => {
            const docRef = db.collection('transactions').doc(transaction.id);
            batch.set(docRef, transaction);
        });

        await batch.commit();
        
        saveBtn.textContent = '✅ Saved!';
        setTimeout(() => {
            saveBtn.textContent = '💾 Save to Cloud';
            saveBtn.disabled = false;
        }, 2000);
        
        alert('Transactions saved to cloud successfully!');
        return true;
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        alert('Failed to save to cloud: ' + error.message + '\n\nYour data is still saved locally in your browser.');
        saveBtn.textContent = '💾 Save to Cloud';
        saveBtn.disabled = false;
        return false;
    }
}

// Load transactions from Firebase Firestore
async function loadFromFirebase() {
    if (!firebaseInitialized || !db) {
        console.log('Firebase not configured, using localStorage only');
        return;
    }

    try {
        const snapshot = await db.collection('transactions').get();
        const firebaseTransactions = [];
        
        snapshot.forEach(doc => {
            firebaseTransactions.push(doc.data());
        });

        if (firebaseTransactions.length > 0) {
            transactions = firebaseTransactions;
            saveTransactions(); // Also save to localStorage
            console.log('Loaded transactions from Firebase');
        }
    } catch (error) {
        console.warn('Error loading from Firebase:', error.message);
        console.log('Using localStorage data instead');
    }
}

// ========================================
// CALCULATION FUNCTIONS
// ========================================

// Calculate 13% profit and 87% expense
function calculateProfitAndExpense(sales) {
    const salesAmount = parseFloat(sales) || 0;
    const profit13 = salesAmount * 0.13;
    const expense = salesAmount - profit13; // 87% of sales
    return { profit13, expense };
}

// Filter transactions by date
function filterTransactionsByDate(date) {
    return transactions.filter(t => t.date === date);
}

// Filter transactions by month (YYYY-MM)
function filterTransactionsByMonth(monthYear) {
    return transactions.filter(t => t.date.startsWith(monthYear));
}

// Calculate totals for given transactions
function calculateTotals(transactionList) {
    const totals = {
        sales: 0,
        profit13: 0,
        expense: 0
    };

    transactionList.forEach(t => {
        totals.sales += parseFloat(t.sales) || 0;
        totals.profit13 += parseFloat(t.profit13) || 0;
        totals.expense += parseFloat(t.expense) || 0;
    });

    return totals;
}

// ========================================
// UI UPDATE FUNCTIONS
// ========================================

// Update daily summary cards
function updateDailySummary() {
    const selectedDate = document.getElementById('dateFilter').value || getTodayDate();
    const dailyTransactions = filterTransactionsByDate(selectedDate);
    const totals = calculateTotals(dailyTransactions);

    document.getElementById('dailySales').textContent = formatCurrency(totals.sales);
    document.getElementById('dailyProfit').textContent = formatCurrency(totals.profit13);
    document.getElementById('dailyExpense').textContent = formatCurrency(totals.expense);
}

// Update monthly summary cards
function updateMonthlySummary() {
    const selectedMonth = document.getElementById('monthFilter').value || getCurrentMonth();
    const monthlyTransactions = filterTransactionsByMonth(selectedMonth);
    const totals = calculateTotals(monthlyTransactions);

    document.getElementById('monthlySales').textContent = formatCurrency(totals.sales);
    document.getElementById('monthlyProfit').textContent = formatCurrency(totals.profit13);
    document.getElementById('monthlyExpense').textContent = formatCurrency(totals.expense);
}

// Render all transactions in the table
function renderTransactionTable() {
    const tbody = document.getElementById('transactionTableBody');
    tbody.innerHTML = '';

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #7f8c8d;">
                    No transactions yet. Click "Add New Transaction" to get started.
                </td>
            </tr>
        `;
        return;
    }

    // Sort transactions by date (newest first) and then by time
    const sortedTransactions = [...transactions].sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return (b.gameTime || '').localeCompare(a.gameTime || '');
    });

    sortedTransactions.forEach(transaction => {
        const row = createTransactionRow(transaction);
        tbody.appendChild(row);
    });
}

// Create a transaction row element
function createTransactionRow(transaction) {
    const row = document.createElement('tr');
    row.dataset.transactionId = transaction.id;

    // Get games for the transaction date
    const availableGames = getGamesForDate(transaction.date);

    // Date cell
    const dateCell = document.createElement('td');
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.value = transaction.date;
    dateInput.addEventListener('change', (e) => {
        updateTransaction(transaction.id, 'date', e.target.value);
        // Reset game selection when date changes since games are day-specific
        updateTransaction(transaction.id, 'gameId', null);
        updateTransaction(transaction.id, 'gameName', '');
        updateTransaction(transaction.id, 'gameTime', '');
        renderTransactionTable();
    });
    dateCell.appendChild(dateInput);

    // Game Name cell (dropdown)
    const gameNameCell = document.createElement('td');
    const gameSelect = document.createElement('select');
    gameSelect.innerHTML = '<option value="">Select Game</option>';
    availableGames.forEach(game => {
        const option = document.createElement('option');
        option.value = game.id;
        option.textContent = game.name;
        if (transaction.gameId === game.id) {
            option.selected = true;
        }
        gameSelect.appendChild(option);
    });
    gameSelect.addEventListener('change', (e) => {
        const selectedGameId = parseInt(e.target.value);
        const selectedGame = availableGames.find(g => g.id === selectedGameId);
        if (selectedGame) {
            updateTransaction(transaction.id, 'gameId', selectedGame.id);
            updateTransaction(transaction.id, 'gameName', selectedGame.name);
            updateTransaction(transaction.id, 'gameTime', selectedGame.time);
            renderTransactionTable();
        }
    });
    gameNameCell.appendChild(gameSelect);

    // Game Time cell (read-only)
    const gameTimeCell = document.createElement('td');
    const gameTimeInput = document.createElement('input');
    gameTimeInput.type = 'text';
    gameTimeInput.value = transaction.gameTime || '';
    gameTimeInput.readOnly = true;
    gameTimeCell.appendChild(gameTimeInput);

    // Sales cell
    const salesCell = document.createElement('td');
    const salesInput = document.createElement('input');
    salesInput.type = 'number';
    salesInput.min = '0';
    salesInput.step = '0.01';
    salesInput.value = transaction.sales || '';
    salesInput.placeholder = '0.00';
    
    // 13% Profit cell (auto-calculated, read-only display)
    const profitCell = document.createElement('td');
    profitCell.textContent = formatCurrency(transaction.profit13);
    profitCell.style.fontWeight = '600';
    profitCell.style.color = '#27ae60';

    // Expense cell (auto-calculated, read-only display)
    const expenseCell = document.createElement('td');
    expenseCell.textContent = formatCurrency(transaction.expense);
    expenseCell.style.fontWeight = '600';
    expenseCell.style.color = '#e74c3c';
    
    // Update profit and expense cells on input without re-rendering entire table
    salesInput.addEventListener('input', (e) => {
        const salesValue = parseFloat(e.target.value) || 0;
        const { profit13, expense } = calculateProfitAndExpense(salesValue);
        updateTransaction(transaction.id, 'sales', salesValue);
        updateTransaction(transaction.id, 'profit13', profit13);
        updateTransaction(transaction.id, 'expense', expense);
        // Update only the specific cells instead of re-rendering entire table
        profitCell.textContent = formatCurrency(profit13);
        expenseCell.textContent = formatCurrency(expense);
        updateDailySummary();
        updateMonthlySummary();
    });
    salesCell.appendChild(salesInput);

    // Notes cell
    const notesCell = document.createElement('td');
    const notesTextarea = document.createElement('textarea');
    notesTextarea.value = transaction.notes || '';
    notesTextarea.placeholder = 'Add notes...';
    notesTextarea.rows = 2;
    notesTextarea.addEventListener('change', (e) => {
        updateTransaction(transaction.id, 'notes', e.target.value);
    });
    notesCell.appendChild(notesTextarea);

    // Actions cell (Delete button)
    const actionsCell = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(transaction.id);
        }
    });
    actionsCell.appendChild(deleteBtn);

    // Append all cells to row
    row.appendChild(dateCell);
    row.appendChild(gameNameCell);
    row.appendChild(gameTimeCell);
    row.appendChild(salesCell);
    row.appendChild(profitCell);
    row.appendChild(expenseCell);
    row.appendChild(notesCell);
    row.appendChild(actionsCell);

    return row;
}

// ========================================
// TRANSACTION OPERATIONS
// ========================================

// Add a new transaction
function addTransaction() {
    const newTransaction = {
        id: generateId(),
        date: getTodayDate(),
        gameId: null,
        gameName: '',
        gameTime: '',
        sales: 0,
        profit13: 0,
        expense: 0,
        notes: ''
    };

    transactions.unshift(newTransaction); // Add to beginning
    saveTransactions();
    renderTransactionTable();
    updateDailySummary();
    updateMonthlySummary();
}

// Update a transaction field
function updateTransaction(transactionId, field, value) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        transaction[field] = value;
        saveTransactions();
    }
}

// Delete a transaction
function deleteTransaction(transactionId) {
    transactions = transactions.filter(t => t.id !== transactionId);
    saveTransactions();
    renderTransactionTable();
    updateDailySummary();
    updateMonthlySummary();
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize the application
async function init() {
    // Display today's date
    const todayElement = document.getElementById('todayDate');
    const today = new Date();
    todayElement.textContent = today.toLocaleDateString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Set default values for date filters
    document.getElementById('dateFilter').value = getTodayDate();
    document.getElementById('monthFilter').value = getCurrentMonth();

    // Load transactions from localStorage first
    loadTransactions();
    
    // Try to load from Firebase if configured
    await loadFromFirebase();

    // Render initial state
    renderTransactionTable();
    updateDailySummary();
    updateMonthlySummary();

    // Event listeners
    document.getElementById('addTransactionBtn').addEventListener('click', addTransaction);
    
    document.getElementById('saveToFirebaseBtn').addEventListener('click', saveToFirebase);
    
    document.getElementById('dateFilter').addEventListener('change', () => {
        updateDailySummary();
    });

    document.getElementById('monthFilter').addEventListener('change', () => {
        updateMonthlySummary();
    });
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
