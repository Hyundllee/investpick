@echo off
chcp 65001 > nul
cd /d "%~dp0"
title 오늘의 투자픽 - 환경 설치

echo ============================================
echo   오늘의 투자픽 - node_modules 설치
echo ============================================
echo.

if not exist "node_modules.tgz" (
  if exist "node_modules" (
    echo   node_modules 가 이미 있습니다. 바로 실행합니다.
    goto RUN
  )
  echo   node_modules.tgz 파일이 없습니다.
  pause
  exit /b 1
)

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

echo [2/3] node_modules 압축 해제 ^(1~2분 정도 걸립니다^)
tar -xzf node_modules.tgz
if errorlevel 1 (
  echo.
  echo   압축 해제에 실패했습니다.
  echo   Windows 10 1803 이상이면 tar 가 기본 포함되어 있습니다.
  echo   실패가 계속되면 node_modules.tgz 를 반디집 등으로 직접 풀어주세요.
  echo.
  pause
  exit /b 1
)
echo   완료.
echo.

echo [3/3] 임시 파일 정리
if exist "node_modules.tgz" del /q "node_modules.tgz"
if exist "투자픽-미리보기.html" del /q "투자픽-미리보기.html"
if exist "install.bat" del /q "install.bat"
echo   완료.
echo.

:RUN
echo 개발 서버 시작 - http://localhost:3000
echo   종료하려면 Ctrl + C
echo.
call npm run dev

pause
