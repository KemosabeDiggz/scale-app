// Pre-built agentic workflow templates — each maps to a 2026-2030 SaaS opportunity.
// Every template is a real, runnable multi-step workflow (llm / email / wait steps)
// executed by the runWorkflowStep backend function.

export const WORKFLOW_TEMPLATES = [
  {
    id: 'agentic-builder',
    name: 'Agentic Workflow Builder',
    category: 'Platform',
    rank: '#1 Top Seller',
    tagline: 'An agent that designs other agents.',
    description:
      'The meta-play: describe a business problem and this agent designs a complete multi-step workflow spec and emails it to you. This is the core of the agentic platform category — #1 requested capability (75% of buyers).',
    trigger_prompt:
      'Design a complete autonomous workflow to solve this business problem, then email the spec to me.',
    steps: [
      {
        type: 'llm',
        name: 'analyze_problem',
        prompt:
          'Analyze this business problem and identify the job to be done, the inputs available, and the desired outcome. Problem: {{input}}',
      },
      {
        type: 'llm',
        name: 'design_steps',
        prompt:
          'Using the analysis from {{steps.analyze_problem.output}}, design a 3-5 step autonomous workflow. For each step specify a type (llm, email, or wait), a name, and the prompt or config. Output as a clear numbered list.',
      },
      {
        type: 'llm',
        name: 'spec_summary',
        prompt:
          'Turn the workflow design from {{steps.design_steps.output}} into a clean one-page spec: name, goal, steps, and expected outcome. Problem context: {{input}}',
      },
      {
        type: 'email',
        name: 'email_spec',
        to: '{{input.email}}',
        subject: 'Your autonomous workflow spec',
        body: '{{steps.spec_summary.output}}',
      },
    ],
  },
  {
    id: 'healthcare-prior-auth',
    name: 'Healthcare Prior-Auth Agent',
    category: 'Healthcare',
    rank: '#2 Top Seller',
    tagline: 'Automate prior-authorization end-to-end.',
    description:
      'Vertical AI for healthcare (highest demand, 65.9%). Takes clinical notes + payer info, checks medical necessity against criteria, and drafts a complete prior-authorization letter ready for submission.',
    trigger_prompt:
      'Automate prior authorization: review the clinical case and draft the submission letter.',
    steps: [
      {
        type: 'llm',
        name: 'extract_clinical',
        prompt:
          'Extract the key clinical facts from this case: diagnosis, procedure requested, patient history, and relevant clinical justification. Case: {{input}}',
      },
      {
        type: 'llm',
        name: 'check_criteria',
        prompt:
          'Given the clinical facts from {{steps.extract_clinical.output}}, evaluate medical necessity against standard payer prior-authorization criteria. List which criteria are met and flag any gaps.',
      },
      {
        type: 'llm',
        name: 'draft_letter',
        prompt:
          'Using the clinical facts from {{steps.extract_clinical.output}} and the criteria check from {{steps.check_criteria.output}}, draft a complete prior-authorization letter addressed to the payer. Include patient info, procedure, diagnosis, and medical necessity justification.',
      },
      {
        type: 'email',
        name: 'send_letter',
        to: '{{input.email}}',
        subject: 'Prior-authorization letter ready for review',
        body: '{{steps.draft_letter.output}}',
      },
    ],
  },
  {
    id: 'saas-management',
    name: 'SaaS Spend Audit Agent',
    category: 'SaaS Management',
    rank: '#3 Top Seller',
    tagline: 'Find waste and overlap in your software stack.',
    description:
      'The meta-play booming because AI sprawl creates spend + access chaos. Takes a list of tools and contracts, identifies overlap, unused licenses, and renewal risks, then produces a savings report.',
    trigger_prompt:
      'Audit our SaaS stack for overlap, waste, and renewal risk, then produce a savings report.',
    steps: [
      {
        type: 'llm',
        name: 'inventory',
        prompt:
          'Organize this SaaS tool list into a structured inventory: tool name, category, monthly cost, seat count, and renewal date. Stack: {{input}}',
      },
      {
        type: 'llm',
        name: 'find_overlap',
        prompt:
          'Using the inventory from {{steps.inventory.output}}, identify overlapping/duplicate tools, unused or over-provisioned seats, and upcoming renewals that need attention. Estimate potential savings.',
      },
      {
        type: 'llm',
        name: 'savings_report',
        prompt:
          'Turn the analysis from {{steps.find_overlap.output}} into a savings report with a prioritized action list (consolidate, downgrade, cancel) and estimated annual savings.',
      },
      {
        type: 'email',
        name: 'email_report',
        to: '{{input.email}}',
        subject: 'SaaS spend audit — savings report',
        body: '{{steps.savings_report.output}}',
      },
    ],
  },
  {
    id: 'fintech-underwriting',
    name: 'Fintech Loan Underwriting Copilot',
    category: 'Fintech',
    tagline: 'AI copilot for loan risk decisions.',
    description:
      'Vertical AI for financial services (40.9% demand). Takes applicant financials, runs a risk assessment, and produces an underwriting memo with a recommendation and rationale.',
    trigger_prompt: 'Assess this loan applicant and produce an underwriting memo with a recommendation.',
    steps: [
      {
        type: 'llm',
        name: 'extract_financials',
        prompt:
          'Extract the key financial figures from this applicant: income, debts, assets, credit indicators, and loan amount requested. Applicant: {{input}}',
      },
      {
        type: 'llm',
        name: 'risk_assessment',
        prompt:
          'Using the financials from {{steps.extract_financials.output}}, assess credit risk: debt-to-income, repayment capacity, and risk flags. Give a risk score and rationale.',
      },
      {
        type: 'llm',
        name: 'decision_memo',
        prompt:
          'Based on the risk assessment from {{steps.risk_assessment.output}}, write an underwriting memo with a recommendation (approve / approve with conditions / decline), conditions, and rationale.',
      },
      {
        type: 'email',
        name: 'email_memo',
        to: '{{input.email}}',
        subject: 'Underwriting memo ready for review',
        body: '{{steps.decision_memo.output}}',
      },
    ],
  },
  {
    id: 'legal-contract-review',
    name: 'Legal Contract Review Agent',
    category: 'Legal',
    tagline: 'Flag risks and redline contracts automatically.',
    description:
      'Vertical AI for legal (the Harvey model). Reviews a contract, extracts key clauses, flags risky language, and produces a redline summary with suggested changes.',
    trigger_prompt: 'Review this contract, flag risks, and produce a redline summary.',
    steps: [
      {
        type: 'llm',
        name: 'extract_clauses',
        prompt:
          'Extract the key clauses from this contract: parties, term, termination, liability, IP, payment, and indemnification. Contract: {{input}}',
      },
      {
        type: 'llm',
        name: 'flag_risks',
        prompt:
          'Using the clauses from {{steps.extract_clauses.output}}, identify risky or unfavorable language, missing protections, and clauses that deviate from market standards.',
      },
      {
        type: 'llm',
        name: 'redline_summary',
        prompt:
          'Based on the risk flags from {{steps.flag_risks.output}}, produce a redline summary: each issue, why it is risky, and the suggested revised language.',
      },
      {
        type: 'email',
        name: 'email_summary',
        to: '{{input.email}}',
        subject: 'Contract review — redline summary',
        body: '{{steps.redline_summary.output}}',
      },
    ],
  },
  {
    id: 'sales-revops',
    name: 'Self-Driving Sales Agent',
    category: 'Sales RevOps',
    tagline: 'Prospect, research, and draft outreach autonomously.',
    description:
      'Self-driving CRM that eats point-product sales tools. Researches a prospect, drafts personalized outreach, and builds a follow-up sequence — all autonomously.',
    trigger_prompt: 'Research this prospect and build a personalized outreach sequence.',
    steps: [
      {
        type: 'llm',
        name: 'research_prospect',
        prompt:
          'Research this prospect and their company: role, likely priorities, company stage, and recent news. Prospect: {{input}}',
      },
      {
        type: 'llm',
        name: 'draft_outreach',
        prompt:
          'Using the research from {{steps.research_prospect.output}}, write a personalized cold outreach email with a clear value proposition and soft call to action.',
      },
      {
        type: 'llm',
        name: 'followup_plan',
        prompt:
          'Based on the outreach email from {{steps.draft_outreach.output}}, design a 3-touch follow-up sequence (timing, angle, and draft for each touch).',
      },
      {
        type: 'email',
        name: 'email_sequence',
        to: '{{input.email}}',
        subject: 'Outreach sequence ready to send',
        body: '{{steps.draft_outreach.output}}\n\n--- FOLLOW-UP SEQUENCE ---\n{{steps.followup_plan.output}}',
      },
    ],
  },
  {
    id: 'support-resolver',
    name: 'Autonomous Support Resolver',
    category: 'Customer Support',
    tagline: 'Resolve tickets end-to-end, not just deflect them.',
    description:
      'Fastest-growing segment — agents that resolve tickets with tool access, not chatbots. Classifies a ticket, drafts a resolution, and writes a knowledge-base article to prevent recurrence.',
    trigger_prompt: 'Resolve this support ticket and write a knowledge-base article to prevent it recurring.',
    steps: [
      {
        type: 'llm',
        name: 'classify_ticket',
        prompt:
          'Classify this support ticket: category, urgency, likely root cause, and what the customer needs. Ticket: {{input}}',
      },
      {
        type: 'llm',
        name: 'draft_resolution',
        prompt:
          'Using the classification from {{steps.classify_ticket.output}}, draft a clear, empathetic resolution reply to the customer with step-by-step instructions.',
      },
      {
        type: 'llm',
        name: 'kb_article',
        prompt:
          'Based on the resolution from {{steps.draft_resolution.output}}, write a concise knowledge-base article titled with the problem, so other customers can self-serve it.',
      },
      {
        type: 'email',
        name: 'email_resolution',
        to: '{{input.email}}',
        subject: 'Support ticket resolved + KB article',
        body: 'REPLY TO CUSTOMER:\n{{steps.draft_resolution.output}}\n\nKB ARTICLE:\n{{steps.kb_article.output}}',
      },
    ],
  },
  {
    id: 'dev-pr-review',
    name: 'AI Dev PR Review Agent',
    category: 'Dev Suite',
    tagline: 'Review code, find bugs, suggest tests.',
    description:
      'AI-native dev suite (54.5% of buyers want generative AI in their stack). Summarizes a diff, reviews it for bugs and risks, and suggests test cases.',
    trigger_prompt: 'Review this pull request, find bugs, and suggest test cases.',
    steps: [
      {
        type: 'llm',
        name: 'summarize_diff',
        prompt:
          'Summarize what this pull request changes and why. PR: {{input}}',
      },
      {
        type: 'llm',
        name: 'review_bugs',
        prompt:
          'Using the summary from {{steps.summarize_diff.output}}, review the changes for bugs, edge cases, security issues, and code-quality risks. List each issue with severity.',
      },
      {
        type: 'llm',
        name: 'suggest_tests',
        prompt:
          'Based on the review from {{steps.review_bugs.output}}, suggest test cases that should be added to cover the new behavior and the flagged risks.',
      },
      {
        type: 'email',
        name: 'email_review',
        to: '{{input.email}}',
        subject: 'PR review complete',
        body: 'SUMMARY:\n{{steps.summarize_diff.output}}\n\nREVIEW:\n{{steps.review_bugs.output}}\n\nSUGGESTED TESTS:\n{{steps.suggest_tests.output}}',
      },
    ],
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis Agent',
    category: 'Data & Ops',
    tagline: 'Ask your data a question, get a finished report.',
    description:
      'Replaces BI seats. Interprets a business question, drafts the analytical approach, and writes a findings report with recommended actions.',
    trigger_prompt: 'Answer this business question with a data analysis and recommended actions.',
    steps: [
      {
        type: 'llm',
        name: 'interpret_question',
        prompt:
          'Interpret this business question and identify the metrics, data sources, and dimensions needed to answer it. Question: {{input}}',
      },
      {
        type: 'llm',
        name: 'draft_approach',
        prompt:
          'Using the interpretation from {{steps.interpret_question.output}}, draft the analytical approach: the query logic, the comparisons to run, and what result would mean.',
      },
      {
        type: 'llm',
        name: 'findings_report',
        prompt:
          'Based on the approach from {{steps.draft_approach.output}}, write a findings report with a headline answer, supporting analysis, and 3 recommended actions.',
      },
      {
        type: 'email',
        name: 'email_report',
        to: '{{input.email}}',
        subject: 'Data analysis report ready',
        body: '{{steps.findings_report.output}}',
      },
    ],
  },
  {
    id: 'outcome-billing',
    name: 'Outcome Billing Meter Agent',
    category: 'Infrastructure',
    tagline: 'The rails for per-outcome SaaS pricing.',
    description:
      'The picks-and-shovels play. Parses usage events, attributes them to outcomes, and produces an outcome-based invoice summary — the infrastructure that lets SaaS move from per-seat to per-outcome pricing.',
    trigger_prompt: 'Meter usage events, attribute them to outcomes, and produce an outcome-based invoice.',
    steps: [
      {
        type: 'llm',
        name: 'parse_events',
        prompt:
          'Parse these usage events into a structured list: timestamp, customer, action, and unit. Events: {{input}}',
      },
      {
        type: 'llm',
        name: 'attribute_outcomes',
        prompt:
          'Using the events from {{steps.parse_events.output}}, attribute them to billable outcomes (e.g. tickets resolved, workflows completed). Count outcomes per customer.',
      },
      {
        type: 'llm',
        name: 'invoice_summary',
        prompt:
          'Based on the outcome attribution from {{steps.attribute_outcomes.output}}, produce an invoice summary per customer: outcomes delivered, unit price, and total. Note this is the per-outcome pricing model replacing per-seat.',
      },
      {
        type: 'email',
        name: 'email_invoice',
        to: '{{input.email}}',
        subject: 'Outcome-based billing summary',
        body: '{{steps.invoice_summary.output}}',
      },
    ],
  },
  // ---- Business AI: what businesses need but don't have yet (2027-2030) ----
  {
    id: 'agent-orchestrator',
    name: 'Multi-Agent Orchestrator',
    category: 'Business AI',
    tagline: 'Coordinate many agents from one goal.',
    description:
      'The 2027+ frontier: instead of one agent, a coordinator breaks a goal into sub-tasks and routes each to the right specialist agent, then merges results.',
    trigger_prompt: 'Break this goal into sub-tasks and coordinate specialist agents to complete it.',
    steps: [
      {
        type: 'llm',
        name: 'decompose',
        prompt:
          'Break this goal into independent sub-tasks and say which specialist agent should handle each (research, writing, data, email). Goal: {{input}}',
      },
      {
        type: 'llm',
        name: 'execute_research',
        prompt:
          'As the research specialist, complete the research sub-tasks from {{steps.decompose.output}} for this goal: {{input}}',
      },
      {
        type: 'llm',
        name: 'merge',
        prompt:
          'Merge the research from {{steps.execute_research.output}} with the plan from {{steps.decompose.output}} into a single coordinated result for the goal: {{input}}',
      },
      {
        type: 'email',
        name: 'email_result',
        to: '{{input.email}}',
        subject: 'Multi-agent task complete',
        body: '{{steps.merge.output}}',
      },
    ],
  },
  {
    id: 'compliance-soc2',
    name: 'Compliance & SOC2 Agent',
    category: 'Business AI',
    tagline: 'Map controls and find compliance gaps.',
    description:
      'As regulation tightens through 2028-2030, every SaaS needs compliance automation. Maps your processes to SOC2/HIPAA controls and flags gaps with remediation steps.',
    trigger_prompt: 'Map our processes to SOC2 controls and flag gaps with remediation.',
    steps: [
      {
        type: 'llm',
        name: 'map_controls',
        prompt:
          'Map these business processes to SOC2 Trust Services Criteria controls. Processes: {{input}}',
      },
      {
        type: 'llm',
        name: 'find_gaps',
        prompt:
          'Using the control mapping from {{steps.map_controls.output}}, identify which SOC2 controls are not covered and what evidence is missing.',
      },
      {
        type: 'llm',
        name: 'remediation',
        prompt:
          'Based on the gaps from {{steps.find_gaps.output}}, write a remediation plan with specific actions, owners, and timelines to reach compliance.',
      },
      {
        type: 'email',
        name: 'email_plan',
        to: '{{input.email}}',
        subject: 'SOC2 compliance gap remediation plan',
        body: '{{steps.remediation.output}}',
      },
    ],
  },
  {
    id: 'employee-onboarding',
    name: 'Employee Onboarding Agent',
    category: 'Business AI',
    tagline: 'Build a 30-day onboarding plan automatically.',
    description:
      'HR teams lack bandwidth. Takes a new hire role and builds a personalized 30-60-90 day onboarding plan with tasks, resources, and check-ins.',
    trigger_prompt: 'Build a 30-60-90 day onboarding plan for this new hire.',
    steps: [
      {
        type: 'llm',
        name: 'role_context',
        prompt:
          'Summarize the role, key skills, and success indicators for this new hire. Role: {{input}}',
      },
      {
        type: 'llm',
        name: 'plan',
        prompt:
          'Using the role context from {{steps.role_context.output}}, build a 30-60-90 day onboarding plan with weekly tasks, learning resources, and check-in milestones.',
      },
      {
        type: 'email',
        name: 'email_plan',
        to: '{{input.email}}',
        subject: 'Onboarding plan ready',
        body: '{{steps.plan.output}}',
      },
    ],
  },
  {
    id: 'ap-automation',
    name: 'Invoice & AP Automation Agent',
    category: 'Business AI',
    tagline: 'Turn invoices into coded, approved bills.',
    description:
      'Accounts payable is still manual at most SMBs. Extracts invoice data, codes it to the right GL account, and routes an approval summary.',
    trigger_prompt: 'Process this invoice: extract, code, and prepare for approval.',
    steps: [
      {
        type: 'llm',
        name: 'extract_invoice',
        prompt:
          'Extract vendor, invoice number, line items, total, and due date from this invoice. Invoice: {{input}}',
      },
      {
        type: 'llm',
        name: 'code_gl',
        prompt:
          'Using the extracted data from {{steps.extract_invoice.output}}, assign the correct general ledger account codes to each line item.',
      },
      {
        type: 'llm',
        name: 'approval_summary',
        prompt:
          'Create an approval summary from {{steps.extract_invoice.output}} and {{steps.code_gl.output}}: amount, coding, and a note for the approver.',
      },
      {
        type: 'email',
        name: 'email_approval',
        to: '{{input.email}}',
        subject: 'Invoice ready for approval',
        body: '{{steps.approval_summary.output}}',
      },
    ],
  },
  {
    id: 'content-marketing',
    name: 'Content Marketing Agent',
    category: 'Business AI',
    tagline: 'Turn one topic into a blog and social set.',
    description:
      'Content is the top growth lever small teams cannot staff. Takes a topic and produces a blog post, social captions, and a content calendar.',
    trigger_prompt: 'Create a blog post and social content from this topic.',
    steps: [
      {
        type: 'llm',
        name: 'blog',
        prompt: 'Write a 600-word SEO blog post on this topic: {{input}}',
      },
      {
        type: 'llm',
        name: 'social',
        prompt:
          'Using the blog from {{steps.blog.output}}, write 3 social media captions (LinkedIn, Facebook, Instagram) with hooks and hashtags.',
      },
      {
        type: 'llm',
        name: 'calendar',
        prompt:
          'Build a 2-week content calendar scheduling the blog and social posts from {{steps.blog.output}} and {{steps.social.output}}.',
      },
      {
        type: 'email',
        name: 'email_content',
        to: '{{input.email}}',
        subject: 'Your content kit is ready',
        body: 'BLOG:\n{{steps.blog.output}}\n\nSOCIAL:\n{{steps.social.output}}\n\nCALENDAR:\n{{steps.calendar.output}}',
      },
    ],
  },
  {
    id: 'social-media-manager',
    name: 'Social Media Manager Agent',
    category: 'Business AI',
    tagline: 'A week of posts from one brief.',
    description:
      'Small businesses cannot afford a social manager. Takes a business brief and generates a full week of platform-specific posts.',
    trigger_prompt: 'Generate a week of social posts for this business.',
    steps: [
      {
        type: 'llm',
        name: 'strategy',
        prompt:
          'Define a 1-week social strategy (themes and goals) for this business. Business: {{input}}',
      },
      {
        type: 'llm',
        name: 'posts',
        prompt:
          'Using the strategy from {{steps.strategy.output}}, write 7 daily posts (one per day) with caption, hook, and hashtags for this business: {{input}}',
      },
      {
        type: 'email',
        name: 'email_posts',
        to: '{{input.email}}',
        subject: 'Your week of social posts',
        body: '{{steps.posts.output}}',
      },
    ],
  },
  {
    id: 'recruiting-sourcing',
    name: 'Recruiting Sourcing Agent',
    category: 'Business AI',
    tagline: 'Source candidates and draft outreach.',
    description:
      'SMBs have no recruiting team. Takes a job description, defines the ideal candidate profile, and drafts personalized sourcing outreach.',
    trigger_prompt: 'Source candidates for this role and draft outreach.',
    steps: [
      {
        type: 'llm',
        name: 'candidate_profile',
        prompt:
          'Define the ideal candidate profile (skills, experience, where to find them) for this role. Role: {{input}}',
      },
      {
        type: 'llm',
        name: 'outreach',
        prompt:
          'Using the profile from {{steps.candidate_profile.output}}, write a personalized sourcing outreach message for this role: {{input}}',
      },
      {
        type: 'email',
        name: 'email_outreach',
        to: '{{input.email}}',
        subject: 'Sourcing outreach ready to send',
        body: '{{steps.outreach.output}}',
      },
    ],
  },
  {
    id: 'competitive-intel',
    name: 'Competitive Intelligence Agent',
    category: 'Business AI',
    tagline: 'Track competitors and find your edge.',
    description:
      'Most companies track competitors manually or not at all. Summarizes a competitor landscape and identifies your differentiated opportunities.',
    trigger_prompt: 'Analyze these competitors and find our differentiation opportunities.',
    steps: [
      {
        type: 'llm',
        name: 'landscape',
        prompt:
          'Summarize each competitor: positioning, strengths, weaknesses, and pricing. Competitors: {{input}}',
      },
      {
        type: 'llm',
        name: 'opportunities',
        prompt:
          'Using the landscape from {{steps.landscape.output}}, identify gaps and differentiation opportunities we could exploit.',
      },
      {
        type: 'email',
        name: 'email_intel',
        to: '{{input.email}}',
        subject: 'Competitive intelligence report',
        body: '{{steps.opportunities.output}}',
      },
    ],
  },
  {
    id: 'meeting-actions',
    name: 'Meeting to Actions Agent',
    category: 'Business AI',
    tagline: 'Turn meeting notes into assigned action items.',
    description:
      'Meetings produce notes nobody acts on. Takes raw meeting notes and produces a summary, decisions, and assigned action items.',
    trigger_prompt: 'Turn these meeting notes into a summary and assigned action items.',
    steps: [
      {
        type: 'llm',
        name: 'summary',
        prompt:
          'Summarize this meeting: key discussion points and decisions made. Notes: {{input}}',
      },
      {
        type: 'llm',
        name: 'actions',
        prompt:
          'Using the summary from {{steps.summary.output}}, extract action items with owner, action, and due date.',
      },
      {
        type: 'email',
        name: 'email_actions',
        to: '{{input.email}}',
        subject: 'Meeting action items',
        body: 'SUMMARY:\n{{steps.summary.output}}\n\nACTION ITEMS:\n{{steps.actions.output}}',
      },
    ],
  },
  {
    id: 'inventory-forecast',
    name: 'Inventory Forecasting Agent',
    category: 'Business AI',
    tagline: 'Predict demand and prevent stockouts.',
    description:
      'SMB retailers and trades over- or under-stock constantly. Takes sales history and produces a demand forecast with reorder recommendations.',
    trigger_prompt: 'Forecast demand from this sales history and recommend reorders.',
    steps: [
      {
        type: 'llm',
        name: 'analyze_history',
        prompt:
          'Analyze this sales history for trends, seasonality, and fast/slow movers. History: {{input}}',
      },
      {
        type: 'llm',
        name: 'forecast',
        prompt:
          'Using the analysis from {{steps.analyze_history.output}}, produce a 30-day demand forecast per product and reorder recommendations.',
      },
      {
        type: 'email',
        name: 'email_forecast',
        to: '{{input.email}}',
        subject: 'Inventory forecast and reorder list',
        body: '{{steps.forecast.output}}',
      },
    ],
  },
  // ---- Local service businesses: top 5, top 3 flagged for Lee & Harnett County NC ----
  {
    id: 'missed-call-capture',
    name: 'Missed-Call Lead Capture Agent',
    category: 'Local Service',
    rank: '#1 Lee & Harnett NC',
    tagline: 'Never lose a job to voicemail again.',
    description:
      'Rural NC service businesses (HVAC, plumbing, roofing, septic) lose jobs every time a call goes to voicemail. Takes the caller info and missed-call reason, drafts an instant text-back plus follow-up, and logs the lead.',
    trigger_prompt: 'A call was missed. Capture the lead and draft an instant text-back and follow-up.',
    steps: [
      {
        type: 'llm',
        name: 'capture',
        prompt:
          'A service business missed this call. Summarize the caller info and likely service need. Call details: {{input}}',
      },
      {
        type: 'llm',
        name: 'textback',
        prompt:
          'Using the lead info from {{steps.capture.output}}, write a friendly instant text-back message acknowledging the missed call, asking how we can help, and offering to schedule. Keep it under 160 characters.',
      },
      {
        type: 'llm',
        name: 'followup',
        prompt:
          'Write a follow-up message to send 1 hour later if the customer has not responded, based on {{steps.capture.output}}. Offer a same-day appointment.',
      },
      {
        type: 'email',
        name: 'email_lead',
        to: '{{input.email}}',
        subject: 'New lead captured from missed call',
        body: 'INSTANT TEXT-BACK:\n{{steps.textback.output}}\n\n1-HOUR FOLLOW-UP:\n{{steps.followup.output}}',
      },
    ],
  },
  {
    id: 'review-reputation',
    name: 'Google Review Request Agent',
    category: 'Local Service',
    rank: '#2 Lee & Harnett NC',
    tagline: 'More 5-star reviews = more local jobs.',
    description:
      'In Lee & Harnett County, Google reviews drive local SEO and who gets the call. Takes completed job details and drafts a personalized review request plus a response template for new reviews.',
    trigger_prompt: 'A job is done. Draft a review request and a review-response template.',
    steps: [
      {
        type: 'llm',
        name: 'job_summary',
        prompt:
          'Summarize what was done for the customer and the value delivered. Job: {{input}}',
      },
      {
        type: 'llm',
        name: 'review_request',
        prompt:
          'Using the job summary from {{steps.job_summary.output}}, write a short personalized text asking the customer to leave a Google review, including a placeholder for the review link. Friendly and specific.',
      },
      {
        type: 'llm',
        name: 'response_template',
        prompt:
          'Write 2 reusable response templates: one for a 5-star review and one for a lower rating, thanking the customer and addressing concerns professionally.',
      },
      {
        type: 'email',
        name: 'email_kit',
        to: '{{input.email}}',
        subject: 'Review request + response templates',
        body: 'REVIEW REQUEST:\n{{steps.review_request.output}}\n\nRESPONSE TEMPLATES:\n{{steps.response_template.output}}',
      },
    ],
  },
  {
    id: 'fast-quote',
    name: 'Fast Quote Agent',
    category: 'Local Service',
    rank: '#3 Lee & Harnett NC',
    tagline: 'Speed wins local jobs. Quote in minutes.',
    description:
      'The first quote often wins the job in rural markets. Takes a customer request, estimates scope and materials, and produces a professional itemized quote ready to send.',
    trigger_prompt: 'Turn this customer request into a professional itemized quote.',
    steps: [
      {
        type: 'llm',
        name: 'scope',
        prompt:
          'Break down the scope of work, materials, and labor likely needed for this request. Request: {{input}}',
      },
      {
        type: 'llm',
        name: 'estimate',
        prompt:
          'Using the scope from {{steps.scope.output}}, produce an itemized estimate with materials, labor, and a total. Use realistic ranges where exact prices are unknown.',
      },
      {
        type: 'llm',
        name: 'quote',
        prompt:
          'Turn the estimate from {{steps.estimate.output}} into a professional customer-facing quote with a validity period and a call-to-action to book.',
      },
      {
        type: 'email',
        name: 'email_quote',
        to: '{{input.email}}',
        subject: 'Customer quote ready to send',
        body: '{{steps.quote.output}}',
      },
    ],
  },
  {
    id: 'scheduling-dispatch',
    name: 'Scheduling & Dispatch Agent',
    category: 'Local Service',
    tagline: 'Assign jobs to the right crew, fast.',
    description:
      'Service businesses waste hours scheduling. Takes open jobs and crew availability, and produces an optimized dispatch plan minimizing drive time.',
    trigger_prompt: 'Build an optimized dispatch plan from these jobs and crew.',
    steps: [
      {
        type: 'llm',
        name: 'organize',
        prompt:
          'Organize these open jobs by priority, location, and required skill. Jobs: {{input}}',
      },
      {
        type: 'llm',
        name: 'dispatch',
        prompt:
          'Using the organized jobs from {{steps.organize.output}}, assign each job to a crew to minimize drive time and balance load. Output the daily route per crew.',
      },
      {
        type: 'email',
        name: 'email_dispatch',
        to: '{{input.email}}',
        subject: 'Dispatch plan for today',
        body: '{{steps.dispatch.output}}',
      },
    ],
  },
  {
    id: 'repeat-customer',
    name: 'Repeat Customer Follow-up Agent',
    category: 'Local Service',
    tagline: 'Turn one-time jobs into recurring revenue.',
    description:
      'Service businesses forget to follow up. Takes a past job and produces a seasonal re-engagement offer to bring the customer back.',
    trigger_prompt: 'Create a repeat-customer follow-up offer from this past job.',
    steps: [
      {
        type: 'llm',
        name: 'context',
        prompt:
          'Summarize this past job and the likely next service the customer will need. Past job: {{input}}',
      },
      {
        type: 'llm',
        name: 'offer',
        prompt:
          'Using the context from {{steps.context.output}}, write a personalized re-engagement message with a seasonal offer and a clear call to book.',
      },
      {
        type: 'email',
        name: 'email_offer',
        to: '{{input.email}}',
        subject: 'Repeat-customer follow-up ready',
        body: '{{steps.offer.output}}',
      },
    ],
  },
];

export default WORKFLOW_TEMPLATES;