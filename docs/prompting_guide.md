# Prompt Engineering Guide: Implementing Content and Readability Constraints

## 1. Overview

This document provides actionable guidelines for refining the AI prompt to control a-d-a p-t content length, structure, and readability. The following instructions are based on the decision to target a more concise and structured output for the weekly user report.

The goal is to implement three specific constraints:
1.  A target character limit of approximately 520 characters.
2.  Clear paragraph breaks for improved readability.
3.  A clarification on implementing optimal line length.

---

## 2. Method 1: Implementing a Character Limit (Target: ~520 Chars)

To control the overall length of the AI's response, we will add a direct and explicit instruction to the prompt.

### Implementation

Add the following rule to the `CRITICAL SAFETY & QUALITY GUIDELINES` section of your prompt.

**Prompt Snippet to Add:**

Conciseness: The total length of all text in the final JSON response should be around 520 characters. The response must be concise yet impactful.


**Important Note:** AI models are excellent at following guidelines, but they are not perfect character counters. This instruction will reliably produce a response that is significantly shorter than the previous ~650 character version and very close to your 520-character target. Treat it as a strong guideline for the model, not a strict, unbreakable rule.

---

## 3. Method 2: Enforcing Paragraph Structure

Forcing the AI to create short, digestible paragraphs is crucial for scannability. The most reliable method is to instruct the AI to use a specific formatting character (`\n\n`) and to demonstrate this in the few-shot example.

### Implementation Steps

**Step 1: Add a Structural Instruction**

In the prompt section that defines the JSON output, add a clear instruction for the `narrative` field.

**Prompt Snippet to Add:**

```javascript
// Inside the JSON structure definition
{
  "narrative": "A summary of the week. Separate distinct ideas into short paragraphs of 2-3 sentences each using '\\n\\n' for line breaks.",
  "achievements": ["Up to 4 specific achievements."],
  "recommendations": ["Up to 3 gentle, actionable recommendations."]
}
Step 2: Update the Few-Shot Example

Modify the EXPECTED OUTPUT EXAMPLE to reflect this new structure. This shows the AI exactly what a correct response looks like.

Before (Original Example):

JSON

"narrative": "What an absolutely phenomenal week! Your performance is truly exceptional, and reaching Level 102 is a remarkable testament to your consistency and hard work."
After (Revised Example with \n\n):

JSON

"narrative": "You have done so wonderfully this week. We want to send our warmest congratulations on reaching Level 102!\n\nYour 365-day exercise streak, in particular, is a priceless achievement. It speaks volumes about your unwavering dedication and strength."
By providing both the instruction and a clear example, the AI will reliably adopt this format for all future generations.

4. Clarification on Line Length (50-75 Characters)
This is a critical point of clarification: Optimal line length is controlled by the app's User Interface (Frontend), not by the AI prompt.

AI's Role: The AI generates a single, continuous string of text (e.g., "Hello world, this is a long sentence."). It has no awareness or control over how this text will be displayed on a screen.

App's (Frontend) Role: The app's code takes this text string and renders it inside a visual container. The width of this container, combined with the font size and screen dimensions, determines how many characters fit on a single line before the text wraps to the next line.

Actionable Advice
This requirement should be communicated to your Frontend Developer or UI/UX Designer.

Instruction for Your Development Team:

"Please adjust the width of the UI text container used for the report's narrative. The styling should ensure that, on a standard mobile device screen, each line of text naturally wraps at approximately 50 to 75 characters."

5. Revised Full Prompt Example (All Changes Implemented)
Here is the complete prompt template incorporating the instructions for character count and paragraph structure.

JavaScript

// ... (Your existing role, context, and data sections) ...

Generate a JSON response with the following structure:
{
  "narrative": "A summary of the week. Separate ideas into short paragraphs of 2-3 sentences each using '\\n\\n' for line breaks.",
  "achievements": ["Up to 4 specific achievements based on the data."],
  "recommendations": ["Up to 3 gentle, actionable, and personalized recommendations."]
}

CRITICAL SAFETY & QUALITY GUIDELINES:
1.  **Safety First**: If a user reports high levels of pain or swelling, your #1 recommendation MUST be to consult a doctor or physical therapist.
2.  **Conciseness**: The total length of all text in the final JSON response should be around **520 characters**. The response must be concise yet impactful.
3.  **Structure**: For the "narrative" field, you must use the '\\n\\n' special characters to create paragraph breaks, as demonstrated in the example.

---

[EXAMPLE]

[USER DATA EXAMPLE]
{
  "Weekly Data Summary": { "exerciseCount": 19, "userLevel": 102 },
  "Detailed Exercises": [ { "name": "365-day streak achieved" } ]
}

[EXPECTED OUTPUT EXAMPLE]
{
  "narrative": "You have done so wonderfully this week. We want to send our warmest congratulations on reaching Level 102!\n\nYour 365-day exercise streak, in particular, is a priceless achievement. It speaks volumes about your unwavering dedication and strength.",
  "achievements": [
    "Completed an incredible 365-day exercise streak!",
    "Finished 19 exercises this week.",
    "Achieved Level 102."
  ],
  "recommendations": [
    "Consistency is your greatest strength. Keep up the amazing work.",
    "Now that you've reached a high level, consider trying a new type of exercise to keep things fresh."
  ]
}

---

[TASK]
Now, analyze the following real user data and generate the JSON response according to all the rules and examples provided.

[USER DATA]
// ... (Inject the real user data here) ...