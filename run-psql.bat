@echo off
chcp 1251 > nul
echo Подключение к PostgreSQL как postgres...
psql -U postgres
pause