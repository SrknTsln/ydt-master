@echo off
cd /d "C:\Users\Serkan\Desktop\YDT Master - DENEY - Kopya"
echo Sunucu basliyor...
echo Bilgisayardan ac: http://localhost
echo CMD penceresini KAPATMAYIN!
python -m http.server 80
pause