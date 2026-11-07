@echo off
cd /d "%~dp0"
node serve.js --open
if errorlevel 1 pause
