export const topics = ["Web development", "Data analysis", "Digital marketing"];
export const sectors = ["Technology", "Business", "Creative"];
const definitions = [
  {
    id: "web-foundations",
    topic: topics[0],
    sector: "Technology",
    title: "Your first page, from scratch",
    description:
      "Give your ideas a home on the web. Start with the building blocks of a clear, useful page.",
    outcomes: [
      "Structure a page with HTML",
      "Style a readable layout",
      "Publish a small first project",
    ],
    lessons: [
      [
        "HTML is a meaningful outline",
        "HTML describes the meaning and structure of a webpage. A heading introduces a section, a paragraph holds an idea, and a link connects the reader to another destination. Choose elements for their purpose before thinking about how they look.\n\nStart with one h1 for your page title. Use h2 elements for sections and p elements for paragraphs. Wrap the main content in main. A clear outline helps readers and assistive technology navigate your page.\n\nPractice: sketch a personal introduction page with a title, a short biography, and a link to a project. Write the content first, then choose an HTML element for each part.",
      ],
      [
        "Make room for your content",
        "CSS controls how content is presented. A selector chooses elements, and a declaration assigns a property such as color, padding, or font size. Start with a small set of rules that makes your page comfortable to read.\n\nThe box model treats each element as content surrounded by padding, a border, and margin. Padding creates room inside a box. Margin separates that box from its neighbors. Using box-sizing: border-box makes the declared width include padding and border.\n\nPractice: add space around your introduction, limit the text width, and choose a readable line height. Resize the browser and check that text stays within the screen.",
      ],
      [
        "A page worth sharing",
        "A first project does not need many features. It needs a clear purpose, working links, and readable content. Test it at a narrow width and navigate it using only your keyboard.\n\nBefore sharing, check that headings follow a logical order and that each link describes its destination. If you include an image, write alternative text that communicates its purpose. These small checks make your page useful to more people.\n\nPractice: ask a friend to find your project link without giving instructions. Note where they hesitate and improve the wording or layout.",
      ],
    ],
  },
  {
    id: "web-layout",
    topic: topics[0],
    sector: "Creative",
    title: "Layouts that feel effortless",
    description:
      "Build visual confidence with spacing, flexible layouts, and responsive design.",
    outcomes: [
      "Use flexbox",
      "Create responsive grids",
      "Improve visual hierarchy",
    ],
    lessons: [
      [
        "Space creates hierarchy",
        "Visual hierarchy helps people understand what matters first. A larger heading, a shorter line of text, and generous space can communicate priority without adding decoration.\n\nChoose a spacing scale and reuse it. Related elements should sit closer together than unrelated sections. Consistent spacing makes a page feel organized and helps readers scan it.\n\nPractice: draw three content cards and vary only the heading size and spacing. Identify which version communicates the most clearly.",
      ],
      [
        "Flexible rows with flexbox",
        "Flexbox arranges elements along a main axis. A row uses a horizontal main axis, while a column uses a vertical one. The gap property creates consistent space between items.\n\nUse align-items for alignment along the cross axis and justify-content for distribution along it. Allow wrapping when items cannot fit comfortably on one line.\n\nPractice: arrange three cards in a row, then let them wrap as the window narrows. Keep each card readable rather than forcing a fixed width.",
      ],
      [
        "Design for the narrow screen",
        "Responsive design lets a layout adapt to the space available. Begin with a single column, then add columns only when there is enough room for comfortable reading.\n\nA media query applies styles under a condition such as a minimum viewport width. Choose the breakpoint where the content needs a change, rather than assuming every device has the same size.\n\nPractice: test a card grid at a phone-sized width and a desktop width. Check for horizontal overflow and links that are difficult to tap.",
      ],
    ],
  },
  {
    id: "web-interaction",
    topic: topics[0],
    sector: "Business",
    title: "Make your page respond",
    description:
      "Learn the small JavaScript interactions that turn static pages into useful tools.",
    outcomes: ["Handle an event", "Manage simple state", "Validate a form"],
    lessons: [
      [
        "Listen for an action",
        "JavaScript can respond to actions such as clicking a button or entering text. An event listener connects that action to a function. Keep the function focused on one behavior.\n\nChoose a real button element for an action. It already supports keyboard interaction and communicates its purpose to assistive technology. Avoid using a decorative element as a button.\n\nPractice: create a button that changes a short message after it is clicked. Make the message describe what happened.",
      ],
      [
        "State remembers what changed",
        "State is information your interface needs to remember. A task list might store each task and whether it is complete. The interface should display a view derived from that information.\n\nUpdate the stored information first, then render the result. This makes it easier to reason about the interface than changing unrelated elements independently.\n\nPractice: model a task as a title and a completed flag. Show how its display changes when the flag becomes true.",
      ],
      [
        "Helpful forms",
        "A form should tell people what to enter and how to fix mistakes. Labels explain fields, while validation checks whether the entered values meet the rules.\n\nClient validation provides quick feedback, but server validation is still necessary. A request can reach the server without passing through your interface.\n\nPractice: require a task title and display a specific message when it is missing. Keep the entered values so the learner can fix the mistake.",
      ],
    ],
  },
  {
    id: "data-foundations",
    topic: topics[1],
    sector: "Business",
    title: "Find the story in a spreadsheet",
    description:
      "Turn a table of numbers into a question you can answer with confidence.",
    outcomes: [
      "Frame an analysis question",
      "Clean a small table",
      "Summarize a useful metric",
    ],
    lessons: [
      [
        "Start with a question",
        "An analysis begins with a question, not a chart. A useful question identifies a decision, a group, and a time period. For example, which product had the most returns last month?\n\nDefine the unit represented by each row. A row might be an order, an item, or a customer. Mixing these units can make totals misleading.\n\nPractice: write a question about a small sales table. State what one row represents and what information you need to answer it.",
      ],
      [
        "A clean table is a useful table",
        "Data cleaning makes values consistent enough to compare. Check for missing values, repeated rows, inconsistent dates, and different spellings of the same category.\n\nKeep an unchanged copy of the original data. Record the cleaning decisions so another person can understand how the result was produced. Do not replace missing values with zero unless zero has the correct meaning.\n\nPractice: list three checks you would perform before calculating total sales. Explain how each issue could affect the result.",
      ],
      [
        "Choose a measure carefully",
        "A total describes overall quantity, while an average describes a typical value under a particular definition. The median is the middle value when observations are ordered and is less sensitive to a few extreme values.\n\nChoose a measure that answers your question. Average order value and total revenue describe different things. Always include units and the period covered.\n\nPractice: compare the mean and median of 10, 12, 13, 15, and 100. Explain why they tell different stories.",
      ],
    ],
  },
  {
    id: "data-charts",
    topic: topics[1],
    sector: "Creative",
    title: "Charts people can understand",
    description:
      "Choose clear charts and write conclusions that respect the evidence.",
    outcomes: [
      "Choose a chart type",
      "Label axes clearly",
      "Communicate limitations",
    ],
    lessons: [
      [
        "Match the chart to the question",
        "A bar chart compares categories. A line chart shows how a measure changes over an ordered sequence such as time. The chart should make the intended comparison easy to see.\n\nAvoid choosing a chart only because it looks impressive. Ask what relationship the viewer needs to understand and remove elements that distract from it.\n\nPractice: choose a chart for monthly sales and another for sales by product category. Explain your choices.",
      ],
      [
        "Labels are part of the evidence",
        "A chart needs a title, meaningful labels, and units. Without them, a reader cannot know what the numbers represent or whether the comparison is relevant.\n\nFor bar charts, a zero baseline usually preserves the visual comparison of bar lengths. If you use a different scale, make the choice explicit and consider whether it could mislead.\n\nPractice: write a title that names the measure and date range. Add units to the vertical axis.",
      ],
      [
        "Explain what the chart cannot say",
        "A chart can reveal a pattern without establishing its cause. If sales rose after a campaign, other changes may also have contributed. Correlation alone does not prove causation.\n\nSeparate the observation from the interpretation. State the sample size, time period, and important missing information when you present a conclusion.\n\nPractice: write one sentence describing a trend and a second sentence explaining a limitation.",
      ],
    ],
  },
  {
    id: "data-sql",
    topic: topics[1],
    sector: "Technology",
    title: "Ask better questions with SQL",
    description:
      "Explore how queries retrieve, filter, and summarize structured information.",
    outcomes: ["Understand SELECT", "Filter records", "Group and aggregate"],
    lessons: [
      [
        "Select the columns you need",
        "SQL retrieves information from tables. A SELECT statement names the columns you want, and FROM identifies the table containing them.\n\nChoose specific columns when possible. This makes the query easier to understand and avoids retrieving information you do not need.\n\nPractice: describe a query that retrieves product names and prices from a products table.",
      ],
      [
        "Filter with a clear condition",
        "A WHERE clause keeps rows that meet a condition. Conditions can compare numbers, dates, or text. Combining conditions with AND requires both to be true.\n\nMissing values are represented by NULL. Use IS NULL to check for them rather than treating them as an ordinary number or string.\n\nPractice: describe how to retrieve orders made during a specific month with a value above a chosen amount.",
      ],
      [
        "Summarize with groups",
        "GROUP BY collects rows with shared values so aggregate functions can summarize each group. COUNT counts records, while SUM adds a numeric measure.\n\nCheck the unit of each row before aggregating. A join can repeat rows and inflate totals if the relationship between tables is misunderstood.\n\nPractice: outline a query for total revenue by product category. State what could cause accidental double counting.",
      ],
    ],
  },
  {
    id: "marketing-foundations",
    topic: topics[2],
    sector: "Business",
    title: "Reach the people who need you",
    description:
      "Connect an audience, a useful message, and a measurable campaign goal.",
    outcomes: [
      "Define an audience",
      "Write a value proposition",
      "Choose a campaign metric",
    ],
    lessons: [
      [
        "Choose an audience you can describe",
        "An audience is a group with a relevant need, situation, or behavior. Describing only an age range rarely explains why someone would care about your offer.\n\nAsk what problem the audience is trying to solve, where they look for help, and what makes a solution credible to them. Treat your answers as hypotheses to test.\n\nPractice: describe an audience for an online beginner course using a need and a constraint.",
      ],
      [
        "A useful promise",
        "A value proposition explains who an offer helps, what benefit it provides, and why that benefit matters. Specific wording is easier to evaluate than a broad promise of excellence.\n\nAvoid claims you cannot support. Connect your message to an observable benefit and explain what the person can reasonably expect.\n\nPractice: write one sentence describing the benefit of your course for the audience you selected.",
      ],
      [
        "Measure the goal, not the noise",
        "A campaign metric should connect to the campaign goal. Reach can help evaluate awareness, while completed sign-ups are more relevant to a registration goal.\n\nDefine the numerator, denominator, and measurement period for a rate. A change in clicks does not necessarily mean a change in meaningful outcomes.\n\nPractice: choose a primary metric for a course-registration campaign and explain what it leaves out.",
      ],
    ],
  },
  {
    id: "marketing-content",
    topic: topics[2],
    sector: "Creative",
    title: "Content with a clear purpose",
    description:
      "Plan useful content that earns attention and leads to a sensible next step.",
    outcomes: [
      "Plan a content series",
      "Write a clear opening",
      "Create a useful call to action",
    ],
    lessons: [
      [
        "Teach one useful thing",
        "A focused piece of content helps the audience solve one small problem. Begin with a question they already have and offer a concrete answer or example.\n\nA content series can move from a simple concept to a practical application. Consistency of purpose matters more than publishing as often as possible.\n\nPractice: outline three posts that help a beginner move toward one small outcome.",
      ],
      [
        "Make the opening specific",
        "An opening should help readers decide whether the content is relevant. Name the problem or useful outcome without exaggerating the promise.\n\nUse plain language and keep the first paragraph focused. A clear example often communicates more than a collection of abstract claims.\n\nPractice: replace a vague headline with one that names the intended audience and task.",
      ],
      [
        "Offer a sensible next step",
        "A call to action tells the audience what they can do next. It should fit the content and require an amount of effort that makes sense at that point.\n\nExplain what happens after the action. A link labeled Download the checklist gives more information than a link labeled Click here.\n\nPractice: write a call to action for a tutorial that leads to a short practice exercise.",
      ],
    ],
  },
  {
    id: "marketing-experiments",
    topic: topics[2],
    sector: "Technology",
    title: "Small experiments, useful lessons",
    description:
      "Test a campaign idea and interpret results without overclaiming.",
    outcomes: [
      "Form a test hypothesis",
      "Compare variants fairly",
      "Interpret results cautiously",
    ],
    lessons: [
      [
        "Write a testable hypothesis",
        "A hypothesis predicts how a specific change might affect a measure. It connects the change to a reason rather than guessing that one design is better.\n\nChoose one main change for a small test. Changing the headline, layout, audience, and timing together makes it difficult to learn what mattered.\n\nPractice: predict how a clearer button label might affect completed registrations and explain why.",
      ],
      [
        "Compare fairly",
        "A fair comparison aims to keep conditions similar across variants. Different audiences or time periods can create differences unrelated to the change being tested.\n\nDecide the primary metric and test period before looking at results. Repeatedly stopping when a preferred variant looks better can produce misleading conclusions.\n\nPractice: list the conditions you would keep consistent in a comparison of two email subject lines.",
      ],
      [
        "Learn without overclaiming",
        "Small samples can produce large apparent differences by chance. A result should be interpreted alongside sample size, uncertainty, and the cost of making the wrong decision.\n\nRecord what you changed, what you observed, and what remains uncertain. An inconclusive test can still help you design a better next experiment.\n\nPractice: write a cautious conclusion for a test with only twenty participants.",
      ],
    ],
  },
];
export const catalog = definitions.map((r, index) => ({
  ...r,
  level: "Beginner",
  source: "Original Staywise demo lessons",
  estimatedMinutes: 45 + (index % 3) * 15,
  lessons: r.lessons.map(([title, text], order) => ({
    id: `${r.id}-${order + 1}`,
    order,
    title,
    text,
    estimatedMinutes: 15 + (index % 3) * 5,
  })),
}));
export const sampleReviews = [
  {
    author: "Amara",
    rating: 5,
    text: "The short lessons and concrete practice tasks made this approachable. I could study in a lunch break.",
  },
  {
    author: "Tunde",
    rating: 4,
    text: "Clear explanations and a useful starting point. I would like more worked examples.",
  },
  {
    author: "Nora",
    rating: 3,
    text: "Good for beginners, but the material is too introductory for someone with experience.",
  },
  {
    author: "Sam",
    rating: 4,
    text: "The sequence is easy to follow. There are no videos, so you need to be comfortable learning from text.",
  },
];
