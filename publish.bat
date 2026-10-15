@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo    大连印记 - 一键发布到 GitHub / Gitee
echo ============================================================
echo.
echo   使用前请先在你的代码托管平台新建一个空仓库（不要勾选 README，
echo   不要初始化 .gitignore），然后复制它的 HTTPS 地址粘贴到下面。
echo.

set /p REPO=仓库地址（例如 https://github.com/yourname/dalian-impression.git）:
if "%REPO%"=="" (
    echo.
    echo 未输入仓库地址，已取消。
    pause
    exit /b 1
)

if not exist ".git" (
    echo [1/5] 初始化本地仓库...
    git init
    git branch -M main
) else (
    echo [1/5] 已存在本地仓库，跳过初始化。
)

echo [2/5] 暂存文件...
git add -A

echo [3/5] 提交...
git commit -m "feat: 大连印记 · 从过去到未来的数字漫游（静态站点）"

echo [4/5] 配置远程仓库...
git remote remove origin >nul 2>nul
git remote add origin %REPO%

echo [5/5] 推送到远程仓库...
git push -u origin main

echo.
echo ============================================================
echo  推送完成！接下来：
echo   · GitHub：仓库 Settings - Pages - Source 选 “Deploy from a branch”，
echo     分支选 main、目录选 /(root)，1-2 分钟后访问
echo     https://你的用户名.github.io/仓库名/
echo   · Gitee：仓库 服务 - Gitee Pages - 部署，得到的网址类似
echo     https://你的用户名.gitee.io/仓库名/
echo ============================================================
pause
