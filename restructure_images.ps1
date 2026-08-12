$src = "C:\photo\Handycraft Voyage\Selected\Pipecleaner hair accecories"
$dest = "c:\photo\Hnadycraft voyage\images\categories\Pipecleaner Hair Accessories"
$catName = "Pipecleaner Hair Accessories"

if (!(Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest | Out-Null
}

$dirs = Get-ChildItem -Path $src -Directory
$productsArr = @()

foreach ($dir in $dirs) {
    $images = Get-ChildItem -Path $dir.FullName -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png|webp)$" }
    
    if ($images.Count -gt 0) {
        $productDir = Join-Path $dest $dir.Name
        if (!(Test-Path $productDir)) {
            New-Item -ItemType Directory -Path $productDir | Out-Null
        }
        
        $imgArr = @()
        foreach ($img in $images) {
            Copy-Item -Path $img.FullName -Destination $productDir -Force
            # Forward slashes for web paths
            $relPath = "images/categories/$catName/$($dir.Name)/$($img.Name)" -replace "\\", "/"
            $imgArr += "`"$relPath`""
        }
        
        $joinedImgs = $imgArr -join ",`n        "
        $productsArr += "      [`n        $joinedImgs`n      ]"
    }
}

$finalOutput = "    `"$catName`": [`n" + ($productsArr -join ",`n") + "`n    ],"
$finalOutput | Out-File -FilePath "$dest\restructured_list.txt" -Encoding utf8
Write-Host "Done!"
