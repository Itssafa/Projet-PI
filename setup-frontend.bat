@echo off
echo =========================================
echo Configuration du Frontend Angular
echo =========================================

echo.
echo 1. Installation des dependances...
cd frontend
call npm install

echo.
echo 2. Installation des dependances pour charts et material...
call npm install @angular/cdk@16.2.0 @angular/material@16.2.0
call npm install chart.js@4.4.0 ng2-charts@5.0.3

echo.
echo 3. Compilation du projet...
call ng build

echo.
echo =========================================
echo Configuration terminee !
echo.
echo Pour demarrer le frontend :
echo   cd frontend
echo   ng serve
echo.
echo L'application sera disponible sur http://localhost:4200
echo =========================================
pause