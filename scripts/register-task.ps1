# PowerShell script to register Gargbooks AI Orchestrator v3 as a Windows Scheduled Task
# This ensures it runs automatically when the PC starts up and restarts if it crashes.

# Define the absolute path to your project folder
$projectDir = "C:\Users\USER 1\Desktop\gargbooks"
$scriptPath = "$projectDir\scripts\orchestrator.js"

# Create action: Run node with orchestrator script
$action = New-ScheduledTaskAction -Execute "node" -Argument "`"$scriptPath`"" -WorkingDirectory $projectDir

# Create trigger: At system startup
$trigger = New-ScheduledTaskTrigger -AtStartup

# Configure settings:
# - AllowStartIfOnBatteries: Run even on battery
# - DontStopIfGoingOnBatteries: Continue on battery
# - StartWhenAvailable: Start if missed
# - RestartCount: Number of restart attempts on failure (3)
# - RestartInterval: Wait 1 minute before restarting
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

# Register task (needs Administrator privileges to run)
try {
    Register-ScheduledTask -TaskName "GargbooksOrchestrator" -Action $action -Trigger $trigger -Settings $settings -Description "Orquestrador IA v3 - Obras completas DP/Gutenberg + Contos Round-Robin (tradução e geração automática)" -Force
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  Tarefa 'GargbooksOrchestrator' CRIADA!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host " Inicia automaticamente com o Windows" -ForegroundColor Green
    Write-Host " Reinicia até 3x em caso de falha (1min intervalo)" -ForegroundColor Green
    Write-Host ""
    Write-Host " Para parar:        Stop-ScheduledTask -TaskName 'GargbooksOrchestrator'" -ForegroundColor Yellow
    Write-Host " Para iniciar:      Start-ScheduledTask -TaskName 'GargbooksOrchestrator'" -ForegroundColor Yellow
    Write-Host " Para ver logs:     Get-ScheduledTask -TaskName 'GargbooksOrchestrator' | Get-ScheduledTaskInfo" -ForegroundColor Yellow
    Write-Host " Para remover:      Unregister-ScheduledTask -TaskName 'GargbooksOrchestrator' -Confirm:`$false" -ForegroundColor Yellow
} catch {
    Write-Warning "❌ Erro ao registrar tarefa. Execute o PowerShell como ADMINISTRADOR."
    Write-Warning "   Botão direito > 'Executar como administrador'"
}
