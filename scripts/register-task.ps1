# PowerShell script to register Gargbooks AI Orchestrator as a Windows Scheduled Task
# This ensures it runs automatically when the PC starts up.

# Define the absolute path to your project folder
$projectDir = "C:\Users\USER 1\Desktop\gargbooks"
$scriptPath = "$projectDir\scripts\orchestrator.js"

# Create action: Run node with orchestrator script
$action = New-ScheduledTaskAction -Execute "node" -Argument "`"$scriptPath`"" -WorkingDirectory $projectDir

# Create trigger: At system startup
$trigger = New-ScheduledTaskTrigger -AtStartup

# Configure settings (allow running on battery power, keep running, restart if failed)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Register task (needs Administrator privileges to run)
try {
    Register-ScheduledTask -TaskName "GargbooksOrchestrator" -Action $action -Trigger $trigger -Settings $settings -Description "Orquestrador IA de traduções e contos Gargbooks em background" -Force
    Write-Host "✅ Tarefa agendada 'GargbooksOrchestrator' criada com sucesso!" -ForegroundColor Green
    Write-Host "A tarefa iniciará automaticamente na inicialização do Windows." -ForegroundColor Green
} catch {
    Write-Warning "❌ Erro ao registrar tarefa. Por favor, execute este script em um terminal do PowerShell como ADMINISTRADOR."
}
