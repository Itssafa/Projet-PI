@echo off
echo Demarrage du frontend Angular...
cd frontend

echo Verification des dependances...
if not exist "node_modules" (
    echo Installation des dependances avec legacy-peer-deps...
    call npm install --legacy-peer-deps
) else (
    echo Dependencies deja installees.
)

if %errorlevel% equ 0 (
    echo Dependencies OK!
    echo Demarrage du serveur de developpement...
    echo Frontend sera disponible sur: http://localhost:4200
    echo Backend doit etre demarré sur: http://localhost:8080
    call npm start
) else (
    echo Erreur lors de l'installation des dependances!
    echo Tentative avec --force...
    call npm install --force
    if %errorlevel% equ 0 (
        call npm start
    ) else (
        echo Echec de l'installation. Verifiez Node.js et npm.
        pause
    )
)

