# GMB Audit — Internal Tool

Internal-only Next.js app for running GMB audits on prospects. Password protected.

## Features
- 🔍 **Run Audit** — Search any business, run a full GMB audit, view results on screen
- 📧 **Optional Email** — Send the audit email to a prospect directly from the tool
- 📋 **Audit Log** — View all audits (from both this tool and the public widget) pulled from Monday.com
- 🔒 **Password Gate** — Simple password protection (set via env var)

## Deploy to Vercel

1. Create a new GitHub repo and push this folder's contents
2. Import into Vercel → Next.js auto-detected
3. Add all environment variables (see `.env.example`)
4. Deploy

## Environment Variables

Copy `.env.example` and fill in values. All the same API keys as the public widget.

Key difference: `NEXT_PUBLIC_INTERNAL_PASSWORD` — set this to your desired login password.

## Notes

- The Audit Log reads from the **same Monday.com board** as the public widget, so all leads appear in one place
- Internal runs are logged to Monday with Source = "Internal Tool" and Status = "Internal"
- If email is sent via internal tool, Status = "Sent" (same as public widget)
