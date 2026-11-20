Set-Location -LiteralPath $PSScriptRoot
if (!(Test-Path -LiteralPath 'dist/index.html')) {
  node node_modules/vite/bin/vite.js build
  if ($LASTEXITCODE -ne 0) { throw '正式建置失敗，請查看上方訊息。' }
}
node scripts/serve-built.mjs
