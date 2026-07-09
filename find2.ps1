$text = Get-Content 'script.js' -Raw
$openB = 0; $closeB = 0; $openP = 0; $closeP = 0
$inString = $false; $stringChar = ''
$inComment = $false; $inLineComment = $false

for ($i=0; $i -lt $text.Length; $i++) {
    $c = $text[$i]
    $nextC = if ($i+1 -lt $text.Length) { $text[$i+1] } else { '' }
    
    if ($inLineComment) {
        if ($c -eq "`n") { $inLineComment = $false }
        continue
    }
    if ($inComment) {
        if ($c -eq '*' -and $nextC -eq '/') { $inComment = $false; $i++; }
        continue
    }
    if ($inString) {
        if ($c -eq '\') { $i++; continue }
        if ($c -eq $stringChar) { $inString = $false }
        continue
    }
    
    if ($c -eq '/' -and $nextC -eq '/') { $inLineComment = $true; $i++; continue }
    if ($c -eq '/' -and $nextC -eq '*') { $inComment = $true; $i++; continue }
    if ($c -eq '"' -or $c -eq "'" -or $c -eq '`') { $inString = $true; $stringChar = $c; continue }
    
    if ($c -eq '{') { $openB++ }
    elseif ($c -eq '}') { 
        $closeB++ 
        if ($closeB -gt $openB) { 
            $lineNum = ($text.Substring(0, $i) -split "`n").Count
            Write-Host "Extra } at line $lineNum"
            break 
        }
    }
    elseif ($c -eq '(') { $openP++ }
    elseif ($c -eq ')') { 
        $closeP++ 
        if ($closeP -gt $openP) { 
            $lineNum = ($text.Substring(0, $i) -split "`n").Count
            Write-Host "Extra ) at line $lineNum"
            break 
        }
    }
}
Write-Host "Final B: $openB/$closeB P: $openP/$closeP"
