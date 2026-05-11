# WebSocket Integration & UI Updates

## Summary of Changes

### 1. UI Layout Updates
**File: `Website/templates/index.html`**
- ✅ Moved date/time display from sidebar to main content area
- ✅ Removed "Date:" label - now shows only date in format "May 2, 2026"
- ✅ Increased font size for date/time in main content (1.4rem, bold)
- ✅ Removed "Place Forecast" link from toolbar (now only 3 tabs)
- ✅ Removed sidebar toggle arrow button (⮜/⮞)
- ✅ Removed "Predicted Weather" heading from sidebar
- ✅ Added socket.io client library from CDN
- ✅ Applied consistent 'Lato' font throughout entire website

### 2. JavaScript Updates
**File: `Website/static/js/main.js`**
- ✅ Updated date/time display location to `#mainDateTime`
- ✅ Changed date format from "10:00 AM. Date: May 3, 2026." to "May 2, 2026"
- ✅ Added WebSocket initialization with socket.io client
- ✅ Created `displayPreprocessedResults()` function to render preprocessed data from Python
- ✅ Added event listeners for:
  - `connect`: Logs successful WebSocket connection
  - `model_results`: Receives and displays preprocessed data
  - `disconnect`: Logs disconnection

### 3. Backend Server Updates
**File: `Website/Weather_Forecaster.py`**
- ✅ Added imports for Flask-SocketIO, Flask-CORS, and request
- ✅ Initialized SocketIO with CORS support
- ✅ Added WebSocket event handlers:
  - `@socketio.on('connect')`: Sends preprocessed data on client connection
  - `@socketio.on('request_model_results')`: Sends data on explicit request
  - `@socketio.on('disconnect')`: Logs client disconnections
- ✅ Updated server to use `socketio.run()` instead of `app.run()`

### 4. Dependencies Added
**File: `Website/requirements.txt`**
- ✅ Added `python-socketio>=5.0`
- ✅ Added `python-engineio>=4.0`
- ✅ Added `Flask-Cors>=3.0`
- ✅ All dependencies installed successfully

## How WebSocket Connection Works

### Client-Side Flow:
1. JavaScript connects to WebSocket when page loads
2. On connection, server automatically sends preprocessed model results
3. Data is received via `model_results` event
4. `displayPreprocessedResults()` creates a formatted table in the main content
5. Table shows first 5 rows of preprocessed data with proper formatting

### Server-Side Flow:
1. Python Flask app initializes SocketIO on startup
2. When client connects, sends preprocessed sample data from `weather_predictions.json`
3. Preprocessed data includes: city_name, temperature, humidity, wind speed, clouds, weather main, and description
4. Data is converted to JSON and transmitted automatically

## Data Displayed

The preprocessed data table shows:
- **city_name**: Location of weather data
- **main.temp**: Temperature in Celsius
- **main.humidity**: Humidity percentage
- **wind.speed**: Wind speed (km/h)
- **clouds.all**: Cloud coverage percentage
- **weather.main**: Main weather condition (e.g., "Clear", "Rain", "Clouds")
- **weather.description**: Detailed weather description

## Testing the Setup

1. Start the Flask-SocketIO server:
   ```bash
   cd Website
   python Weather_Forecaster.py
   ```

2. Open browser to `http://localhost:5000`

3. Check browser console (F12 → Console tab):
   - Should see: "WebSocket connected"
   - Should see: "Received model results:" with the data

4. Look for "Preprocessed Data Sample" table in the main content area

## Font Consistency

All elements now use consistent fonts:
- Body text: 'Lato', sans-serif
- Headings: 'Lato', sans-serif
- All buttons and UI elements: 'Lato', sans-serif
- Fallback: sans-serif for broader compatibility

## Testing Notes

- The date format is automatically formatted by JavaScript's `toLocaleDateString()` 
- WebSocket connection is bidirectional but currently only sends data from server to client
- Preprocessed sample is extracted from the model's JSON output
- Empty or missing data displays as "—" (em dash)
