@echo off
chcp 65001 >nul
cd /d "%~dp0"

rem ---------- 自动提权 ----------
net session >nul 2>nul
if %errorlevel% neq 0 (
    echo 配置防火墙需要管理员权限，正在弹出授权窗口，请点「是」...
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo ============================================================
echo    大连印记 - 放行局域网访问（一次性设置）
echo    作用：让同一 Wi-Fi 下的其它电脑/手机能打开你的网站
echo ============================================================
echo.

echo [1/2] 添加 TCP 8000 入站放行规则...
netsh advfirewall firewall delete rule name="DalianImpression LAN 8000" >nul 2>nul
netsh advfirewall firewall add rule name="DalianImpression LAN 8000" dir=in action=allow protocol=TCP localport=8000 profile=private,public
echo.

echo [2/2] 把当前网络类型由「公用」改为「专用」...
powershell -NoProfile -Command "Get-NetConnectionProfile | Where-Object { $_.NetworkCategory -eq 'Public' } | ForEach-Object { try { Set-NetConnectionProfile -InterfaceIndex $_.InterfaceIndex -NetworkCategory Private; Write-Host ('  已改为专用网络: ' + $_.InterfaceAlias) } catch { Write-Host ('  跳过: ' + $_.InterfaceAlias) } }"
echo.

echo 设置完成。其它设备（同一 Wi-Fi）用下面的地址访问：
echo    http://本机IP:8000/index.html
echo.
echo 本机 IP 如下（IPv4 地址）：
ipconfig | findstr /i "IPv4"
echo.
echo 提示：本机 IP 可能随路由器重新分配而变化；换网络后重新看一下即可。
pause
