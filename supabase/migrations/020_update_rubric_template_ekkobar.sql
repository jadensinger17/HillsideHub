-- 020: Update interview rubric template
-- Replaces old behavioral questions (b1–b9) and old Quick Screen section (qs1–qs3)
-- with the full Hillside GENESIS behavioral question bank (organized by category)
-- and the Ekkobar case study Q&A (qs1–qs9 + qs3b follow-up).
-- Existing responses/notes columns are untouched.

UPDATE interview_rubrics
SET template = '{
  "sections": [
    {
      "title": "Behavioral — General",
      "fields": [
        { "key": "sched", "label": "NOTE: Confirm candidate can attend — Mon/Wed 11:00–12:15 · Thu IB Meetings 4:30–6:00 · Thu Work Sessions 5:00 PM", "type": "boolean" },
        { "key": "g1", "label": "Tell us about yourself.", "type": "rating", "max": 5, "hint": "Dig into specifics on resume if unclear; ask about career goals and aspirations if they don''t elaborate" },
        { "key": "g2", "label": "Why do you want to join Hillside?", "type": "rating", "max": 5 }
      ]
    },
    {
      "title": "Behavioral — Drive",
      "fields": [
        { "key": "d1", "label": "Do you describe yourself as resilient? If so, please provide some examples.", "type": "rating", "max": 5 },
        { "key": "d2", "label": "Tell me about a time you failed — how did you react?", "type": "rating", "max": 5 },
        { "key": "d3", "label": "What accomplishment(s) are you most proud of?", "type": "rating", "max": 5 },
        { "key": "d4", "label": "Where do you get your motivation?", "type": "rating", "max": 5 }
      ]
    },
    {
      "title": "Behavioral — Teamwork",
      "fields": [
        { "key": "tw1", "label": "How would you handle it if your team resisted a new idea you introduced?", "type": "rating", "max": 5 },
        { "key": "tw2", "label": "How do you ensure that team members are committed to your schedule?", "type": "rating", "max": 5 },
        { "key": "tw3", "label": "Describe a time when you asked for extra responsibility in previous roles.", "type": "rating", "max": 5 },
        { "key": "tw4", "label": "If you and your teammate are both asked to solve a problem and your teammate''s idea gets picked but you think your idea is a better solution, how would you handle it?", "type": "rating", "max": 5 },
        { "key": "tw5", "label": "In your opinion, what makes a good leader? How do you work to exemplify this?", "type": "rating", "max": 5 }
      ]
    },
    {
      "title": "Behavioral — Communication",
      "fields": [
        { "key": "c1", "label": "One of your work colleagues keeps calling in sick and your manager continually asks you to cover for them. What would you do?", "type": "rating", "max": 5 },
        { "key": "c2", "label": "You are creating a presentation to explain your deal to other team members. What would you do to make the presentation engaging and informative?", "type": "rating", "max": 5 },
        { "key": "c3", "label": "If your boss is consistently unresponsive throughout the day and then expects you to communicate your work past 10pm, how would you handle that situation?", "type": "rating", "max": 5 },
        { "key": "c4", "label": "You realized that you have stretched yourself thin and will not be able to meet the deadline set for your project. How would you handle this situation?", "type": "rating", "max": 5 }
      ]
    },
    {
      "title": "Behavioral — Integrity & Accountability",
      "fields": [
        { "key": "i1", "label": "Can you describe a time you had to make a tough decision that went against popular opinion or the majority view of your team?", "type": "rating", "max": 5 },
        { "key": "i2", "label": "What would you do if you made a mistake that no one else noticed?", "type": "rating", "max": 5 },
        { "key": "i3", "label": "Give me an example when you spoke out about something you did not feel was right.", "type": "rating", "max": 5 },
        { "key": "i4", "label": "Can you talk me through a situation where you had to share negative information with a teammate? How did they respond?", "type": "rating", "max": 5 },
        { "key": "i5", "label": "What is a weakness that you are still working on?", "type": "rating", "max": 5 },
        { "key": "i6", "label": "How do you show accountability at work?", "type": "rating", "max": 5 },
        { "key": "i7", "label": "Your boss trusts you with part of the project and doesn''t give you any checkpoints, just a final deadline. How do you go about the assignment?", "type": "rating", "max": 5 },
        { "key": "i8", "label": "If your boss assigns you an extra project idea and later forgets about it, how would you proceed?", "type": "rating", "max": 5 }
      ]
    },
    {
      "title": "Behavioral — Balance",
      "fields": [
        { "key": "bal1", "label": "Where would Hillside fall on your priority list, and what are your major priorities?", "type": "rating", "max": 5, "hint": "If they immediately say Hillside is first, follow up: ''How many hours a week do you expect to dedicate to Hillside?''" },
        { "key": "bal2", "label": "It''s 4:55 pm on a Friday and your supervisor asks you to start an urgent task that cannot wait until Monday. It will take one hour but you have plans. What would you do?", "type": "rating", "max": 5 },
        { "key": "bal3", "label": "How would you ask for help if you had issues developing a healthy work-life balance?", "type": "rating", "max": 5 },
        { "key": "bal4", "label": "You are staffed on a Hillside deal with intensive deliverables this week, but you haven''t studied for an important exam and are falling behind on homework. How would you proceed?", "type": "rating", "max": 5 },
        { "key": "bal5", "label": "How do you balance your work and personal life effectively?", "type": "rating", "max": 5 }
      ]
    },
    {
      "title": "Behavioral — Diversity",
      "fields": [
        { "key": "div1", "label": "\"Managers must group similar people for better productivity.\" Comment on this statement.", "type": "rating", "max": 5 },
        { "key": "div2", "label": "How do you define diversity and how do you feel you fit into that definition?", "type": "rating", "max": 5 },
        { "key": "div3", "label": "Please explain ''equity'' and ''inclusion'' from the context of diversity in the workplace.", "type": "rating", "max": 5 },
        { "key": "div4", "label": "If you were to create a diversity and inclusion plan for your current company or organization, what would be your priorities?", "type": "rating", "max": 5 },
        { "key": "div5", "label": "In your opinion, what is the most challenging aspect of working in a diverse environment?", "type": "rating", "max": 5 }
      ]
    },
    {
      "title": "Behavioral — Fun",
      "fields": [
        { "key": "f1", "label": "What do you do for fun?", "type": "rating", "max": 5 },
        { "key": "f2", "label": "What is the last book you read? Or: What is your favorite book?", "type": "rating", "max": 5 },
        { "key": "f3", "label": "Tell us about a topic you read about in the news recently — what did you think of it?", "type": "rating", "max": 5 },
        { "key": "f4", "label": "What is something unique you would bring to the fund?", "type": "rating", "max": 5 },
        { "key": "f5", "label": "What is the biggest item on your travel bucket list?", "type": "rating", "max": 5 },
        { "key": "f6", "label": "Is there anything you would like to tell us that was not captured in our conversation today?", "type": "rating", "max": 5 },
        { "key": "f7", "label": "Do you have any questions for us?", "type": "rating", "max": 5, "hint": "Asked thoughtful questions about the analyst experience" }
      ]
    },
    {
      "title": "Technical Interview — Conceptual/Hillside (15 min)",
      "fields": [
        { "key": "t1a", "label": "1A. What stages does Hillside Ventures invest in?", "type": "rating", "max": 5, "hint": "Pre-seed to Series A" },
        { "key": "t1b", "label": "1B. What differentiates early stage and late stage?", "type": "rating", "max": 5, "hint": "Demonstrates an understanding of key differentiators/attributes" },
        { "key": "t2", "label": "2. What is a Hillside GENESIS portfolio company that interests you? Why?", "type": "rating", "max": 5, "hint": "Talks in depth about deal details, current company performance, etc." },
        { "key": "t3", "label": "3. What''s a trend within your vertical of interest or in VC that you''ve been following?", "type": "rating", "max": 5, "hint": "Names and elaborates on a trend" },
        { "key": "t4", "label": "4. What is our 5-stage investment process?", "type": "rating", "max": 5, "hint": "Source → Quick Screen → One Pager → Memo → Investment Board" },
        { "key": "t5", "label": "5. During the Quick Screen stage, we evaluate potential, uniqueness, and viability. How would you evaluate a company to determine if it should move forward?", "type": "rating", "max": 5, "hint": "Names 3 things a VC would look at" }
      ]
    },
    {
      "title": "Technical Interview — Quick Screen Analysis / Ekkobar Case Study (15 min)",
      "fields": [
        { "key": "qs1", "label": "Can you give me a summary of the business and what problem they are solving?", "type": "rating", "max": 5, "hint": "Accurately describes AI-driven analytics platform eliminating guesswork in sponsorships/talent partnerships; identifies vanity metrics problem" },
        { "key": "qs2", "label": "Differentiation — is there any? What was on the deck? Is this enough to sway an opinion?", "type": "rating", "max": 5, "hint": "Identifies proprietary database, patented algorithms, qualitative depth vs. surface metrics; defends or challenges whether it''s compelling" },
        { "key": "qs3", "label": "What is Ekkobar''s business model? How do they make money?", "type": "rating", "max": 5, "hint": "B2B SaaS; recurring subscription revenue from brands, leagues, and sports organizations" },
        { "key": "qs3b", "label": "Follow-up: With recent developments in AI, do you think this will affect the business? If so, in what way?", "type": "rating", "max": 5, "hint": "Considers commoditization risk vs. tailwind; discusses defensibility of proprietary data/algorithms" },
        { "key": "qs4", "label": "Management team — who are they and what are their experiences?", "type": "rating", "max": 5, "hint": "Notes proven track record of exits and deep industry connections; acknowledges if info was absent from deck" },
        { "key": "qs5", "label": "What are the use of funds for this round? Why is this important?", "type": "rating", "max": 5, "hint": "Articulates why capital deployment matters at this stage; flags if missing from deck" },
        { "key": "qs6", "label": "What is their notable traction? Why do you think they value Ekkobar''s services?", "type": "rating", "max": 5, "hint": "References PGA/LIV Golf case study as proof of insight depth; connects NIL growth and real-time engagement demand as drivers" },
        { "key": "qs7", "label": "Is their go-to-market strategy viable for the business?", "type": "rating", "max": 5, "hint": "Evaluates B2B sales motion targeting brands/leagues; considers NIL market entry and sports/entertainment verticals" },
        { "key": "qs8", "label": "Do you have any information on the competitive landscape? (Expected: no — then ask what they would do to find out)", "type": "rating", "max": 5, "hint": "Honestly says no; proposes concrete research methods (Crunchbase, industry reports, customer interviews, etc.)" },
        { "key": "qs9", "label": "Are there any holes in the presentation? What information is missing that would be key to forming an opinion?", "type": "rating", "max": 5, "hint": "Identifies gaps (e.g., pricing, financials, competitive data, team bios, churn); critical thinking and intellectual honesty" }
      ]
    }
  ]
}'::jsonb;
