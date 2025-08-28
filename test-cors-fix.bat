@echo off
echo === TEST DE LA CORRECTION CORS ===
echo.

echo [1] Redemarrage rapide pour tester...
echo Veuillez redemarrer l'application backend puis tester avec:
echo.

echo [2] Test de base:
echo curl -i http://localhost:8080/api/health
echo.

echo [3] Test CORS simple:
echo curl -i -H "Origin: http://localhost:4200" http://localhost:8080/api/health
echo.

echo [4] Test POST registration:
curl -X POST ^
  -H "Origin: http://localhost:4200" ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"Test\",\"prenom\":\"CORS\",\"email\":\"testcors@example.com\",\"motDePasse\":\"password123\",\"telephone\":\"12345678\",\"adresse\":\"Test Address\",\"userType\":\"UTILISATEUR\"}" ^
  http://localhost:8080/api/auth/register

echo.
echo.
echo Si ce test fonctionne, l'erreur CORS est resolue!
echo Note: allowCredentials est temporairement desactive.
echo.
pause