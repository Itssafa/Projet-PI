@echo off
echo === TEST DE DEMARRAGE SANS ERREUR CORS ===
echo.

echo L'application devrait maintenant demarrer sans l'erreur:
echo "allowedOrigins cannot contain the special value '*'"
echo.

echo Configuration actuelle:
echo - CORS desactive dans SecurityConfig
echo - @CrossOrigin configure sur chaque controleur
echo - Origins specifiques: localhost:4200, 127.0.0.1:4200
echo.

echo Redemarrez l'application backend et verifiez qu'il n'y a plus d'erreur CORS.
echo.

echo Test rapide une fois l'application demarree:
echo.
echo curl http://localhost:8080/api/health
echo.

pause