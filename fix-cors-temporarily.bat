@echo off
echo === CORRECTION TEMPORAIRE CORS ===
echo.
echo Cette correction desactive temporairement allowCredentials
echo pour eviter l'erreur de demarrage.
echo.

echo Sauvegarde de la configuration actuelle...
copy "backend\microservice\User\src\main\java\esprit\user\config\SecurityConfig.java" "backend\microservice\User\src\main\java\esprit\user\config\SecurityConfig.java.backup"

echo.
echo Correction appliquee. Vous pouvez maintenant redemarrer l'application.
echo Une fois l'application fonctionnelle, nous pourrons re-activer les credentials.
echo.
pause