# SnapTask 90-second demo

## 0–10 seconds — The unfinished intention

Open on the SnapTask homepage.

“Screenshots are basically unfinished intentions. We save events, flights, bills, and messages because we plan to deal with them later—but screenshots are passive.”

Point to **A screenshot is now a task.**

## 10–25 seconds — A screenshot thread

Click **Try a trip**. If demonstrating live instead, select the flight, hotel, and conference screenshots together and click **Analyze 3 screenshots**.

“SnapTask doesn’t just OCR them. It understands that these three screenshots belong to the same trip.”

Briefly show the three selectable thumbnails: **Flight**, **Hotel**, and **Conference**.

## 25–40 seconds — What matters

Read the main result:

> “You leave Friday morning, check into your hotel that afternoon, and need to be at the conference by 9 AM Saturday.”

“Gemini combined three separate confirmations into the one thing I actually need to know.”

## 40–50 seconds — Why it was saved

Point to **Why you probably saved these** and read:

> “You likely saved these to keep your travel details together.”

“That language is intentionally uncertain. SnapTask treats this as a useful inference, not a fact.”

## 50–60 seconds — Urgency and timeline

Point to the **Soon** urgency badge, then scan the connected timeline:

- Friday 6:35 AM — Flight departs from DCA
- Friday 3:00 PM — Hotel check-in
- Saturday 9:00 AM — Conference begins

“Dates are not trusted blindly—the server checks reliable parsed dates against today before showing urgency.”

## 60–75 seconds — Turn it into a plan

Click **Turn this into a plan**.

Show the five-step checklist and its explicit/suggested labels. Check off one item, then click **Copy entire plan**.

“The plan stays concise, distinguishes what the screenshot actually requires from what SnapTask suggests, and needs no account or database.”

## 75–85 seconds — Act on the screenshot

Select the **Hotel** thumbnail and click the highlighted address to open Maps. As an alternative, select **Flight** and click the highlighted departure time to jump to the calendar action.

“The screenshot itself becomes interactive. If Gemini cannot place a reliable highlight, the rest of the result still works.”

## 85–90 seconds — Close

“SnapTask turns screenshots from passive images into an actionable layer for your life: understand, connect, prioritize, and act.”

## Demo checklist

- Prefer **Try a trip** for a deterministic offline demo.
- Keep three live travel screenshots ready if the network is reliable.
- Confirm `GEMINI_API_KEY` is set and restart the server after environment changes.
- Open the app once before presenting so the development server is warm.
- Verify the browser allows new tabs, clipboard access, and file downloads.
- Keep **Try an event** available as the shortest calendar-action fallback.
