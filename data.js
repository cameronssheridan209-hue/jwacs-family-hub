/* Family hub data — courses + Direqt refresh. Scraped Wed 30 Sep 2026 AWST.
   Authoritative parent login: Mrs Sonjia Sheridan SEQTA.
   Students: Owen Sheridan (Y6) & Yasmin Sheridan (Y8).
*/
window.HUB = (function () {
  'use strict';

  var TODAY = '2026-09-30';
  var OVERDUE_WINDOW_DAYS = 7;
  /* Overdue banner only if due >= TODAY - 7d = 2026-09-23 */

  var META = {
    scrapedAt: 'Wed 30 Sep 2026 AWST',
    school: 'John Wollaston Anglican Community School (JWACS)',
    portal: 'coneqt-p.jwacs.wa.edu.au / SEQTA Engage',
    website: 'https://www.jwacs.wa.edu.au/',
    account: 'Mrs Sonjia Sheridan',
    today: TODAY
  };

  /* Course cards — plain-English outlines (no rubrics) */
  var COURSES = {
    owen: [
      {
        id: 'owen-course-eng',
        subject: 'English',
        emoji: '📖',
        outline: 'Late Term 3: City of Ember shared reading and comprehension, then comparing themes in Among the Hidden and City of Ember. Earlier Term 3 also covered poetry, persuasive writing and scientific-procedure writing. Term 4 programme includes persuasive writing and an information-text unit on natural disasters (research → headings → Canva infographic), then narrative/poetry.',
        homework: 'No separately labelled homework in SEQTA. Ongoing English reading/themes work where relevant — none set as holiday homework.',
        status: 'Themes unit done · City of Ember assessment past (17 Sep)'
      },
      {
        id: 'owen-course-maths',
        subject: 'Mathematics',
        emoji: '🔢',
        outline: 'Year 6 Mathematics 2026 is active. Capacity/volume work wrapped mid-September. Mathspace remains available for practice over the break.',
        homework: 'No separately labelled homework. Optional Mathspace practice keeps skills warm for Term 4.',
        status: 'Term 3 wrapped · Mathspace active'
      },
      {
        id: 'owen-course-digitech',
        subject: 'Digital Technologies',
        emoji: '💻',
        outline: 'Late-September DigiTech lessons (2, 9, 16, 23 and 30 Sep) appear on the calendar, but SEQTA showed no lesson content for those dates when checked.',
        homework: 'No separately labelled homework visible.',
        status: 'Late-Sep lessons empty in SEQTA'
      },
      {
        id: 'owen-course-music',
        subject: 'Music',
        emoji: '🎵',
        outline: 'Minor Scale (Sing + Sign) and Tonality (Listening + Writing) both graded B. Term 3 music practicals complete.',
        homework: 'None separately labelled.',
        status: 'Graded B · Term 3 complete'
      },
      {
        id: 'owen-course-jp',
        subject: 'Japanese',
        emoji: '🇯🇵',
        outline: 'Year 6 Japanese is active and up to date — no overdue tasks flagged. Term 4 continues from Week 1.',
        homework: 'None separately labelled.',
        status: 'Up to date'
      },
      {
        id: 'owen-course-other',
        subject: 'D&T / Visual Arts / other',
        emoji: '🛠️',
        outline: 'Design & Technologies, Visual Arts, Science, HASS, Health and Digital Portfolio tabs are present. No late-September lesson text or homework was surfaced in the read-only views checked. Fresh units from Term 4 Week 1 (13 Oct).',
        homework: 'None separately labelled.',
        status: 'Term 3 practicals done'
      }
    ],
    yasmin: [
      {
        id: 'yas-course-eng',
        subject: 'English',
        emoji: '📚',
        outline: 'Skellig unit: close analysis and annotation of extracts, interpreting language features, revising short-answer structure, and exploring themes. Task 6 marking-key release was listed. Term 4 Creating task: imaginative opening chapter of Skellig — The Sequel (due 17 Nov).',
        homework: 'No separately labelled homework. Ongoing Skellig analysis/annotation where relevant.',
        status: 'Skellig unit · Sequel due 17 Nov'
      },
      {
        id: 'yas-course-maths',
        subject: 'Mathematics',
        emoji: '📐',
        outline: 'Linear relationships: Cartesian plane, rules/tables/graphs, solving linear equations and inequalities, intercepts and gradients. Latest lessons applied line graphs, non-linear graphs and revision for Major Assessment 2. Term 4: Probability investigation (2 Nov), Major Assessment 2 (16 Nov), Other 4 (20 Nov).',
        homework: 'No separately labelled homework. Ongoing Maths revision/preparation for Major Assessment 2.',
        status: 'Linear graphs done · T4 assessments set'
      },
      {
        id: 'yas-course-va',
        subject: 'Visual Arts',
        emoji: '🎨',
        outline: 'Expressionist portrait: prime canvas/design, transfer design, block in colour, painting, then complete the painting and reflection sheet. Assessments: Investigation & Analysis 30 Oct; Portrait Inquiry 6 Nov; Portrait Production 27 Nov.',
        homework: 'None separately labelled yet — assessments from late October.',
        status: 'Expressionist portrait · T4 tasks set'
      },
      {
        id: 'yas-course-dt',
        subject: 'Digital Technologies',
        emoji: '💻',
        outline: 'Microbit project, then Minecraft (latest listed unit). Programming assessment was due 21 Sep — still needs finishing when back; no electronic drop-box was set up so check with your teacher how to hand it in.',
        homework: 'No separately labelled homework. Finish Microbit Programming when back (see Still open).',
        status: 'Microbit → Minecraft · Programming needs finish'
      },
      {
        id: 'yas-course-music',
        subject: 'Music',
        emoji: '🥁',
        outline: 'Body Percussion Composition (Task 6) — MuseScore score + reflection. Submitted 25 Sep (due 29 Sep); waiting for the teacher to mark. Late-September lesson titles were not readable in the course calendar.',
        homework: 'None — composition already in.',
        status: 'Submitted · awaiting mark'
      },
      {
        id: 'yas-course-textiles',
        subject: 'Textiles',
        emoji: '🧵',
        outline: 'Term 4 Boxer Shorts sewing project starts Week 1. You need 1.5 m of 100% woven cotton (no jersey/knit/stretch/satin) plus matching thread — washed and ironed before Tuesday 13 Oct.',
        homework: 'Parents buying fabric before 13 Oct (see checklist).',
        status: 'Fabric before Term 4 W1'
      },
      {
        id: 'yas-course-other',
        subject: 'Other subjects',
        emoji: '✨',
        outline: 'Japanese reading marked (24 Sep); next is writing an invitation in Term 4. Humanities Historical Inquiry, Dance Context Research and Science Mystery Mixture all marked. Food Spec, RAVE and Health Term 3 modules finished.',
        homework: 'None separately labelled.',
        status: 'Term 3 wrapped'
      }
    ]
  };

  /* Checklist / assignment items (no rubricDetails) */
  var ITEMS = [
    /* Owen */
    {
      id: 'owen-eng-ember-themes',
      kid: 'owen', kidLabel: 'Owen', year: 'Year 6',
      subject: 'English', type: 'Assessment',
      title: 'City of Ember Themes Assessment',
      due: '2026-09-17',
      pending: true, pendingLabel: 'Awaiting marking',
      submitted: true,
      statusNote: 'Submitted 11 Sep (revised 17 Sep) — waiting for teacher mark. Due was 17 Sep (outside 7-day overdue window).',
      required: 'Themes response on City of Ember — already uploaded.',
      submission: 'City of Ember Themes Assessment (1).pdf — 11 Sep 9:36 am; revised 17 Sep 1:16 pm',
      sectionHint: 'awaiting'
    },
    {
      id: 'owen-maths-mathspace',
      kid: 'owen', kidLabel: 'Owen', year: 'Year 6',
      subject: 'Mathematics', type: 'Homework',
      title: 'Mathspace practice (optional)',
      due: null,
      statusNote: 'Optional holiday practice — no daily homework set.',
      required: 'A little Mathspace play keeps volume/capacity skills warm for Term 4.',
      sectionHint: 'homework'
    },
    {
      id: 'owen-music-minor',
      kid: 'owen', kidLabel: 'Owen', year: 'Year 6',
      subject: 'Music', type: 'Result',
      title: 'Minor Scale: Sing + Sign',
      due: '2026-09-21', grade: 'B',
      sectionHint: 'results',
      required: 'Graded B — results released 21 Sep.',
      statusNote: 'Done and marked.'
    },
    {
      id: 'owen-music-tonality',
      kid: 'owen', kidLabel: 'Owen', year: 'Year 6',
      subject: 'Music', type: 'Result',
      title: 'Tonality: Listening + Writing',
      due: '2026-09-21', grade: 'B',
      sectionHint: 'results',
      required: 'Graded B — results released 21 Sep.',
      statusNote: 'Done and marked.'
    },

    /* Yasmin */
    {
      id: 'yas-dt-programming',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'Digital Technologies', type: 'Assessment',
      title: 'Programming (Microbit)',
      due: '2026-09-21',
      submitted: false,
      statusNote: 'Past due (21 Sep) — outside 7-day overdue window. Finish when back; no SEQTA drop-box was configured.',
      required: 'Complete the Microbit Programming project (investigation → planning → code → evaluation).',
      submission: 'NONE — not submitted via SEQTA.',
      sectionHint: 'still_open'
    },
    {
      id: 'yas-music-t6',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'Music', type: 'Assessment',
      title: 'Task 6: Body Percussion Composition',
      due: '2026-09-29',
      pending: true, pendingLabel: 'Awaiting marking',
      submitted: true,
      statusNote: 'Submitted 25 Sep — due 29 Sep (within 7-day window). Portal still shows overdue until marked.',
      required: 'MuseScore body-percussion score + written reflection — already uploaded.',
      submission: 'Year 8 Body Percussion final.mscz (25 Sep 11:57 am); music refelction yr8.docx (25 Sep 12:03 pm)',
      sectionHint: 'awaiting'
    },
    {
      id: 'yas-textiles-fabric',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'Textiles', type: 'Homework',
      title: 'Boxer Short fabric ready for Term 4',
      due: '2026-10-13',
      statusNote: 'Buy / wash / iron before school returns Tue 13 Oct.',
      required: '1.5 m 100% woven cotton (no jersey/knit/stretch/satin) + matching thread, pre-washed and ironed.',
      sectionHint: 'homework',
      parentAlso: true
    },
    {
      id: 'yas-va-3a',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'Visual Arts', type: 'Assessment',
      title: 'Task 3A Expressionism Investigation and Analysis',
      due: '2026-10-30',
      required: 'Investigation and analysis of Expressionism.',
      sectionHint: 'upcoming'
    },
    {
      id: 'yas-va-3b',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'Visual Arts', type: 'Assessment',
      title: 'Task 3B Expressionist Portrait Painting Inquiry',
      due: '2026-11-06',
      required: 'Expressionist portrait painting inquiry.',
      sectionHint: 'upcoming'
    },
    {
      id: 'yas-va-3c',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'Visual Arts', type: 'Assessment',
      title: 'Task 3C Expressionist Portrait Painting Production',
      due: '2026-11-27',
      required: 'Expressionist portrait painting production.',
      sectionHint: 'upcoming'
    },
    {
      id: 'yas-maths-prob',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'Mathematics', type: 'Assessment',
      title: 'Task 10 — Investigation 3 — Probability (9%)',
      due: '2026-11-02',
      required: 'Probability investigation (9%).',
      sectionHint: 'upcoming'
    },
    {
      id: 'yas-maths-major',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'Mathematics', type: 'Assessment',
      title: 'Task 11 — Major Assessment 2 — Semester 2 (16%)',
      due: '2026-11-16',
      required: 'Major Assessment 2 (16%).',
      sectionHint: 'upcoming'
    },
    {
      id: 'yas-maths-other',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'Mathematics', type: 'Assessment',
      title: 'Task 12 — Other 4 — Term 4 (3%)',
      due: '2026-11-20',
      required: 'Term 4 other task (3%).',
      sectionHint: 'upcoming'
    },
    {
      id: 'yas-eng-skellig-sequel',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'English', type: 'Assessment',
      title: 'Task 7: Opening Chapter of Skellig — The Sequel',
      due: '2026-11-17',
      required: 'Imaginative text: opening chapter of Skellig — The Sequel.',
      sectionHint: 'upcoming'
    },
    {
      id: 'yas-maths-t8-stats',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'Mathematics', type: 'Result',
      title: 'Task 8 — Investigation 2 — Statistics (9%)',
      due: '2026-09-25',
      sectionHint: 'results',
      statusNote: 'Reflection entered 25 Sep.',
      required: 'Statistics investigation complete.'
    },
    {
      id: 'yas-jp-t3-reading',
      kid: 'yasmin', kidLabel: 'Yasmin', year: 'Year 8',
      subject: 'Japanese', type: 'Result',
      title: 'T3 Task 5: Reading',
      due: '2026-09-24',
      sectionHint: 'results',
      statusNote: 'Results released 24 Sep. Next: T4 writing an invitation.',
      required: 'Term 3 Reading — marked.'
    }
  ];

  /* Parent-only attention items (shown on Cameron & Sonjia) */
  var PARENT_ATTENTION = [
    {
      id: 'att-yas-absence-1apr',
      kid: 'yasmin', kidLabel: 'Yasmin',
      title: 'Unresolved absence — Wed 1 Apr 2026 Period S4',
      detail: 'Flagged unresolved on Sonjia dashboard. Needs parent acknowledgement or absence note in SEQTA.',
      due: '2026-04-01', urgent: true
    },
    {
      id: 'att-owen-camp-med',
      kid: 'owen', kidLabel: 'Owen',
      title: 'Camp medication form expired',
      detail: 'Ms Melanie Fowler (13 Sep): updated medication authorisation needed for hay fever / camp meds before encounters.',
      due: '2026-09-13', urgent: true
    },
    {
      id: 'att-owen-y7-enrol',
      kid: 'owen', kidLabel: 'Owen',
      title: 'Year 7 2027 enrolment confirmation',
      detail: 'Mrs Noella Hextall requested confirmation of enrolment intentions after Orientation Day (follow-up 24 Sep).',
      due: '2026-09-24', urgent: true
    },
    {
      id: 'att-yas-textiles',
      kid: 'yasmin', kidLabel: 'Yasmin',
      title: 'Textiles — Boxer Short fabric before 13 Oct',
      detail: '1.5 m 100% woven cotton + matching thread; pre-wash & iron before Term 4 Week 1. Mrs Leesa Neal.',
      due: '2026-10-13', urgent: false
    },
    {
      id: 'att-yas-sickbay',
      kid: 'yasmin', kidLabel: 'Yasmin',
      title: 'Sickbay — 18 Sep (dizzy / unwell session 6)',
      detail: 'Miss Sarah Wyeth: Yasmin rested at Student Services during session 6. Info only — no form overdue.',
      due: '2026-09-18', urgent: false
    }
  ];

  /* Direqt / SEQTA inbox — Sonjia (authoritative parent login) kept; Cameron refreshed from his inbox scrape 30 Sep */
  var DIREQT_SONJIA = [
    { date: '2026-09-25', time: '2:39 pm', sender: 'Mrs Stephanie Gowland', subject: "Wollaston's Wrap, Issue 9, Term 3", gist: 'Final Term 3 newsletter (Issue 9) with school updates and highlights.', read: true },
    { date: '2026-09-24', time: '12:56 pm', sender: 'Mrs Noella Hextall', subject: 'Year 7, 2027', gist: 'Follow-up after Y7 2027 Orientation — confirm enrolment intentions for Year 6 students.', read: true },
    { date: '2026-09-23', time: '9:27 am', sender: 'Ms Kylie Virgo', subject: 'School Photographs - Update', gist: '3P Photography processing orders; packages early Term 4. Online ordering open (Shoot Key: C4E3K).', read: true },
    { date: '2026-09-21', time: '9:50 am', sender: 'Mrs Susan Kirby', subject: 'JWACS P&F Pre-Loved Uniform Sale – Thursday 8 October', gist: 'Secondhand uniform sale ahead of Term 4 summer uniform transition.', read: true },
    { date: '2026-09-18', time: '3:25 pm', sender: 'Miss Sarah Wyeth', subject: 'Yasmin', gist: 'Health alert: Yasmin attended Student Services session 6 dizzy/unwell; rested for the session.', read: true },
    { date: '2026-09-18', time: '2:59 pm', sender: 'Miss Emily Beake', subject: 'Lost Property', gist: 'End-of-term lost property clearance outside Primary office 21–25 Sept.', read: true },
    { date: '2026-09-18', time: '12:35 pm', sender: 'Mrs Lisa Barrett', subject: 'Re: art exhibition', gist: 'Thanks to Sonjia and grandparents for visiting the student art exhibition.', read: true },
    { date: '2026-09-17', time: '3:58 pm', sender: 'Mrs Leesa Neal', subject: 'Boxer Short Fabric', gist: 'Reminder: textiles students bring measured fabric before final week to cut patterns.', read: true },
    { date: '2026-09-17', time: '2:03 pm', sender: 'Mrs Noella Hextall', subject: 'Year 7 2027 Orientation Day - Friday 18 September', gist: 'Orientation info and permission paperwork re-attached.', read: true },
    { date: '2026-09-16', time: '4:30 pm', sender: 'Ms Melanie Fowler', subject: 'Encounter information', gist: 'Final departure briefing and packing reminders for Year 6 Encounter/Camp.', read: true },
    { date: '2026-09-16', time: '3:54 pm', sender: 'Miss Emily Beake', subject: 'Tara Uniforms - Term 3 Holidays Opening Hours', gist: 'Canning Vale uniform showroom holiday opening schedule.', read: true },
    { date: '2026-09-16', time: '2:34 pm', sender: 'Miss Rochelle Buttigig', subject: 'Weather Related Uniform Update', gist: 'Temporary heat modification: summer uniform or winter without blazer/tie.', read: true },
    { date: '2026-09-14', time: '4:03 pm', sender: 'Mrs Sheree Zecca', subject: 'Last reminders for PYP Exhibition evening', gist: 'Winter uniform; arrive 5:15 pm for 5:45 pm start in BDISC.', read: true },
    { date: '2026-09-13', time: '11:38 am', sender: 'Ms Melanie Fowler', subject: 'Medication- Camp', gist: 'ACTION: Owen camp medication authorisation form expired — updated form needed.', read: true },
    { date: '2026-09-11', time: '4:17 pm', sender: 'Ms Kylie Virgo', subject: 'School Council Bursaries – Supporting Our Community', gist: 'Bursaries available for families experiencing financial hardship.', read: true },
    { date: '2026-09-11', time: '12:36 pm', sender: 'Mrs Susan Kirby', subject: 'Master Planning Community Consultation', gist: 'Invitation to parent consultation on JWACS Master Plan.', read: true },
    { date: '2026-09-10', time: '9:41 am', sender: 'Mrs Noella Hextall', subject: 'Fwd: Year 7, 2027 Orientation', gist: 'Catering registration for Y6 sausage sizzle at Orientation.', read: true },
    { date: '2026-09-08', time: '3:28 pm', sender: 'Miss Emily Beake', subject: 'P&F Disco - Come and Join the Fun!', gist: 'JWACS Primary Glow in the Dark Disco invitation.', read: true },
    { date: '2026-09-08', time: '12:12 pm', sender: 'Mrs Susan Kirby', subject: '**Important information regarding Mathspace**', gist: 'Advisory regarding a data security incident on the Mathspace platform.', read: true },
    { date: '2026-08-18', time: '12:11 pm', sender: 'Mrs Shani Abeyratne', subject: 'Re: Owen', gist: 'Pastoral update: Owen did nothing wrong re toy incident; school policy reinforced.', read: true }
  ];

  /* Cameron Direqt — newest 20 from his SEQTA inbox scrape 30 Sep 2026 */
  var DIREQT_CAMERON = [
    { date: '2026-09-25', sender: 'Mrs Stephanie Gowland', subject: "Wollaston's Wrap, Issue 9, Term 3", gist: 'Newsletter link for the latest school/community update.', read: true },
    { date: '2026-09-24', sender: 'Mrs Noella Hextall', subject: 'Year 7, 2027', gist: 'Asked families to advise if their Year 6 child will not continue to Year 7 at JWACS.', read: true },
    { date: '2026-09-23', sender: 'Ms Kylie Virgo', subject: 'School Photographs - Update', gist: 'Photo orders being processed; expected at school early Term 4. Ordering/query details supplied.', read: true },
    { date: '2026-09-21', sender: 'Mrs Susan Kirby', subject: 'JWACS P&F Pre-Loved Uniform Sale – Thursday 8 October', gist: 'Affordable donated uniform sale ahead of the Term 4 return to summer uniform.', read: true },
    { date: '2026-09-18', sender: 'Miss Emily Beake', subject: 'Lost Property', gist: 'School lost-property notice; see the attached/included information.', read: true },
    { date: '2026-09-17', sender: 'Mrs Leesa Neal', subject: 'Boxer Short Fabric', gist: "Bring Owen's measured-list fabric before the final-week lesson so pieces can be cut before holidays.", read: true },
    { date: '2026-09-17', sender: 'Mrs Noella Hextall', subject: 'Year 7 2027 Orientation Day - Friday 18 September', gist: 'Orientation-day correspondence and forms/attachments for incoming Year 7 families.', read: true },
    { date: '2026-09-16', sender: 'Ms Melanie Fowler', subject: 'Encounter information', gist: 'Year 6 camp departure/weather/preparation reminders.', read: true },
    { date: '2026-09-16', sender: 'Miss Emily Beake', subject: 'Tara Uniforms - Term 3 Holidays Opening Hours', gist: 'Holiday showroom opening-hours attachment.', read: true },
    { date: '2026-09-16', sender: 'Miss Rochelle Buttigig', subject: 'Weather Related Uniform Update', gist: 'Uniform flexibility due to the forecast; students may wear summer or winter options as specified.', read: true },
    { date: '2026-09-14', sender: 'Mrs Sheree Zecca', subject: 'Last reminders for PYP Exhibition evening', gist: 'Exhibition arrival time, formal winter uniform and practical evening reminders.', read: true },
    { date: '2026-09-13', sender: 'Ms Melanie Fowler', subject: 'Medication- Camp', gist: "Reminder to complete/return camp medication paperwork; Owen's paperwork was noted as expired.", read: true },
    { date: '2026-09-11', sender: 'Ms Kylie Virgo', subject: 'School Council Bursaries – Supporting Our Community', gist: '2027 bursary applications open for eligible year groups; financial-support information.', read: true },
    { date: '2026-09-11', sender: 'Mrs Susan Kirby', subject: 'Master Planning Community Consultation', gist: 'Invitation/correspondence to provide input on JWACS master planning.', read: true },
    { date: '2026-09-10', sender: 'Mrs Noella Hextall', subject: 'Fwd: Year 7, 2027 Orientation', gist: 'Invitation/details for 18 Sep orientation, including optional parent talk and catering form.', read: true },
    { date: '2026-09-08', sender: 'Miss Emily Beake', subject: 'P&F Disco - Come and Join the Fun!', gist: 'Reminder/invitation for the Primary Glow in the Dark Disco.', read: true },
    { date: '2026-09-08', sender: 'Mrs Susan Kirby', subject: '**Important information regarding Mathspace**', gist: 'Notice of Mathspace security incident and possible account-data access; school guidance provided.', read: true },
    { date: '2026-09-02', sender: 'Mrs Noella Hextall', subject: 'Year 7, 2027 Orientation', gist: 'Letter/brochure confirming the 18 Sep orientation and parent invitation.', read: true },
    { date: '2026-08-31', sender: 'Miss Emily Beake', subject: 'Head Lice - Years 5 and 6', gist: 'Head-lice information/brochure for families.', read: true },
    { date: '2026-08-27', sender: 'Miss Emily Beake', subject: 'From the Head of Primary', gist: 'Information letter attached, sent on behalf of the Head of Primary.', read: true }
  ];

  /* Back-compat default (Sonjia) for any code still reading HUB.DIREQT */
  var DIREQT = DIREQT_SONJIA;

  /* School calendar: SEQTA Engage + jwacs.wa.edu.au/parents/school-hours-and-calender/
     FB page scrape limited (login/browser wall; only public About + recent ELC photo post).
     Sorted soonest-first. kidAction = show on that kid's page. Never drop without dedupe. */
  var SCHOOL_DATES = [
    { date: '2026-09-25', title: 'Term 3 concludes (last day)', detail: 'Official Term 3 end — website calendar. Then spring vacation.', kids: 'both', familyRelevant: true, source: 'jwacs-website' },
    { date: '2026-09-28', end: '2026-10-12', title: 'Spring vacation (Term 3 / Term 4 break)', detail: 'Holidays through Mon 12 Oct. Term 4 starts Tue 13 Oct (website + SEQTA).', kids: 'both', familyRelevant: true, source: 'seqta+website' },
    { date: '2026-10-08', title: 'JWACS P&F Pre-Loved Uniform Sale', detail: 'P&F / Mrs Susan Kirby. Good for uniforms before Term 4 summer transition.', kids: 'both', familyRelevant: true, source: 'seqta' },
    { date: '2026-10-13', title: 'Term 4 commences — all students return', detail: 'Week B. All students back. Pre-K/K 8:45–2:45; PP–Y12 8:30–3:00 (website hours).', kids: 'both', familyRelevant: true, kidAction: true, source: 'seqta+website' },
    { date: '2026-10-13', title: 'Textiles — Boxer Short fabric due', detail: 'Yasmin: 1.5 m 100% woven cotton + matching thread; pre-wash & iron before Term 4 Week 1 (Mrs Leesa Neal).', kids: 'yasmin', familyRelevant: true, kidAction: true, source: 'seqta-direqt' },
    { date: '2026-10-13', time: '9:30–10:30 am', title: 'Year 2 to 6 Welcome Back Assembly', detail: 'Relevant for Owen (Year 6).', kids: 'owen', familyRelevant: true, kidAction: true, source: 'seqta' },
    { date: '2026-10-14', time: '8:45–9:40 am', title: 'Prefect Commissioning Service', detail: 'Whole-school chapel/service.', kids: 'both', familyRelevant: true, source: 'seqta' },
    { date: '2026-10-15', time: '6:00–7:00 pm', title: 'Valedictory Dinner', detail: 'Year 12 farewell dinner.', kids: 'both', familyRelevant: false, source: 'seqta' },
    { date: '2026-10-16', time: '12:45–1:30 pm', title: 'Valedictory Mug presentation', detail: 'Year 12 Valedictory event.', kids: 'both', familyRelevant: false, source: 'seqta' },
    { date: '2026-10-19', time: '2:15–3:00 pm', title: 'Valedictory Chapel Service', detail: 'Year 12 Valedictory Chapel.', kids: 'both', familyRelevant: false, source: 'seqta' },
    { date: '2026-10-20', time: '8:45–9:45 am', title: 'Gift of the Candle Service', detail: 'Chapel service — senior school.', kids: 'both', familyRelevant: false, source: 'seqta' },
    { date: '2026-10-20', time: '6:00–7:00 pm', title: 'Valedictory and Prize Giving', detail: 'Evening prize giving.', kids: 'both', familyRelevant: false, source: 'seqta' },
    { date: '2026-10-21', title: 'Year 12 Final Day + Fancy Dress Breakfast', detail: 'Term 4 concludes for Year 12 (website + SEQTA).', kids: 'both', familyRelevant: false, source: 'seqta+website' },
    { date: '2026-10-23', title: 'Pre-Primary Encounter (Kings Park)', detail: 'Primary junior excursion.', kids: 'both', familyRelevant: false, source: 'seqta' },
    { date: '2026-10-27', time: '9:00–10:30 am', title: 'School Open Morning', detail: 'Open morning for prospective and current families.', kids: 'both', familyRelevant: true, source: 'seqta' },
    { date: '2026-10-30', title: "World Teachers' Day + Yasmin VA Task 3A due", detail: 'World Teachers\' Day. Yasmin Expressionism Investigation due.', kids: 'yasmin', familyRelevant: true, source: 'seqta' },
    { date: '2026-11-02', title: 'Mathematics — Task 10 Probability (9%)', detail: 'Yasmin Term 4 assessment.', kids: 'yasmin', familyRelevant: true, source: 'seqta' },
    { date: '2026-11-03', time: '8:30 am – evening', title: 'Instrumental Concert', detail: 'Sound check and evening performance.', kids: 'both', familyRelevant: true, source: 'seqta' },
    { date: '2026-11-06', title: 'ACC Multi-Sport Day + Y9/10 Musical Theatre', detail: 'Also Yasmin VA Task 3B due.', kids: 'both', familyRelevant: true, source: 'seqta' },
    { date: '2026-11-09', time: '6:30–8:00 pm', title: 'P&F Association Meeting', detail: 'Parents and Friends meeting.', kids: 'both', familyRelevant: true, source: 'seqta' },
    { date: '2026-11-13', title: 'P&F Association Community Movie Night', detail: 'Family-friendly P&F event.', kids: 'both', familyRelevant: true, source: 'seqta' },
    { date: '2026-11-16', title: 'Mathematics — Task 11 Major Assessment 2 (16%)', detail: 'Yasmin Term 4 / Semester 2.', kids: 'yasmin', familyRelevant: true, source: 'seqta' },
    { date: '2026-11-17', title: 'English — Task 7 Skellig Sequel Opening Chapter', detail: 'Yasmin Term 4 Creating task.', kids: 'yasmin', familyRelevant: true, source: 'seqta' },
    { date: '2026-11-19', title: 'Year 11 Final Day', detail: 'Term 4 concludes for Year 11 (JWACS website calendar).', kids: 'both', familyRelevant: false, source: 'jwacs-website' },
    { date: '2026-11-20', title: 'Mathematics — Task 12 Other 4 Term 4 (3%)', detail: 'Yasmin Term 4 assessment.', kids: 'yasmin', familyRelevant: true, source: 'seqta' },
    { date: '2026-11-27', title: 'Visual Arts — Task 3C Expressionist Portrait Production', detail: 'Yasmin Term 4 production.', kids: 'yasmin', familyRelevant: true, source: 'seqta' },
    { date: '2026-12-02', title: 'Year 10 Final Day', detail: 'Term 4 concludes for Year 10 (JWACS website calendar).', kids: 'both', familyRelevant: false, source: 'jwacs-website' },
    { date: '2026-12-04', time: 'midday', title: 'ELC finish (midday)', detail: 'Early Learning Centre Term 4 finish (JWACS website calendar).', kids: 'both', familyRelevant: false, source: 'jwacs-website' },
    { date: '2026-12-09', time: 'midday', title: 'Years 2–6 finish (midday)', detail: "Owen's cohort finish (website + SEQTA).", kids: 'owen', familyRelevant: true, kidAction: true, source: 'seqta+website' },
    { date: '2026-12-09', time: '3:00 pm', title: 'Years 7–9 finish (3:00 pm)', detail: "Yasmin's cohort finish (website + SEQTA).", kids: 'yasmin', familyRelevant: true, kidAction: true, source: 'seqta+website' }
  ];

  return {
    TODAY: TODAY,
    OVERDUE_WINDOW_DAYS: OVERDUE_WINDOW_DAYS,
    META: META,
    COURSES: COURSES,
    ITEMS: ITEMS,
    PARENT_ATTENTION: PARENT_ATTENTION,
    DIREQT: DIREQT,
    DIREQT_SONJIA: DIREQT_SONJIA,
    DIREQT_CAMERON: DIREQT_CAMERON,
    SCHOOL_DATES: SCHOOL_DATES
  };
})();
