@echo off
echo === TEST DE L'API DU MICROSERVICE ===
echo.

echo [1] Test de la route de sante...
curl -s http://localhost:8080/api/health
if %errorlevel% equ 0 (
    echo   ✓ Route de sante accessible
) else (
    echo   ✗ Route de sante inaccessible - Verifier que l'application est demarree
)

echo.
echo [2] Test de la route d'inscription (doit retourner une erreur de validation)...
curl -s -X POST -H "Content-Type: application/json" -d "{}" http://localhost:8080/api/auth/register
if %errorlevel% equ 0 (
    echo   ✓ Route d'inscription accessible
) else (
    echo   ✗ Route d'inscription inaccessible
)

echo.
echo [3] Test de la route de connexion (doit retourner une erreur de validation)...
curl -s -X POST -H "Content-Type: application/json" -d "{}" http://localhost:8080/api/auth/login
if %errorlevel% equ 0 (
    echo   ✓ Route de connexion accessible
) else (
    echo   ✗ Route de connexion inaccessible
)

echo.
echo === FIN DES TESTS ===
pause