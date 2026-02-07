# Pre-Deployment Checklist

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Portfolio Deployment Checklist" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allChecks = $true

# 1. Check Node.js version
Write-Host "[1/10] Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    $versionNum = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNum -ge 18) {
        Write-Host "  ✅ Node.js $nodeVersion (OK)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Node.js $nodeVersion (Need v18+)" -ForegroundColor Red
        $allChecks = $false
    }
} else {
    Write-Host "  ❌ Node.js not found" -ForegroundColor Red
    $allChecks = $false
}

# 2. Check Git installation
Write-Host "[2/10] Checking Git..." -ForegroundColor Yellow
$gitVersion = git --version 2>$null
if ($gitVersion) {
    Write-Host "  ✅ $gitVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Git not installed" -ForegroundColor Red
    Write-Host "     Download: https://git-scm.com/download/win" -ForegroundColor Yellow
    $allChecks = $false
}

# 3. Check frontend dependencies
Write-Host "[3/10] Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
    Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ❌ Dependencies missing. Run: cd frontend && npm install" -ForegroundColor Red
    $allChecks = $false
}

# 4. Check environment file
Write-Host "[4/10] Checking environment variables..." -ForegroundColor Yellow
if (Test-Path "frontend/.env.local") {
    Write-Host "  ✅ .env.local exists" -ForegroundColor Green
    $envContent = Get-Content "frontend/.env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_TELEGRAM_BOT_TOKEN") {
        Write-Host "  ✅ TELEGRAM_BOT_TOKEN configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  TELEGRAM_BOT_TOKEN not found (optional)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  .env.local not found (optional for deployment)" -ForegroundColor Yellow
}

# 5. Check required files
Write-Host "[5/10] Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    @{Path="frontend/public/video/kek.mp4"; Size=8.0; Name="Hero video"},
    @{Path="frontend/public/cv/cvEn.pdf"; Size=0.1; Name="Resume EN"},
    @{Path="frontend/public/cv/cvRu.pdf"; Size=0.1; Name="Resume RU"},
    @{Path="frontend/public/.nojekyll"; Size=0; Name=".nojekyll"},
    @{Path="frontend/public/manifest.json"; Size=0; Name="PWA manifest"},
    @{Path="frontend/public/robots.txt"; Size=0; Name="robots.txt"},
    @{Path="frontend/public/sitemap.xml"; Size=0; Name="sitemap.xml"}
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file.Path) {
        $fileSize = (Get-Item $file.Path).Length / 1MB
        if ($fileSize -ge $file.Size) {
            Write-Host "  ✅ $($file.Name) ($('{0:N2}' -f $fileSize) MB)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $($file.Name) exists but seems too small" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ $($file.Name) missing at $($file.Path)" -ForegroundColor Red
        $allChecks = $false
    }
}

# 6. Check next.config.mjs
Write-Host "[6/10] Checking Next.js configuration..." -ForegroundColor Yellow
if (Test-Path "frontend/next.config.mjs") {
    $config = Get-Content "frontend/next.config.mjs" -Raw
    if ($config -match "output:\s*'export'") {
        Write-Host "  ✅ Static export enabled" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Static export not configured" -ForegroundColor Red
        $allChecks = $false
    }
    if ($config -match "trailingSlash:\s*true") {
        Write-Host "  ✅ Trailing slash enabled" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Trailing slash not enabled" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ next.config.mjs not found" -ForegroundColor Red
    $allChecks = $false
}

# 7. Run build test
Write-Host "[7/10] Running production build..." -ForegroundColor Yellow
Push-Location frontend
$buildOutput = npm run build 2>&1
Pop-Location
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "  ❌ Build failed" -ForegroundColor Red
    Write-Host "     Check errors above" -ForegroundColor Yellow
    $allChecks = $false
}

# 8. Check build output
Write-Host "[8/10] Checking build output..." -ForegroundColor Yellow
if (Test-Path "frontend/out") {
    $outFiles = (Get-ChildItem "frontend/out" -Recurse -File).Count
    Write-Host "  ✅ Output directory created ($outFiles files)" -ForegroundColor Green
    
    # Check critical files in out
    if (Test-Path "frontend/out/.nojekyll") {
        Write-Host "  ✅ .nojekyll copied to out/" -ForegroundColor Green
    } else {
        Write-Host "  ❌ .nojekyll missing in out/" -ForegroundColor Red
        $allChecks = $false
    }
    
    if (Test-Path "frontend/out/video/kek.mp4") {
        $videoSize = (Get-Item "frontend/out/video/kek.mp4").Length / 1MB
        Write-Host "  ✅ Video in out/ ($('{0:N2}' -f $videoSize) MB)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Video missing in out/" -ForegroundColor Red
        $allChecks = $false
    }
} else {
    Write-Host "  ❌ Output directory not found" -ForegroundColor Red
    $allChecks = $false
}

# 9. Check GitHub Actions workflows
Write-Host "[9/10] Checking CI/CD configuration..." -ForegroundColor Yellow
$workflows = @("ci.yml", "deploy.yml", "codeql.yml", "dependency-update.yml")
foreach ($workflow in $workflows) {
    if (Test-Path ".github/workflows/$workflow") {
        Write-Host "  ✅ $workflow configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $workflow missing" -ForegroundColor Yellow
    }
}

# 10. Check repository size
Write-Host "[10/10] Checking repository size..." -ForegroundColor Yellow
$totalSize = 0
Get-ChildItem -Recurse -File -Exclude node_modules,.next,out | ForEach-Object { $totalSize += $_.Length }
$totalSizeMB = $totalSize / 1MB
if ($totalSizeMB -lt 100) {
    Write-Host "  ✅ Repository size: $('{0:N2}' -f $totalSizeMB) MB" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Repository size: $('{0:N2}' -f $totalSizeMB) MB (consider Git LFS)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allChecks) {
    Write-Host "   ✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ready to deploy! Next steps:" -ForegroundColor Green
    Write-Host "1. git init (if not already)" -ForegroundColor White
    Write-Host "2. git add ." -ForegroundColor White
    Write-Host "3. git commit -m 'Initial commit'" -ForegroundColor White
    Write-Host "4. Create repo on GitHub: vladimir75vov.github.io" -ForegroundColor White
    Write-Host "5. git remote add origin https://github.com/vladimir75vov/vladimir75vov.github.io.git" -ForegroundColor White
    Write-Host "6. git push -u origin main" -ForegroundColor White
    Write-Host "7. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)" -ForegroundColor White
    Write-Host ""
    Write-Host "See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
} else {
    Write-Host "   ⚠️  SOME CHECKS FAILED" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Fix the issues above before deploying" -ForegroundColor Yellow
    Write-Host "See DEPLOYMENT.md for help" -ForegroundColor Cyan
}
Write-Host ""
