Pingo – WhatsApp Reminder Bot

Pingo is a lightweight WhatsApp bot that lets users set reminders in natural Hebrew via WhatsApp, and get notified automatically at the right time.
Built using NestJS, Twilio, Supabase, and Gemini AI, and deployed on Heroku for 24/7 availability.

⸻

📦 Tech Stack
	•	NestJS – Backend framework (TypeScript)
	•	Supabase – PostgreSQL cloud DB (reminder storage)
	•	Twilio WhatsApp Sandbox – Sending & receiving messages
	•	Google Gemini AI – Natural language understanding
	•	Heroku – Hosting and deployment

⸻

📲 What It Does
	•	Users send messages like: תזכיר לי לשתות מים ב-14:30
	•	The bot understands and extracts reminder time and content (via AI NLP)
	•	Reminder is stored in Supabase
	•	At the specified time, Pingo sends a WhatsApp message back with the reminder


🕒 Cron Reminder Sender
	•	Runs every minute
	•	Checks Supabase for reminders with current time
	•	Sends WhatsApp message via Twilio

⸻

💬 Example Use
	1.	User sends: תזכיר לי לשלם חשמל ב-20:00
	2.	Pingo replies: ✅ Reminder saved for 20:00
	3.	At 20:00: 🔔 תזכורת: לשלם חשמל
