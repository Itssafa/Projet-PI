@echo off
echo === DIAGNOSTIC MICROSERVICE GESTION UTILISATEURS ===
echo.

echo [1] Verification de la structure du projet...
if exist "backend\microservice\User\src\main\java\esprit\user\UserApplication.java" (
    echo   ✓ Application principale trouvee
) else (
    echo   ✗ Application principale manquante
)

if exist "backend\microservice\User\pom.xml" (
    echo   ✓ Fichier pom.xml trouve
) else (
    echo   ✗ Fichier pom.xml manquant
)

echo.
echo [2] Verification des fichiers de configuration...
if exist "backend\microservice\User\src\main\resources\application.properties" (
    echo   ✓ Configuration trouvee
) else (
    echo   ✗ Configuration manquante
)

if exist "backend\microservice\User\src\main\java\esprit\user\config\SecurityConfig.java" (
    echo   ✓ Configuration securite trouvee
) else (
    echo   ✗ Configuration securite manquante
)

echo.
echo [3] Verification du frontend...
if exist "frontend\package.json" (
    echo   ✓ Package.json trouve
) else (
    echo   ✗ Package.json manquant
)

if exist "frontend\src\app\app.module.ts" (
    echo   ✓ Module Angular principal trouve
) else (
    echo   ✗ Module Angular principal manquant
)

echo.
echo [4] Test de compilation...
cd backend\microservice\User
echo   Tentative de compilation...
call mvnw.cmd compile -q >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Compilation reussie - Pas de dependance circulaire
) else (
    echo   ✗ Erreur de compilation - Verifier les dependances
)
cd ..\..\..

echo.
echo [5] Instructions de demarrage...
echo   Backend: Executer start-backend.bat
echo   Frontend: Executer start-frontend.bat
echo.
echo [6] Configuration requise...
echo   - MySQL: Creer la base de donnees 'Userdb'
echo   - Email: Configurer SMTP dans application.properties
echo.
echo [7] URLs d'acces...
echo   Frontend: http://localhost:4200
echo   Backend API: http://localhost:8080
echo.
pause