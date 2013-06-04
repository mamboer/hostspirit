@echo off

set APP_NAME=hostspirit
set APP_VERSION=
rem;;set APP_SRCFILES=..\css ..\js ..\img ..\fonts ..\about.html ..\index.html ..\package.json ..\setting.html ..\detail.html ..\icon.png
set APP_SRCFILES=@files.txt
set NW_FOLDER=..\..\nwapp\nw
set NWAPP_FOLDER=..\..\nwapp\release
set NW_BUILDFILES=%NW_FOLDER%\nwfiles.txt
set TEMPFOLDER=_temp

call %NW_FOLDER%\make.bat

rem;; move the zip file to the NWAPP_FOLDER
move "%APP_NAME%%APP_VERSION%.zip" %NWAPP_FOLDER%

pause