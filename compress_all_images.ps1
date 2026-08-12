# Full Image Compression + Copy Script for Handycraft Voyage
# Requires: ImageMagick installed OR falls back to System.Drawing for compression

$sourceRoot = "C:\photo\Handycraft Voyage\Selected"
$destRoot = "c:\photo\Hnadycraft voyage\images\categories"
$maxWidth = 900
$maxHeight = 900
$quality = 82

# Ensure output root exists
if (!(Test-Path $destRoot)) { New-Item -ItemType Directory -Path $destRoot | Out-Null }

# Collect all categories data
$categoriesData = @{}

# Get all top-level category folders
$categoryFolders = Get-ChildItem -Path $sourceRoot -Directory

foreach ($catFolder in $categoryFolders) {
    $catName = $catFolder.Name
    $destCatPath = Join-Path $destRoot $catName

    # Create destination category folder
    if (!(Test-Path $destCatPath)) { New-Item -ItemType Directory -Path $destCatPath | Out-Null }

    $categoryImages = @()

    # Get all image files recursively (including sub-product folders)
    $allFiles = Get-ChildItem -Path $catFolder.FullName -Recurse -File | Where-Object {
        $_.Extension -match '\.(jpg|jpeg|png|webp|bmp|gif)$'
    }

    Write-Host "Processing category: $catName ($($allFiles.Count) images)"

    foreach ($file in $allFiles) {
        # Create a safe flat filename (replace path separators with underscores for sub-folder files)
        $relativePath = $file.FullName.Substring($catFolder.FullName.Length).TrimStart('\')
        $safeFileName = $relativePath -replace '\\', '_'
        
        # Ensure extension is .jpg
        $safeFileName = [System.IO.Path]::ChangeExtension($safeFileName, ".jpg")
        $destFile = Join-Path $destCatPath $safeFileName

        try {
            # Load image using System.Drawing
            Add-Type -AssemblyName System.Drawing
            $img = [System.Drawing.Image]::FromFile($file.FullName)

            # Calculate new dimensions maintaining aspect ratio
            $origW = $img.Width
            $origH = $img.Height
            $ratio = [Math]::Min($maxWidth / $origW, $maxHeight / $origH)

            if ($ratio -ge 1) {
                # Image is already small enough
                $newW = $origW
                $newH = $origH
            } else {
                $newW = [int]($origW * $ratio)
                $newH = [int]($origH * $ratio)
            }

            # Create resized bitmap
            $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
            $graphics = [System.Drawing.Graphics]::FromImage($bmp)
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.DrawImage($img, 0, 0, $newW, $newH)

            # Save as JPEG with quality
            $jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)

            $bmp.Save($destFile, $jpegEncoder, $encoderParams)

            $graphics.Dispose()
            $bmp.Dispose()
            $img.Dispose()

            # Build relative web path
            $webPath = "images/categories/$catName/$safeFileName" -replace '\\', '/'
            $categoryImages += $webPath

            Write-Host "  [OK] $safeFileName"
        } catch {
            Write-Host "  [SKIP] $($file.Name) - $_"
        }
    }

    if ($categoryImages.Count -gt 0) {
        $categoriesData[$catName] = $categoryImages
    }
}

# Generate categories.json
$jsonOutput = $categoriesData | ConvertTo-Json -Depth 5
$jsonPath = "c:\photo\Hnadycraft voyage\images\categories\categories.json"
$jsonOutput | Out-File -FilePath $jsonPath -Encoding UTF8

Write-Host ""
Write-Host "=== DONE ==="
Write-Host "categories.json written to: $jsonPath"
Write-Host "Total categories: $($categoriesData.Keys.Count)"
foreach ($key in $categoriesData.Keys) {
    Write-Host "  $key : $($categoriesData[$key].Count) images"
}
