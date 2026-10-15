# ============================================================
#  Dalian Impression - online site self-check
#  ASCII only, so it parses correctly in any PowerShell version.
#  Usage:
#     powershell -ExecutionPolicy Bypass -File .\check-online.ps1
#     powershell -ExecutionPolicy Bypass -File .\check-online.ps1 -Url https://your-site.netlify.app/
# ============================================================
param(
    [string]$Url = 'https://joyful-queijadas-62ea77.netlify.app/'
)

if ($Url -notlike 'http*') { $Url = 'https://' + $Url }
if ($Url -notlike '*/') { $Url = $Url + '/' }

Write-Host ''
Write-Host ('=== Online check: ' + $Url + ' ===') -ForegroundColor Cyan
Write-Host ''

$paths = @(
    '',
    'index.html',
    'css/style.css',
    'js/main.js',
    'vendor/echarts.min.js',
    'vendor/gsap.min.js',
    'vendor/ScrollTrigger.min.js',
    'favicon.svg',
    'site.webmanifest',
    '404.html',
    'robots.txt',
    'sitemap.xml'
)

$fail = 0
$blocked = $false

foreach ($p in $paths) {
    $target = $Url + $p
    try {
        $r = Invoke-WebRequest $target -UseBasicParsing -TimeoutSec 25 -Headers @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SiteCheck/1.0' }
        $size = [math]::Round($r.RawContentLength / 1KB, 1)
        Write-Host ('  OK    ' + $p.PadRight(30) + $r.StatusCode + '   ' + $size + ' KB') -ForegroundColor Green
    }
    catch {
        $resp = $_.Exception.Response
        $code = 0
        if ($resp) { $code = [int]$resp.StatusCode }
        if ($code -eq 401) { $blocked = $true }
        $fail++
        Write-Host ('  FAIL  ' + $p.PadRight(30) + 'HTTP ' + $code) -ForegroundColor Red
    }
}

Write-Host ''
if ($blocked) {
    Write-Host '[RESULT] HTTP 401: the site is online but protected by access control / password.' -ForegroundColor Yellow
    Write-Host '         Fix: log in to https://app.netlify.com , open this site, then go to' -ForegroundColor Yellow
    Write-Host '         Site configuration - Access and security - Visitor access / Access control /' -ForegroundColor Yellow
    Write-Host '         Password protection , switch it off and set the site to Public.' -ForegroundColor Yellow
    Write-Host '         Make sure the latest deploy is Published, then retry in a private window.' -ForegroundColor Yellow
}
elseif ($fail -eq 0) {
    Write-Host '[RESULT] All resources returned 200. The site is now reachable from any device.' -ForegroundColor Green
    Write-Host '         Quick manual check: page title, charts render, timeline and map interactions.' -ForegroundColor Green
}
else {
    Write-Host ('[RESULT] ' + $fail + ' item(s) failed. Check file name case, missing vendor folder, or 404 rules.') -ForegroundColor Yellow
}
Write-Host ''
