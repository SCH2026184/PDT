$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8006/")
try {
    $listener.Start()
    Write-Host "Server listening on http://localhost:8006/"
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $urlPath = $request.Url.LocalPath
            if ($urlPath -eq "/") { $urlPath = "/index.html" }
            # Remove query strings
            if ($urlPath.Contains("?")) { $urlPath = $urlPath.Split("?")[0] }
            $localPath = Join-Path "c:\Users\Diego Schroeder\Desktop\Antigravity\PDE II" $urlPath.TrimStart('/')
            
            if (Test-Path $localPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($localPath)
                
                if ($localPath.EndsWith(".html")) { $response.ContentType = "text/html; charset=utf-8" }
                elseif ($localPath.EndsWith(".css")) { $response.ContentType = "text/css" }
                elseif ($localPath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
                elseif ($localPath.EndsWith(".png")) { $response.ContentType = "image/png" }
                elseif ($localPath.EndsWith(".jpg")) { $response.ContentType = "image/jpeg" }
                elseif ($localPath.EndsWith(".pdf")) { $response.ContentType = "application/pdf" }
                
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
            }
            $response.Close()
        } catch {
            Write-Host "Request handling error: $_"
            if ($null -ne $response) {
                try { $response.Close() } catch {}
            }
        }
    }
} finally {
    $listener.Close()
}
