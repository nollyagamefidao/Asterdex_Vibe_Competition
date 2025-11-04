# Asterdex_Vibe_Competition
AI Trading BOT for Asterdex with Interative Dashboard

You can run the Maravilla file from any VPS, you have to provide the Asterdex API and also you need DEEPSEEK API for getting AI recommendations, in the case you don't want to use DEEPSEEK the bot has a fallback check to use the provided strategy by default. 

🤖 Asterdex Trading Bot + Dashboard - Production Package

✨ What's Included

This package contains everything you need to deploy your Asterdex trading bot with real-time dashboard.

Bot Features

✅ AI-powered trading decisions (DeepSeek Chat V3.1)
✅ Multi-position management (up to 10 positions)
✅ Token scanner (50+ tokens)
✅ Break-even stop loss
✅ Trailing stop loss
✅ Dynamic take profit
✅ Twitter/X integration
✅ Real-time dashboard integration

Dashboard Features

✅ Real-time position monitoring
✅ Trade history with P&L tracking
✅ AI decision log viewer
✅ Scanner opportunities display
✅ DeepSeek conversation viewer
✅ Account balance tracking
📦 Package Structure

YOUR SERVER
├── bot/
│   ├── maravilla-with-dashboard.js    (Main bot file)
│   ├── asterdex-simple-client.js       (API client)
│   ├── config.env                      (Bot configuration)
│   ├── ecosystem.config.js             (PM2 configuration)
│   ├── package.json                    (Dependencies)
│   └── logs/                           (Log directory)
│
├── dashboard/
│   ├── client/                         (Frontend React app)
│   ├── server/                         (Backend Express server)
│   ├── shared/                         (Shared code)
│   ├── package.json                    (Dependencies)
│   ├── .env                            (Dashboard configuration)
│   └── (config files)
│
├── DEPLOYMENT_GUIDE.md                 (Full deployment instructions)
└── README.md                           (This file)

🚀 Quick Start
Upload to VPS

Bot files → /yourpath/asterdex-bot/
Dashboard files → /yourpath/CryptoCompass/



Configure API Keys

nano /yourpath/asterdex-bot/config.env
nano /yourpath/CryptoCompass/.env

Install Dependencies

cd /yourpath/asterdex-bot && npm install
cd /yourpath/CryptoCompass && npm install --production && npm run build

Start Services

cd /yourpath/asterdex-bot
pm2 start ecosystem.config.js
pm2 save

Access Dashboard

http://YOUR_VPS_IP:5000

📖 Full Documentation


🔑 Required Configuration

Bot (config.env)

ASTERDEX_API_KEY=your_key_here
ASTERDEX_SECRET_KEY=your_secret_here
DEEPSEEK_API_KEY=your_deepseek_key_here


Dashboard (.env)

ASTERDEX_API_KEY=your_key_here
ASTERDEX_SECRET_KEY=your_secret_here
PORT=5000


⚙️ System Requirements
OS: Linux (Ubuntu 20.04+ or CentOS 7+)
Node.js: v18.0.0 or higher
RAM: Minimum 2GB (4GB recommended)
Storage: 5GB free space
Network: Stable internet connection

🛠️ Essential Commands

# Check status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Monitor resources
pm2 monit


📊 Dashboard Access

Once deployed, access your dashboard at:

URL: http://YOUR_VPS_IP:5000



Features:

Live position tracking
Trade history
AI decision insights
Scanner opportunities
P&L tracking

🐛 Troubleshooting

Bot won't start?

pm2 logs asterdex-bot --err


Dashboard not accessible?

# Check if running
pm2 status dashboard

# Check port
netstat -tulpn | grep 5000

# Open firewall
sudo ufw allow 5000/tcp


Missing dependencies?

cd /yourpath/asterdex-bot
npm install

cd /yourpath/CryptoCompass
npm install --production
npm run build


📞 Support

For issues:

Check pm2 logs
🚀 Quick Start





Upload to VPS





Bot files → /root/asterdex-bot/



