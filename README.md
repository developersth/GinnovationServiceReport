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

deployment next js
✅ Step-by-Step: Run Next.js with PM2
1. Build Your App for Production
bash
Copy
Edit
npm run build
This creates the .next/ directory used for production.

2. Start the App with PM2
Use PM2 to run the production server:

bash
Copy
Edit
pm2 start npm --name "nextjs-app" -- start
Explanation:

npm tells PM2 to run an npm script

--name gives your PM2 process a name

-- start runs the start script in package.json

Your package.json should include:

json
Copy
Edit
"scripts": {
  "start": "next start"
}
3. ✅ Save the Process List
bash
Copy
Edit
pm2 save
This saves the running app so it restarts after reboot.

4. 🔁 Auto-Start PM2 on Boot
bash
Copy
Edit
pm2 startup
Follow the on-screen instructions (it will give you a command to run).

5. 📋 Useful PM2 Commands
Command	Description
pm2 list	View all processes
pm2 logs	View logs
pm2 restart nextjs-app	Restart the app
pm2 stop nextjs-app	Stop it
pm2 delete nextjs-app	Remove it

Clean up:

bash
Copy
Edit
pm2 delete nextjs-app

npm run build
pm2 start ecosystem.config.js

pm2 startup
pm2 save

pm2 flush

pm2 start ecosystem.config.js --log-date-format "YYYY-MM-DD HH:mm:ss" --time