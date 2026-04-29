/**
 * End-of-module quizzes. Two or three multiple-choice questions per
 * module, surfaced after the worked examples per Codex's note that
 * quiz-after-text feels like homework but quiz-after-numbers feels
 * like confidence-building.
 *
 * Each option carries its own explanation that's revealed when the
 * user clicks it. The point is self-check, not grading. No scoreboards.
 */

export type QuizOption = {
  label: string;
  correct: boolean;
  explanation: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

export const quizzes: Record<string, QuizQuestion[]> = {
  basics: [
    {
      id: "what-is-409a",
      prompt: "What is a 409A valuation?",
      options: [
        {
          label: "The IRS's official market price for your shares",
          correct: false,
          explanation:
            "The 409A is a tax-purposes appraisal, not a market price. The actual market can pay much more or much less.",
        },
        {
          label:
            "An independent appraisal used to set strike prices for new option grants",
          correct: true,
          explanation:
            "Right. An outside firm estimates the company's value periodically; the strike price for new grants is set against this number.",
        },
        {
          label: "What you'll get when you sell your shares",
          correct: false,
          explanation:
            "Treat the 409A as a tax number, not a sale price. Real selling prices can differ a lot.",
        },
        {
          label: "A monthly report from your equity team",
          correct: false,
          explanation:
            "409As are done periodically by an outside firm, not as a regular internal report.",
        },
      ],
    },
    {
      id: "vesting-start-vs-grant-date",
      prompt:
        "Your grant date is January 15. Your vesting start date is March 1. When does your vesting clock begin?",
      options: [
        {
          label: "January 15",
          correct: false,
          explanation:
            "The grant date is when the award was approved. Vesting runs from the vesting start date, which can be different.",
        },
        {
          label: "March 1",
          correct: true,
          explanation:
            "Right. Vesting always runs from the vesting start date, even when it differs from the grant date.",
        },
        {
          label: "Whenever your first paycheck is",
          correct: false,
          explanation:
            "Pay dates have nothing to do with vesting. Vesting runs from the vesting start date in your grant letter.",
        },
        {
          label: "It depends on manager approval",
          correct: false,
          explanation:
            "Vesting is set in your grant letter, not by a manager.",
        },
      ],
    },
  ],

  isos: [
    {
      id: "iso-tax-at-exercise",
      prompt:
        "You exercise ISOs and the spread is $50,000. What gets taxed at exercise as ordinary income?",
      options: [
        {
          label: "$50,000",
          correct: false,
          explanation:
            "That would be NSO treatment. ISOs have no regular income tax at exercise.",
        },
        {
          label: "Nothing. ISOs have no regular income tax at exercise.",
          correct: true,
          explanation:
            "Right. ISOs avoid ordinary income at exercise. But the $50,000 spread does count toward AMT, which can produce its own bill.",
        },
        {
          label: "Capital gains on the $50,000",
          correct: false,
          explanation:
            "There's no sale yet, so no capital gains. The spread only matters for AMT until you sell.",
        },
        {
          label: "Half ordinary, half capital gains",
          correct: false,
          explanation:
            "ISOs don't blend tax treatments. At exercise: nothing for regular tax, full spread for AMT.",
        },
      ],
    },
    {
      id: "qualifying-disposition-periods",
      prompt:
        "Which two holding periods do you have to satisfy for an ISO qualifying disposition?",
      options: [
        {
          label: "6 months from exercise + 1 year from grant",
          correct: false,
          explanation:
            "Both periods are longer. The rule is 1 year past exercise and 2 years past grant.",
        },
        {
          label: "1 year from exercise AND 2 years from grant",
          correct: true,
          explanation:
            "Right. You need both. Miss either and any gain up to the exercise spread becomes ordinary income; gain above the spread stays capital. A sale at a loss is just a capital loss, no ordinary-income piece.",
        },
        {
          label: "2 years from exercise + 1 year from grant",
          correct: false,
          explanation:
            "The numbers are right but the labels are flipped. It's 1 year from exercise and 2 years from grant.",
        },
        {
          label: "There are no holding periods for ISOs",
          correct: false,
          explanation:
            "There are. Without them, the favorable ISO treatment doesn't apply.",
        },
      ],
    },
    {
      id: "amt-difference",
      prompt:
        "You exercise ISOs. Your regular tax bill is $30,000. Your AMT calculation comes out to $35,000. What do you owe in AMT?",
      options: [
        {
          label: "Nothing. AMT only matters when you sell.",
          correct: false,
          explanation:
            "AMT is calculated at exercise, not at sale. Whether it produces an actual bill depends on the comparison to regular tax.",
        },
        {
          label: "$35,000",
          correct: false,
          explanation:
            "$35,000 is what AMT itself comes to. You owe the difference between AMT and regular tax, not the AMT total.",
        },
        {
          label: "$5,000 (the difference)",
          correct: true,
          explanation:
            "Right. AMT is owed only to the extent it exceeds your regular tax. Here, $35K AMT minus $30K regular = $5K extra.",
        },
        {
          label: "$30,000",
          correct: false,
          explanation:
            "$30,000 is your regular tax. AMT is the additional amount above regular, not the regular amount itself.",
        },
      ],
    },
  ],

  nsos: [
    {
      id: "nso-spread-at-exercise",
      prompt:
        "Your NSO strike is $5. FMV at exercise is $20. You exercise 1,000 shares. What's taxed as ordinary income at exercise?",
      options: [
        {
          label: "$5,000",
          correct: false,
          explanation: "$5,000 is the cash cost to exercise (1,000 × $5), not the income.",
        },
        {
          label: "$15,000 (the spread)",
          correct: true,
          explanation:
            "Right. The spread is (FMV − strike) × shares = ($20 − $5) × 1,000 = $15,000, taxed as ordinary income.",
        },
        {
          label: "$20,000 (the value at exercise)",
          correct: false,
          explanation:
            "You only owe income on the spread, not the full value. The $5 strike you paid isn't income.",
        },
        {
          label: "Nothing until you sell",
          correct: false,
          explanation:
            "That's ISO treatment. NSOs trigger ordinary income at exercise, not at sale.",
        },
      ],
    },
    {
      id: "nso-eligibility",
      prompt: "Who is eligible to receive NSOs?",
      options: [
        {
          label: "Only employees",
          correct: false,
          explanation:
            "That's the ISO rule. NSOs have broader eligibility.",
        },
        {
          label:
            "Anyone the company chooses: employees, directors, contractors, advisors",
          correct: true,
          explanation:
            "Right. NSOs aren't restricted to employees, which is why they're often the option type used for board members and advisors.",
        },
        {
          label: "Only US tax residents",
          correct: false,
          explanation: "Residency isn't a restriction on NSO eligibility.",
        },
        {
          label: "Only people past the vesting cliff",
          correct: false,
          explanation:
            "Eligibility is set by who can receive the grant, not by where they are in vesting.",
        },
      ],
    },
  ],

  rsus: [
    {
      id: "rsu-double-trigger-stuck",
      prompt:
        "Your private company grants you RSUs that time-vest over 4 years. Four years pass with no liquidity event. What do you have?",
      options: [
        {
          label: "Shares you can freely sell",
          correct: false,
          explanation:
            "Without a liquidity event, the second trigger hasn't fired and shares haven't delivered.",
        },
        {
          label:
            "Time-vested RSUs that haven't settled because the second trigger hasn't fired",
          correct: true,
          explanation:
            "Right. Both triggers have to fire before shares actually deliver. Time-vesting is necessary but not sufficient.",
        },
        {
          label: "Common stock with full ownership",
          correct: false,
          explanation:
            "RSUs don't become common stock until both triggers have fired and the shares deliver.",
        },
        {
          label: "Nothing. RSUs expire after 4 years.",
          correct: false,
          explanation:
            "RSUs don't expire on a fixed schedule. They wait for the second trigger.",
        },
      ],
    },
    {
      id: "rsu-net-after-withholding",
      prompt:
        "100 RSUs settle at $50/share. The company withholds at a 35% rate. Roughly how many shares do you keep?",
      options: [
        {
          label: "100",
          correct: false,
          explanation:
            "Withholding sells some of the vested shares to cover taxes. You don't keep the full count.",
        },
        {
          label: "65",
          correct: true,
          explanation:
            "Right. ~35 shares get sold to cover the ~35% tax rate, leaving ~65.",
        },
        {
          label: "35",
          correct: false,
          explanation:
            "35 is roughly what gets sold for taxes. You keep what's left, not what was sold.",
        },
        {
          label: "50",
          correct: false,
          explanation:
            "50% withholding would leave 50, but the rate here is 35%.",
        },
      ],
    },
  ],

  tax: [
    {
      id: "iso-amt-spread",
      prompt:
        "You hold 1,000 ISOs at a $2 strike. FMV is $10. What's your AMT exposure at exercise?",
      options: [
        {
          label: "$0. ISOs have no AMT.",
          correct: false,
          explanation:
            "ISO spread does count toward AMT. It's the regular income tax that's $0 at exercise, not the AMT.",
        },
        {
          label: "$2,000",
          correct: false,
          explanation:
            "$2,000 is the cash cost to exercise (1,000 × $2 strike), not the AMT exposure.",
        },
        {
          label: "$8,000",
          correct: true,
          explanation:
            "Right. AMT exposure is the spread: ($10 − $2) × 1,000 = $8,000. Whether AMT actually triggers depends on your full tax picture.",
        },
        {
          label: "$10,000",
          correct: false,
          explanation:
            "$10,000 is the FMV total. AMT exposure is just the spread (FMV − strike) × shares.",
        },
      ],
    },
    {
      id: "83b-deadline",
      prompt:
        "You early-exercise unvested options and want to start the long-term capital-gains clock. When must you file an 83(b)?",
      options: [
        {
          label: "Within 30 days of exercise",
          correct: true,
          explanation:
            "Right. 30 days from exercise. There are no extensions; miss the window and the election is gone.",
        },
        {
          label: "Within 30 days of vesting",
          correct: false,
          explanation:
            "The 30 days runs from exercise (when you actually pay), not from vesting.",
        },
        {
          label: "With your tax return for that year",
          correct: false,
          explanation:
            "Tax return time is much later. The 83(b) is a separate filing within 30 days of exercise.",
        },
        {
          label: "Anytime before sale",
          correct: false,
          explanation:
            "The 30-day window has no extensions. After it closes, you can't file an 83(b) for that exercise.",
        },
      ],
    },
  ],

  liquidity: [
    {
      id: "post-ipo-lockup",
      prompt:
        "Your company IPOs and you're an insider. When can you usually start selling vested shares?",
      options: [
        {
          label: "Day 1 of trading",
          correct: false,
          explanation:
            "Insiders are locked up at IPO. Day 1 trading is for the public, not for employees.",
        },
        {
          label:
            "After the lock-up window, commonly 90–180 days post-IPO",
          correct: true,
          explanation:
            "Right. Lock-ups vary but 90–180 days is typical. Your specific window is in the IPO documents your employer shares.",
        },
        {
          label: "Exactly 1 year after IPO",
          correct: false,
          explanation:
            "There's no fixed 1-year rule. The lock-up is set per IPO, often 90–180 days.",
        },
        {
          label: "Anytime, with company permission",
          correct: false,
          explanation:
            "Lock-up is a contractual restriction with a fixed end date. The company doesn't grant exceptions to insiders the way 'with permission' implies.",
        },
      ],
    },
    {
      id: "tender-offer",
      prompt: "What's a tender offer at a private company?",
      options: [
        {
          label: "A required quarterly stock sale",
          correct: false,
          explanation:
            "Tender offers are voluntary, not required, and not on a fixed cadence.",
        },
        {
          label:
            "A company-organized chance for employees and early investors to sell some shares pre-IPO",
          correct: true,
          explanation:
            "Right. The company opens a window, sets a price, and lets selected holders sell some of their shares. Limited and voluntary.",
        },
        {
          label: "An IPO substitute",
          correct: false,
          explanation:
            "Tender offers don't make a company public. They're a one-time liquidity mechanism, not an alternative to going public.",
        },
        {
          label: "The price the company pays to buy back leavers' shares",
          correct: false,
          explanation:
            "That's a forced repurchase, not a tender offer. Tender offers are voluntary participation.",
        },
      ],
    },
  ],
  leaving: [
    {
      id: "post-termination-window",
      prompt:
        "You give notice on Friday and your plan says you have a 90-day post-termination exercise window. What happens if you do nothing?",
      options: [
        {
          label: "Your vested options stay forever",
          correct: false,
          explanation:
            "They don't. Vested options come with a fixed window after termination, and after that window they expire.",
        },
        {
          label:
            "Your vested options expire 90 days after your last day. They're gone.",
          correct: true,
          explanation:
            "Right. The clock is the most common reason vested options get forfeited. Find the exact number in your plan document and put the deadline in your calendar.",
        },
        {
          label:
            "The company is required to give you an extension if you ask for one",
          correct: false,
          explanation:
            "Some companies extend their windows by default (5 to 10 years). Most don't, and there's no requirement to grant an extension.",
        },
        {
          label: "Unvested options keep vesting on their old schedule",
          correct: false,
          explanation:
            "Unvested options stop vesting on your last day, with rare exceptions in negotiated severance.",
        },
      ],
    },
    {
      id: "early-exercised-leaver",
      prompt:
        "You early-exercised 4,000 unvested NSOs at a $1 strike with an 83(b) election. You leave 18 months later, with only 2,000 vested. What happens?",
      options: [
        {
          label: "You keep all 4,000 shares",
          correct: false,
          explanation:
            "The unvested portion typically gets repurchased by the company at your original strike. You keep the 2,000 vested.",
        },
        {
          label: "The company repurchases your 2,000 unvested shares at $1",
          correct: true,
          explanation:
            "Right. The unvested shares unwind. The strike money you paid for those 2,000 shares comes back, but the tax you paid on the spread doesn't.",
        },
        {
          label: "You get a refund of all the tax you paid at exercise",
          correct: false,
          explanation:
            "Early exercise locks in your tax basis under 83(b), but taxes you paid on the unvested portion don't come back if you leave before those shares vest.",
        },
        {
          label:
            "The company has to let you keep all 4,000 because you filed 83(b)",
          correct: false,
          explanation:
            "83(b) sets your tax basis. It doesn't override the company's repurchase right on unvested shares.",
        },
      ],
    },
  ],
  "case-study": [
    {
      id: "year-2-mistake",
      prompt:
        "Looking at Maya's year 2 numbers, what was the cheapest moment to start her long-term capital gains clock?",
      options: [
        {
          label: "Wait for the unicorn round",
          correct: false,
          explanation:
            "The unicorn round made the AMT exposure 60x larger. That's the opposite of cheap.",
        },
        {
          label: "Exercise her vested options when the spread was small",
          correct: true,
          explanation:
            "Right. When FMV is barely above strike, AMT is barely a thing. Exercising early started the LTCG clock at minimal tax cost.",
        },
        {
          label: "Wait until the tender so she had cash to cover taxes",
          correct: false,
          explanation:
            "By the tender, the spread was huge. Cash from the tender helped cover the tax, but she ended up with a much bigger bill than if she'd exercised earlier.",
        },
        {
          label: "Wait until IPO and exercise then",
          correct: false,
          explanation:
            "Exercising at IPO means the spread is at IPO-day FMV. If she exercises and sells inside the same year, that's a disqualifying disposition for ISOs and the entire spread is taxed as ordinary income. If she exercises and holds, she's exposed to AMT on the full spread. Late exercise is the most expensive exercise either way.",
        },
      ],
    },
  ],
};

export function quizFor(moduleId: string): QuizQuestion[] {
  return quizzes[moduleId] ?? [];
}
