@echo off
title Retos en Pareja - Servidor
cd /d "%~dp0retos-parejas"

if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

echo Iniciando servidor...
call npm run dev
pause