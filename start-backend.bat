@echo off
echo Demarrage du microservice Gestion Utilisateurs...
cd backend\microservice\User
echo Compilation du projet...
call mvnw.cmd clean compile -q
if %errorlevel% equ 0 (
    echo Compilation reussie!
    echo Demarrage de l'application Spring Boot...
    call mvnw.cmd spring-boot:run
) else (
    echo Erreur de compilation!
    pause
)

@REM PS : I usually use cmd and type mvnw.cmd spring-boot:run and it works unless no errors occured.