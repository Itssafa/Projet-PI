@echo off
echo ======================================
echo     VERIFICATION COMPLETE DU PROJET
echo ======================================
echo.

echo [1] Verification du backend...
echo Test de la route de sante...
curl -s http://localhost:8080/api/health > nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Backend operationnel sur port 8080
) else (
    echo   ✗ Backend inaccessible - Demarrer avec start-backend.bat
)

echo.
echo [2] Test de l'API d'inscription...
curl -s -X POST -H "Content-Type: application/json" -d "{\"nom\":\"Test\",\"prenom\":\"Verify\",\"email\":\"verify@test.com\",\"motDePasse\":\"password123\",\"telephone\":\"12345678\",\"adresse\":\"Test Address\",\"userType\":\"UTILISATEUR\"}" http://localhost:8080/api/auth/register > nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ API d'inscription fonctionnelle
) else (
    echo   ✗ Probleme avec l'API d'inscription
)

echo.
echo [3] Verification du frontend...
if exist "frontend\node_modules" (
    echo   ✓ Dependencies Angular installees
) else (
    echo   ✗ Dependencies manquantes - Executer start-frontend.bat
)

if exist "frontend\src\app\app.module.ts" (
    echo   ✓ Module Angular principal present
) else (
    echo   ✗ Structure Angular incomplete
)

echo.
echo [4] Verification des fichiers de configuration...
if exist "backend\microservice\User\src\main\resources\application.properties" (
    echo   ✓ Configuration backend presente
) else (
    echo   ✗ Configuration backend manquante
)

echo.
echo [5] URLs d'acces...
echo   Frontend: http://localhost:4200
echo   Backend API: http://localhost:8080
echo   Test manuel: Ouvrir test-frontend-backend.html
echo.

echo [6] Instructions...
echo   1. S'assurer que MySQL fonctionne avec la base 'Userdb'
echo   2. Demarrer le backend: start-backend.bat
echo   3. Demarrer le frontend: start-frontend.bat
echo   4. Ouvrir http://localhost:4200 dans le navigateur
echo.

echo ======================================
echo     VERIFICATION TERMINEE
echo ======================================
pause