$text = Get-Content 'telemetry-player.js' -Raw
$text = $text -replace '/\*[\s\S]*?\*/', ''
$text = $text -replace '//.*', ''

$openBraces = ($text.ToCharArray() | Where-Object { $_ -eq '{' }).Count
$closeBraces = ($text.ToCharArray() | Where-Object { $_ -eq '}' }).Count
$openParens = ($text.ToCharArray() | Where-Object { $_ -eq '(' }).Count
$closeParens = ($text.ToCharArray() | Where-Object { $_ -eq ')' }).Count
$openBrackets = ($text.ToCharArray() | Where-Object { $_ -eq '[' }).Count
$closeBrackets = ($text.ToCharArray() | Where-Object { $_ -eq ']' }).Count

Write-Host "Braces: $openBraces / $closeBraces"
Write-Host "Parens: $openParens / $closeParens"
Write-Host "Brackets: $openBrackets / $closeBrackets"
