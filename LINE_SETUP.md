# LINE Login setup (DEV)

1) Go to https://developers.line.biz/ -> Your Provider -> Your Channel (LINE Login)
2) In LINE Login tab -> Callback URL, add exactly:
   - http://localhost:3000/api/auth/callback
   - If testing from another device in LAN, also add:
     - http://<your-lan-ip>:3000/api/auth/callback (e.g. http://10.50.144.39:3000/api/auth/callback)
3) Scopes: openid, profile (already used by code)
4) App types: Web app
5) Copy your Channel ID and Channel secret into .env.local as:
   - LINE_CHANNEL_ID=2008516328
   - LINE_CHANNEL_SECRET=your_secret

# LINE LIFF setup (DEV)

1) Go to https://developers.line.biz/ -> Your Provider -> Your Channel
2) Click on the "LIFF" tab
3) Add a new LIFF app or use existing one:
   - LIFF app name: Choose any name (e.g., "SDS_DEV_OA")
   - Size: Full (recommended for full-screen experience)
   - Endpoint URL: http://localhost:3000 (for development)
   - Scopes: Select profile, openid, chat_message.write (for sending messages)
   - BLE feature: Off (unless needed)
4) After creating, copy the LIFF ID (format: 2008516328-xxxxxxxx)
5) Add to .env.local:
   - NEXT_PUBLIC_LIFF_ID=your_liff_id
6) Restart dev server if you change .env.local

Run locally:
- npm run dev
- Open http://localhost:3000
- Click "Login with LINE" -> consent -> redirects back to Home and show displayName, userId, profile image

Testing LIFF:
- To test LIFF features, open the LIFF URL in LINE app: https://liff.line.me/your_liff_id
- The bottom bar will only appear when running inside the LINE app (detected via isInClient)
- Bottom bar buttons:
  - 🏠 Home: Navigate to home page
  - 📤 Share: Open current page in new window
  - 💬 Send: Send a message to the current chat
  - ✖️ Close: Close the LIFF window

Notes:
- Logout: /api/auth/logout
- Login URL (direct): /api/auth/login
- Callback handler: /api/auth/callback
- Sessions: iron-session cookie name 'linecrm_session'
- LIFF Hook: src/hooks/useLiff.ts
- Bottom Bar Component: src/components/LiffBottomBar.tsx
