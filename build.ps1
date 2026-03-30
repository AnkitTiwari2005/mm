$ErrorActionPreference = "Continue"

Write-Host "--- 1. NPM BUILD ---"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "NPM Build Failed!"
    exit $LASTEXITCODE
}

Write-Host "--- 2. CAP SYNC ---"
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Cap Sync Failed!"
    exit $LASTEXITCODE
}

Write-Host "--- 3. GRADLE BUILD ---"
cd android
.\gradlew.bat assembleRelease --stacktrace
if ($LASTEXITCODE -ne 0) {
    Write-Host "Gradle Build Failed!"
    exit $LASTEXITCODE
}

Write-Host "--- BUILD SUCCESSFUL ---"
