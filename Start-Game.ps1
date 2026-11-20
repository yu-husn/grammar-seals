Set-Location -LiteralPath $PSScriptRoot
if (!(Test-Path -LiteralPath 'node_modules/vite/bin/vite.js')) { throw '請先執行 npm install 安裝依賴。' }
node node_modules/vite/bin/vite.js --host 0.0.0.0