Dashboard files → /root/CryptoCompass/



Configure API Keys

nano /root/asterdex-bot/config.env
nano /root/CryptoCompass/.env




Install Dependencies

cd /root/asterdex-bot && npm install
cd /root/CryptoCompass && npm install --production && npm run build




Start Services

cd /root/asterdex-bot
pm2 start ecosystem.config.js
pm2 save




Access Dashboard

http://YOUR_VPS_IP:5000


📖 Full Documentation

See DEPLOYMENT_GUIDE.md for complete step-by-step instructions, troubleshooting, and best practices.

🔑 Required Configuration

Bot (config.env)

ASTERDEX_API_KEY=your_key_here
ASTERDEX_SECRET_KEY=your_secret_here
DEEPSEEK_API_KEY=your_deepseek_key_here


Dashboard (.env)

ASTERDEX_API_KEY=your_key_here
ASTERDEX_SECRET_KEY=your_secret_here
PORT=5000


⚙️ System Requirements





OS: Linux (Ubuntu 20.04+ or CentOS 7+)



Node.js: v18.0.0 or higher



RAM: Minimum 2GB (4GB recommended)



Storage: 5GB free space



Network: Stable internet connection

🛠️ Essential Commands

# Check status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Monitor resources
pm2 monit


📊 Dashboard Access

Once deployed, access your dashboard at:





URL: http://YOUR_VPS_IP:5000



Features:





Live position tracking



Trade history



AI decision insights



Scanner opportunities



P&L tracking

🐛 Troubleshooting

Bot won't start?

pm2 logs asterdex-bot --err


Dashboard not accessible?

# Check if running
pm2 status dashboard

# Check port
netstat -tulpn | grep 5000

# Open firewall
sudo ufw allow 5000/tcp


Missing dependencies?

cd /root/asterdex-bot
npm install

cd /root/CryptoCompass
npm install --production
npm run build


📞 Support

For issues:
Check pm2 logs
Verify API keys in config files
Ensure Node.js v18+ is installed
Check firewall settings

⚠️ Important Notes

Never share your config.env or .env files - they contain sensitive API keys
Always use PM2 for process management in production
Monitor logs regularly to catch issues early
Keep backup of your configuration files
Test on testnet first before going live with real funds

🎯 What Happens After Deployment

Bot connects to Asterdex and starts monitoring markets
AI analyzes 50+ tokens every scan cycle
Bot opens positions based on AI recommendations
Dashboard updates in real-time with all activity
You can monitor everything from your browser

✅ Deployment Checklist

VPS provisioned with Node.js v18+
PM2 installed globally
Files uploaded to correct directories
config.env configured with real API keys
.env configured with real API keys
Bot dependencies installed
Dashboard dependencies installed and built
PM2 services started
Port 5000 opened in firewall
Dashboard accessible in browser
Bot logs showing successful connection
First scan completed without errors

🎉 Ready to trade! Your bot is now monitoring markets 24/7.erify API keys in config files

Ensure Node.js v18+ is installed
Check firewall settings
Review DEPLOYMENT_GUIDE.md

⚠️ Important Notes

Never share your config.env or .env files - they contain sensitive API keys
Always use PM2 for process management in production
Monitor logs regularly to catch issues early
Keep backup of your configuration files
Test on testnet first before going live with real funds

🎯 What Happens After Deployment

Bot connects to Asterdex and starts monitoring markets
AI analyzes 50+ tokens every scan cycle
Bot opens positions based on AI recommendations
Dashboard updates in real-time with all activity
You can monitor everything from your browser

✅ Deployment Checklist

VPS provisioned with Node.js v18+
PM2 installed globally
Files uploaded to correct directories
config.env configured with real API keys
.env configured with real API keys
Bot dependencies installed
Dashboard dependencies installed and built
PM2 services started
Port 5000 opened in firewall
Dashboard accessible in browser
Bot logs showing successful connection
First scan completed without errors



🎉 Ready to trade! Your bot is now monitoring markets 24/7.
