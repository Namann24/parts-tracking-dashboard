(Get-Content src\App.tsx) | ForEach-Object {
    $_ -replace 'addToast\(.*System data has been reset to factory defaults\."\);', 'addToast("🔄 System data has been reset to factory defaults.");' `
       -replace 'addToast\(.*Status reverted"\);', 'addToast("↩️ Status reverted");' `
       -replace 'addToast\(.*Order updated to \$\{newStatus\}.*', 'addToast(✅ Order updated to , handleUndo);' `
       -replace 'addToast\(.*Operational note added to \$\{orderId\}\.\);', 'addToast(✅ Operational note added to .);' `
       -replace 'addToast\(.*New order \$\{newId\} created successfully\.\);', 'addToast(✅ New order  created successfully.);' `
       -replace 'addToast\(.*CSV Export downloaded successfully\."\);', 'addToast("✅ CSV Export downloaded successfully.");'
} | Set-Content src\App.tsx -Encoding UTF8
