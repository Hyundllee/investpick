@echo off
chcp 65001 > nul
cd /d "%~dp0"
title 오늘의 투자픽 - 개발 환경 설치

echo ============================================
echo   오늘의 투자픽 개발 환경 설치
echo ============================================
echo.

echo [1/3] Node.js 확인
call node -v
if errorlevel 1 (
  echo.
  echo   Node.js 가 설치되어 있지 않습니다.
  echo   https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행해 주세요.
  echo.
  pause
  exit /b 1
)
echo.

echo [2/3] 의존성 설치 ^(처음 실행 시 2~5분 정도 걸립니다^)
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo   설치에 실패했습니다. 위 메시지를 확인해 주세요.
  echo.
  pause
  exit /b 1
)
echo.

echo [3/3] 개발 서버 시작 - http://localhost:3000
echo   종료하려면 Ctrl + C
echo.
call npm run dev

pause
