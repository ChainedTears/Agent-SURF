const randomUseragent = require("random-useragent");
const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);
const { OpenAI } = require("openai");
const fs = require("fs");

const client = new OpenAI({
  baseURL: "", // http://localhost:1234/v1
  apiKey: "", // lm-studio
});

let plans;
var html = null;
const websiteURL = "";
const prompt = "";

/* (async () => {
  let temphtml = (await axios.get(websiteURL)).data;
  const dom = new JSDOM(temphtml);
  const { document } = dom.window;
  ["script", "style", "head", "iframe", "noscript", "header", "aside"].forEach(
    (tag) => {
      document.querySelectorAll(tag).forEach((el) => el.remove());
    }
  );
  html = document.body.innerHTML;
})(); */

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(websiteURL);
  await page.waitForLoadState("load");
  html = await page.evaluate(() => {
    const elements = Array.from(document.body.querySelectorAll("*"));

    elements.forEach((i) => {
      const style = window.getComputedStyle(i);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      ) {
        i.remove();
      }
    });
    return document.body.innerHTML
      .replace(/\n\s*/g, "")
      .replace(/>\s+</g, "><")
      .trim();
  });

  await browser.close();
})();

// Planner agent using OpenAI
async function runPlanner() {
  try {
    while (html === null) {
      console.warn("Awaiting HTML... Retrying in 2 seconds.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    const userPrompt = `
User Prompt: ${prompt}
Website URL: ${websiteURL}
Website HTML: ${html}
`;
    console.log("HTML Received. Generating Plan...");
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are an AI assistant for planning automated web tasks. 
Your goal is to generate a minimal, efficient set of steps to complete a task based on the user’s prompt.

Process:

The user provides a task prompt.
You generate a minimal set of steps required to complete the task.
The steps are passed to an agent that generates Playwright code for execution.
Your output should be clear, focused, and minimal.
Your output should not contain attributes that help the execution agent or any code.
If the prompt requires you to extract data from a website, try getting all data in one step.

Example:

Prompt: Search for cute cats on Google

Response Format:

3,open google,input cute cats into the search bar,press enter

            `,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      stream: false, // Enable streaming
    });
    response = completion.choices[0].message.content;
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error in Planner Agent:", error);
  }
}

//     let fullResponse = "";
//     for await (const chunk of completion) {
//       const content = chunk.choices[0]?.delta?.content || "";
//       process.stdout.write(content); // Stream to console
//       fullResponse += content; // Collect for return
//     }

//     return fullResponse;
//   } catch (error) {
//     console.error("Error in Planner Agent:", error);
//   }
// }

// Execution agent using OpenAI
async function runExecutionAgent(executionAgentPrompt) {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
Your task is to output a single Playwright function that executes only the assigned step from a provided list of steps. Follow these rules strictly:

Only implement the assigned step — do not attempt any other steps or complete the entire task.
Strictly focus on the action for the assigned step — no additional steps or unnecessary actions (e.g., validation checks), unless explicitly requested.
Always wrap the function in an async format, assuming the browser is already open and the page context is set.
Output ONLY the script — do not explain, comment, or provide any context. Just the script.
You may not use any attribute values or names that are not in the HTML provided.
Always use "id", "class" or "value" attributes if available.
If the element is a input, prioritize the id or value attribute.
Step one does not have HTML. You may ignore the HTML for step one.
Add short delays between actions to mimic human-like behavior.

Example task:

Steps:
1. Open website https://google.com
2. Enter "cats" into the search bar
3. Press enter

If the assigned step is 3 (Press enter), your expected response is:

(async () => {
  await page.keyboard.press('Enter');
})();
          `,
        },
        { role: "user", content: executionAgentPrompt },
      ],
      temperature: 0.5,
      stream: false, // Enable streaming
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error in Planner Agent:", error);
  }
}

//     let fullResponse = "";
//     for await (const chunk of completion) {
//       const content = chunk.choices[0]?.delta?.content || "";
//       process.stdout.write(content); // Stream to console
//       fullResponse += content; // Collect for return
//     }

//     return fullResponse;
//   } catch (error) {
//     console.error("Error in Execution Agent:", error);
//   }
// }

(async () => {
  plans = await runPlanner();
  plansarray = plans.split(",");
  const userAgent = randomUseragent.getRandom();
  const stepsRequired = plansarray[0];
  // console.log("Total Steps: " + stepsRequired + "\n\n -------------- \n");
  const storage = fs.readFileSync("session.json", "utf-8");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: userAgent,
    viewport: {
      width: Math.floor(Math.random() * (1920 - 800 + 1)) + 800,
      height: Math.floor(Math.random() * (1080 - 600 + 1)) + 600,
    },
    locale: "en-US",
    timezoneId: "America/Los_Angeles",
    storageState: JSON.parse(storage),
  });
  const page = await context.newPage();

  for (let i = 0; i < plansarray.length - 1; i++) {
    /* const websiteHTMLRaw = await page.content();
    const dom = new JSDOM(websiteHTMLRaw);
    const document = dom.window.document;
    const tagsToRemove = ["head", "script", "style", "meta", "link"];
    tagsToRemove.forEach((tag) => {
      document.querySelectorAll(tag).forEach((element) => element.remove());
    });

    const websiteHTML = document.body.innerHTML
      .replace(/>\s+</g, ">\n<")
      .trim();
    */
    await page.waitForLoadState("load");
    const html = await page.evaluate(() => {
      const elements = Array.from(document.body.querySelectorAll("*"));

      elements.forEach((i) => {
        const style = window.getComputedStyle(i);
        if (
          (style.display === "none" ||
            style.visibility === "hidden" ||
            style.opacity === "0") &&
          i.tagName.toLowerCase() !== "input"
        ) {
          i.remove();
        }
      });

      return document.body.innerHTML
        .replace(/\n\s*/g, "")
        .replace(/>\s+</g, "><")
        .trim();
    });
    const executionAgentPrompt = `
Instruction: ${plansarray[i + 1]}
Website HTML: ${html}
    `;
    console.log(executionAgentPrompt);
    // console.log("\n" + executionAgentPrompt + "\n");
    const codeUnfiltered = await runExecutionAgent(executionAgentPrompt);
    const codeToExecute = codeUnfiltered.replace(
      /```javascript\s([\s\S]*?)\s*```/g,
      "$1"
    );
    console.log("\n" + codeToExecute + "\n");
    await eval(`${codeToExecute}`);
    const storage = await context.storageState();
    fs.writeFileSync("session.json", JSON.stringify(storage));

    if (i === stepsRequired) {
      console.log("Done! Browser session saved.");
      break;
    }
  }
})();
