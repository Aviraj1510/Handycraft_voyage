$src = "C:\photo\Handycraft Voyage\Selected"
$dest = "c:\photo\Hnadycraft voyage\images\categories"

if (!(Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest | Out-Null
}

$dirs = Get-ChildItem -Path $src -Directory

$dataObj = @{}

foreach ($dir in $dirs) {
    $catName = $dir.Name
    $catDest = Join-Path $dest $catName
    if (!(Test-Path $catDest)) {
        New-Item -ItemType Directory -Path $catDest | Out-Null
    }
    
    $images = Get-ChildItem -Path $dir.FullName -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png|webp)$" }
    
    $selected = $images | Select-Object -First 4
    
    $imgArr = @()
    foreach ($img in $selected) {
        Copy-Item -Path $img.FullName -Destination $catDest
        $imgArr += "images/categories/$catName/$($img.Name)"
    }
    $dataObj[$catName] = $imgArr
}

$dataObj | ConvertTo-Json -Depth 10 | Out-File -FilePath "$dest\categories.json"
Write-Host "Done"
