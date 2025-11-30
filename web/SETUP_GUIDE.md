# DiaryPro Setup Guide

## Quick Start

The development server should now be running. Access it at:
- **Local:** http://localhost:3001
- **Network:** http://172.16.5.155:3001

## Environment Variables Setup

You need to create a `.env.local` file in the `web/` directory with your Supabase credentials:

1. Create a file named `.env.local` in the `web/` folder
2. Add the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace the values with your actual Supabase project URL and anon key from your Supabase dashboard

## If the Site Can't Be Reached

### Check if the server is running:
```powershell
netstat -ano | findstr ":3001"
```

### If not running, start it:
```powershell
cd web
npm run dev
```

### If port is in use:
```powershell
# Find process using port 3001
netstat -ano | findstr ":3001"

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force

# Then restart
npm run dev
```

### Clear Next.js cache:
```powershell
cd web
Remove-Item -Recurse -Force .next
npm run dev
```

## Troubleshooting

1. **"Site can't be reached"** - Make sure the dev server is running
2. **"Failed to fetch"** - Check your `.env.local` file has correct Supabase credentials
3. **Port already in use** - Kill the process or use a different port: `$env:PORT=3002; npm run dev`

## Access URLs

- Development: http://localhost:3001
- Network access: http://172.16.5.155:3001

