docker build -t isync-web:latest .
docker tag isync-web isynccorporation/isync-web:latest
docker push isynccorporation/isync-web:latest