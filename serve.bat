@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo    大连印记 - 本地网站服务器（生成可访问的网址）
echo ============================================================
echo.
echo   本机访问：   http://localhost:8000/index.html
echo   局域网访问： http://本机IP:8000/index.html
echo                （手机 / 评委电脑连同一个 Wi-Fi 即可打开）
echo.
echo   关闭本窗口或按 Ctrl+C 即停止服务。
echo.

rem 2 秒后自动打开浏览器（辅助进程，不影响服务器）
start "" cmd /c "timeout /t 2 >nul & start "" http://localhost:8000/index.html"

rem 前台运行服务器：关闭窗口即停止，不会影响其它 Python 进程
python -m http.server 8000
