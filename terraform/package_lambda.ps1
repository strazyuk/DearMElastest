# package_lambda.ps1
# This script bundles the FastAPI backend for AWS Lambda and returns JSON for Terraform

try {
    # 1. Paths (Use ProviderPath to avoid the Microsoft.PowerShell.Core\FileSystem:: prefix)
    $TerraformDir = $PSScriptRoot
    $BackendDir = (Resolve-Path (Join-Path $TerraformDir "../backend")).ProviderPath
    $BuildDir = Join-Path $TerraformDir "lambda_build"
    $ZipPath = Join-Path $TerraformDir "lambda_payload.zip"

    # 2. Clean up
    if (Test-Path $BuildDir) { Remove-Item -Recurse -Force $BuildDir }
    if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }
    New-Item -ItemType Directory -Path $BuildDir -Force | Out-Null

    # 3. Install dependencies
    pip install -r (Join-Path $BackendDir "requirements.txt") -t $BuildDir --platform manylinux2014_x86_64 --only-binary=:all: --upgrade -q 2>$null | Out-Null

    # 4. Copy source code
    Copy-Item (Join-Path $BackendDir "*.py") $BuildDir -Force
    
    $SubDirs = @("api", "core", "db", "models", "routers")
    foreach ($Dir in $SubDirs) {
        $Src = Join-Path $BackendDir $Dir
        if (Test-Path $Src) {
            Copy-Item $Src $BuildDir -Recurse -Force
        }
    }

    # 5. Clean pycache
    Get-ChildItem -Path $BuildDir -Include "__pycache__", "*.pyc" -Recurse | Remove-Item -Force -Recurse

    # 6. Add unique build info to force hash change
    $Timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $Timestamp | Out-File (Join-Path $BuildDir "BUILD_INFO") -Encoding utf8

    # 7. Create the zip
    $OldPwd = Get-Location
    Set-Location $BuildDir
    Get-ChildItem | Compress-Archive -DestinationPath $ZipPath -Force
    Set-Location $OldPwd

    # 8. Calculate Hash
    $Hash = (Get-FileHash -Path $ZipPath -Algorithm SHA256).Hash

    # 9. Output JSON for Terraform
    $Output = @{
        zip_path = $ZipPath
        hash     = $Hash
    }
    $Output | ConvertTo-Json
}
catch {
    exit 1
}
