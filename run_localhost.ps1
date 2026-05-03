# FoodBridge Local Server (PowerShell)
# Runs on http://localhost:8000

$port = 8000
$url = "http://localhost:$port/demo/index.html"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  🌱 FoodBridge - Local Server" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Starting server on http://localhost:$port" -ForegroundColor Cyan
Write-Host ""

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "✅ Opening browser..." -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Access the demo at:" -ForegroundColor Yellow
    Write-Host "   http://localhost:$port/demo/index.html" -ForegroundColor White
    Write-Host ""
    Write-Host "⏹️  Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    # Open browser
    Start-Process $url
    
    # Server loop
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get requested file path
        $path = $request.Url.LocalPath
        if ($path -eq "/") {
            $path = "/demo/index.html"
        }
        
        $filePath = Join-Path $PSScriptRoot $path.TrimStart('/')
        
        Write-Host "📄 Request: $path" -ForegroundColor Gray
        
        if (Test-Path $filePath) {
            # Read file
            $content = [System.IO.File]::ReadAllBytes($filePath)
            
            # Set content type
            $extension = [System.IO.Path]::GetExtension($filePath)
            $contentType = switch ($extension) {
                ".html" { "text/html" }
                ".css" { "text/css" }
                ".js" { "application/javascript" }
                ".json" { "application/json" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif" { "image/gif" }
                ".svg" { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($content, 0, $content.Length)
        }
        else {
            # 404 Not Found
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found: $path")
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        
        $response.Close()
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
finally {
    $listener.Stop()
    Write-Host ""
    Write-Host "⏹️  Server stopped" -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor Green
}
