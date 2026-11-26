@echo off
setlocal
chcp 65001 >nul

cd /d "E:\Git\nisoke.github.io"

echo.
echo ==========================================
echo   Publishing blog ...
echo ==========================================
echo.

echo [1/4] hexo clean ...
call node_modules\.bin\hexo.cmd clean
if errorlevel 1 goto fail

echo [2/4] hexo generate ...
call node_modules\.bin\hexo.cmd generate
if errorlevel 1 goto fail

echo [3/4] git commit ...
git add -A
git commit -m "publish: auto build and deploy"
if errorlevel 1 (
  echo       no new changes to commit, skip
)

echo [4/4] git push ...
git push origin master
if errorlevel 1 goto fail

echo.
echo ==========================================
echo   Done! Site updates in ~1-2 min at:
echo   https://nisoke.github.io
echo ==========================================
echo.
pause
exit /b 0

:fail
echo.
echo ==========================================
echo   FAILED - see the message above.
echo ==========================================
echo.
pause
exit /b 1
