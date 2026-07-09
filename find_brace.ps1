$text = Get-Content 'script.js' -Raw
$text = $text -replace '(["''])(?:(?=(\\?))\2.)*?\1', '""'
$text = $text -replace '`[^`]*`', '``'
$text = $text -replace '/\*[\s\S]*?\*/', ''
$text = $text -replace '//.*', ''
$lines = $text -split "`n"
$openB = 0; $closeB = 0; $openP = 0; $closeP = 0
for ($i=0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $openB += ($line.ToCharArray() | Where-Object { $_ -eq '{' }).Count
    $closeB += ($line.ToCharArray() | Where-Object { $_ -eq '}' }).Count
    $openP += ($line.ToCharArray() | Where-Object { $_ -eq '(' }).Count
    $closeP += ($line.ToCharArray() | Where-Object { $_ -eq ')' }).Count
    if ($closeB -gt $openB) {
        Write-Host "Extra close brace at line $($i+1): $line"
        break
    }
    if ($closeP -gt $openP) {
        Write-Host "Extra close paren at line $($i+1): $line"
        break
    }
}
Write-Host "Final: B: $openB/$closeB P: $openP/$closeP"
