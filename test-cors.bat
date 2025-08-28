@echo off
echo === TEST CONFIGURATION CORS ===
echo.

echo [1] Test CORS avec Origin localhost:4200...
curl -i -X OPTIONS ^
  -H "Origin: http://localhost:4200" ^
  -H "Access-Control-Request-Method: POST" ^
  -H "Access-Control-Request-Headers: Content-Type,Authorization" ^
  http://localhost:8080/api/auth/register

echo.
echo.
echo [2] Test requete POST avec Origin localhost:4200...
curl -i -X POST ^
  -H "Origin: http://localhost:4200" ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"CorsTest\",\"prenom\":\"User\",\"email\":\"cors@test.com\",\"motDePasse\":\"password123\",\"telephone\":\"12345678\",\"adresse\":\"Test Address\",\"userType\":\"UTILISATEUR\"}" ^
  http://localhost:8080/api/auth/register

echo.
echo.
echo [3] Test route de sante...
curl -i http://localhost:8080/api/health

echo.
echo.
pause