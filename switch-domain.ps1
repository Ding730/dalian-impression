# ============================================================
#  Switch site domain / 换域名一键同步
#  Usage:
#     powershell -ExecutionPolicy Bypass -File .\switch-domain.ps1 -Url https://yourname.github.io/dalian-impression/
#     powershell -ExecutionPolicy Bypass -File .\switch-domain.ps1 -Url https://joyful-queijadas-62ea77.netlify.app/
#  Updates the site URL inside: index.html (canonical / og:url / og:image),
#  robots.txt and sitemap.xml. Works for:
#     *.netlify.app / *.pages.dev / *.vercel.app / *.web.app  (no sub path)
#     *.github.io/<repo>/  and  *.gitlab.io/<repo>/           (project sites)
# ============================================================
param(
    [Parameter(Mandatory = $true)]
    [string]$Url
)

if ($Url -notlike 'http*') { $Url = 'https://' + $Url }
if ($Url -notlike '*/') { $Url = $Url + '/' }

$files = @('index.html', 'robots.txt', 'sitemap.xml')
# A: 托管平台的裸子域（后面只会跟一个 /，不会吃掉路径）
$patternHost = 'https://[A-Za-z0-9\.\-]+\.(netlify\.app|pages\.dev|vercel\.app|web\.app|herokuapp\.com)/?'
# B: github.io / gitlab.io 的项目站点（可能带一个仓库名子路径）
$patternProject = 'https://[A-Za-z0-9\-]+\.(github\.io|gitlab\.io)(/[A-Za-z0-9\._\-]+)?/?'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

Write-Host ''
Write-Host ('=== Switch site URL to: ' + $Url + ' ===') -ForegroundColor Cyan

foreach ($f in $files) {
    $p = Join-Path $PSScriptRoot $f
    if (-not (Test-Path $p)) {
        Write-Host ('  skip (missing): ' + $f) -ForegroundColor Yellow
        continue
    }
    $text = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)
    $count = ([regex]::Matches($text, $patternHost)).Count + ([regex]::Matches($text, $patternProject)).Count
    $new = [regex]::Replace($text, $patternHost, $Url)
    $new = [regex]::Replace($new, $patternProject, $Url)
    # 折叠可能出现的重复斜杠（保留 https:// 中的 //）
    $new = [regex]::Replace($new, '(?<!:)//+', '/')
    [System.IO.File]::WriteAllText($p, $new, $utf8NoBom)
    Write-Host ('  updated ' + $f.PadRight(14) + ' ' + $count + ' url(s)') -ForegroundColor Green
}

Write-Host ''
Write-Host 'Done. Now re-upload the folder (or git push) to publish the change.' -ForegroundColor Cyan
Write-Host ''
