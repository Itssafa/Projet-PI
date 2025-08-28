@echo off
echo =========================================
echo Generation des composants Angular
echo =========================================

cd frontend

echo.
echo Generation des composants manquants...

echo Generating EmailVerificationComponent...
call ng generate component components/auth/email-verification --skip-tests

echo Generating AdminDashboardComponent...
call ng generate component components/dashboards/admin-dashboard --skip-tests

echo Generating AgencyDashboardComponent...
call ng generate component components/dashboards/agency-dashboard --skip-tests

echo Generating ClientDashboardComponent...  
call ng generate component components/dashboards/client-dashboard --skip-tests

echo Generating UserDashboardComponent...
call ng generate component components/dashboards/user-dashboard --skip-tests

echo Generating UserListComponent...
call ng generate component components/admin/user-list --skip-tests

echo Generating StatisticsComponent...
call ng generate component components/admin/statistics --skip-tests

echo Generating ProfileComponent...
call ng generate component components/shared/profile --skip-tests

echo Generating NavbarComponent...
call ng generate component components/shared/navbar --skip-tests

echo.
echo =========================================
echo Composants generes avec succes !
echo.
echo Vous devrez maintenant :
echo 1. Copier le contenu des fichiers TS/HTML/CSS crees precedemment
echo 2. Mettre a jour app.module.ts pour inclure tous les composants  
echo 3. Mettre a jour app-routing.module.ts avec toutes les routes
echo =========================================
pause