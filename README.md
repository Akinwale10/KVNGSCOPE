# KVNGSCOPE

A web-based transaction management system for KVNG HORLA SCOPE lottery operations.

## Features

- 📊 **Daily & Monthly Summaries**: Track sales, profits, and expenses
- 🎮 **Game Management**: Pre-configured games for each day of the week
- 💾 **Cloud Sync**: Save transactions to Firebase Firestore (optional)
- 💰 **Automatic Calculations**: 13% profit and 87% expense calculations
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔒 **Local Storage**: Data persists in browser even without cloud sync

## Recent Updates

- ✅ Fixed page jumping issue when entering sales values
- ✅ Added Firebase cloud sync functionality
- ✅ Added "Save to Cloud" button for manual cloud backup
- ✅ Improved UI with smaller, more proportional summary card values

## Getting Started

1. Open `index.html` in a web browser
2. Add transactions using the "+ Add New Transaction" button
3. Enter sales values and watch profit/expense calculate automatically
4. Data is automatically saved to your browser's local storage

## Optional: Firebase Cloud Sync

To enable cloud synchronization:

1. See the [Firebase Setup Guide](FIREBASE_SETUP.md) for detailed instructions
2. Update the Firebase configuration in `app.js`
3. Click "💾 Save to Cloud" to sync your transactions

## Usage

- **Add Transaction**: Click the "+ Add New Transaction" button
- **Enter Sales**: Type sales amount in the sales field
- **Auto-Calculate**: Profit (13%) and expense (87%) are calculated automatically
- **Filter by Date**: Use date filters to view specific days or months
- **Save to Cloud**: Click "💾 Save to Cloud" to backup to Firebase (if configured)

## Technologies Used

- HTML5, CSS3, JavaScript (Vanilla)
- Firebase Firestore (optional, for cloud sync)
- Local Storage API (for offline persistence)

## Browser Compatibility

Works with all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## License

This project is open source and available for use.
