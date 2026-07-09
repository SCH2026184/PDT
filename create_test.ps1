$scriptContent = Get-Content 'script.js' -Raw
$html = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Test</title>
</head>
<body>
<script>
window.onerror = function(msg, url, line) { 
    document.body.innerHTML += "<h2>Erro Linha " + line + ": " + msg + "</h2>"; 
};
</script>
<script>
$scriptContent
</script>
</body>
</html>
"@
Set-Content 'test.html' -Value $html
