dotnet build -c Release

docker compose -f docker-compose-mssql.yml up --build -d 
docker compose -f docker-compose-mssql-arm.yml up --build -d

docker compose -f docker-compose-mongo.yml up --build -d

docker compose -f docker-compose-mongo.yml down


docker compose up --build -d 
docker compose down -d

--add cert
dotnet dev-certs https --trust
dotnet dev-certs https -ep ./https/aspnetapp.pfx -p hoOkqJB9zu


npm run dev

rm -rf node_modules .next package-lock.json
npm install
npm run build