@echo off
echo === TEST D'INSCRIPTION ===
echo.

echo [1] Test avec données valides...
curl -X POST -H "Content-Type: application/json" -d "{\"nom\":\"Test\",\"prenom\":\"User\",\"email\":\"test@example.com\",\"motDePasse\":\"password123\",\"telephone\":\"12345678\",\"adresse\":\"123 Test Street\",\"userType\":\"UTILISATEUR\"}" http://localhost:8080/api/auth/register

echo.
echo.
echo [2] Test avec données invalides (email manquant)...
curl -X POST -H "Content-Type: application/json" -d "{\"nom\":\"Test\",\"prenom\":\"User\",\"motDePasse\":\"password123\"}" http://localhost:8080/api/auth/register

echo.
echo.
echo [3] Test route de sante...
curl -s http://localhost:8080/api/health

echo.
echo.
pause