// ========================================
// DATA MODELS & STORAGE
// ========================================

// 12 Baba Ijebu games with unique times between 8:00 AM and 11:00 PM
const games = [
    { id: 1, name: 'Golden Chance', time: '08:00' },
    { id: 2, name: 'Mega Draw', time: '09:30' },
    { id: 3, name: 'Night Star', time: '11:00' },
    { id: 4, name: 'Lucky Fortune', time: '12:30' },
    { id: 5, name: 'Diamond Plus', time: '14:00' },
    { id: 6, name: 'Super Jackpot', time: '15:30' },
    { id: 7, name: 'Royal King', time: '17:00' },
    { id: 8, name: 'Premier Lotto', time: '18:30' },
    { id: 9, name: 'Midnight Special', time: '19:30' },
    { id: 10, name: 'Evening Thunder', time: '20:30' },
    { id: 11, name: 'Late Night Winner', time: '21:30' },
    { id: 12, name: 'Final Draw', time: '23:00' }
];

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

    // Date cell
    const dateCell = document.createElement('td');
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.value = transaction.date;
    dateInput.addEventListener('change', (e) => {
        updateTransaction(transaction.id, 'date', e.target.value);
    });
    dateCell.appendChild(dateInput);

    // Game Name cell (dropdown)
    const gameNameCell = document.createElement('td');
    const gameSelect = document.createElement('select');
    gameSelect.innerHTML = '<option value="">Select Game</option>';
    games.forEach(game => {
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
        const selectedGame = games.find(g => g.id === selectedGameId);
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
    salesInput.addEventListener('input', (e) => {
        const salesValue = parseFloat(e.target.value) || 0;
        const { profit13, expense } = calculateProfitAndExpense(salesValue);
        updateTransaction(transaction.id, 'sales', salesValue);
        updateTransaction(transaction.id, 'profit13', profit13);
        updateTransaction(transaction.id, 'expense', expense);
        renderTransactionTable();
        updateDailySummary();
        updateMonthlySummary();
    });
    salesCell.appendChild(salesInput);

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
function init() {
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

    // Load transactions from localStorage
    loadTransactions();

    // Render initial state
    renderTransactionTable();
    updateDailySummary();
    updateMonthlySummary();

    // Event listeners
    document.getElementById('addTransactionBtn').addEventListener('click', addTransaction);
    
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
