@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python 3.10 or later is required. Install Python and try again.
  pause
  exit /b 1
)
echo Starting QueueLess...
echo Open http://127.0.0.1:8765 in your browser.
python app.py
pause
