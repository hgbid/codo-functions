const functions = require('firebase-functions');
const { default: OpenAI } = require('openai');
const dotenv = require('dotenv');
// const { translate } = require('@vitalets/google-translate-api');

async function translate(text, langs) {
    const openai_res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
            role: "system",
            content: `
You need to translate the message from ${langs.from} to ${langs.to}. It's part of a mentor-student conversation
on a Python coding assignment, so don't translate from English Python keywords or strings that seem part of the
assigment. Reply with the translation only, or with the original text if no translation is necessary.
Use relatively informal language.
`,
        },
        {
            role: "user",
            content: text
        }
      ],
    });

    return {text: openai_res.choices[0].message.content};
}

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

exports.getCoduckRes = functions.https.onRequest(async (req, res) => {
  const { chatMessages, code, task } = req.body;

  const systemPrompt = {
    role: "system",
    content: `
You are mentoring a 16-year-old student who is struggling with a Python programming task.
Your mission is to guide the student without giving him the answer. Be short and let the conversation flow as if you were a human guide in a classroom. Find and focus on the first thing wrong with the student's code.
Don't give the solution, ask guiding questions and provide hints to the solution. Try to identify the primary gap in the student's understanding.
Be nice as if you were the student's friend.
If your answer refers to a specific section of the code, you may highlight one or more lines, the very first line of your answer should be "{{ number }}" or "{{ from-to }}" or nothing if you are not referring to any lines, and after that, the rest of the answer is regarding these lines.

Here are a few examples for good conversations between a student and his mentor:

Example 1:

Student: Hi! I don't understand what's wrong with the code, only one of the tests passes but I've gone over it several times and I can't find the mistake. Here's the code:
\`\`\`
1 elev1 = int(input("Which floor is elevator A on? "))
2 elev2 = int(input("Which floor is elevator B on? "))
3 alic = int(input("Which floor is Alice on? "))
4
5 distance1 = elev1 - alic
6 distance2 = elev2 - alic
7 if distance2 < 0:
8    distance2 = -distance2
9 elif distance1 < 0:
10    distance1 = -distance1
11 elif distance1 < distance2:
12    print("Elevator A is closer")
13 else:
14    print("Elevator B is closer")
\`\`\`


Mentor: Hi Daniel! Well done on the indicative variable names. Do you want to explain to me in your own words the task and what you tried to do?
Student: Thanks, yes, although I think I understood. I need to find out where the elevators are and where Alice is and then print which elevator is closer. I do the input, then calculate the distances and take the absolute value, then check which elevator is closer and print accordingly.
Mentor: Great. {{ 7-10 }} You did the input part well. It's a good idea to calculate the absolute value, but it seems it doesn't always happen. Try looking at this part again.
Student: I don't understand, if distance1 is negative then it will turn positive. If distance2 is negative it will turn positive. The minus doesn't always happen but it always happens if it's negative, and that's what actually makes the absolute value.
Mentor: {{ 9 }} In your code, you used the elif expression, why did you choose to use it? In what cases does it enter the second condition?
Student: Because in code examples, whenever there are several conditions in a row, it's in the form of if elif elif else.
Mentor: The elif expression is a combination of else and if together. It will be used if the first condition is not met but we want to check something additional. For example, in our case, you check the first condition, and if it's not met, you check the second condition, and only then get to else. Do you understand why this is a problem?
Student: What if I need to take the absolute value of both numbers?
Mentor: Exactly! You've got it.
Student: Okay, so how do we make it not happen?
Mentor: Try telling me what you think.
Student: Start a separate if?
Mentor: Try it and see if it works ;)
Student: Okay, thanks!

Example 2:

Student: Hi, can I get some help? This is my current code: \`\`\`
1 def return_the_other:
2     number = int(input("enter num"))
3     if number == 5:
4         return 7
5     else:
6         return 5
\`\`\`
Mentor: Talk to me.
Student: The code isn't working, haha.
Mentor: Did you try running it? Can you explain what isn't working?
Student: There's a syntax error on line 2, but it looks fine to me.

Traceback (most recent call last):
mod = compile(source, filename, mode, flags | ast.PyCF_ONLY_AST)
File "<exec>", line 2
async def return_the_other:
^
SyntaxError: invalid syntax

Mentor: {{ 1 }} Good that you read the error message. Notice that it points to where the problem is, and it's actually on line 1. The issue is with the function definition. Do you remember the syntax?
Student: Yeah, I forgot the parentheses. I think there's a system issue because the code doesn't throw an error, but in the tests, there is an error.
This is my current code:
\`\`\`
1 def return_the_other():
2     number = int(input("enter num"))
3    if number == 5:
4         return 7
5     else:
6         return 5
\`\`\`
Mentor: Sometimes there's a system error, but this time it looks like there's still a gap between what you did and what the task asks for. What error are you getting in the tests?
Student: Ugh, I'm so tired.
Mentor: Yes, learning to program is a long process, but you're doing really well! Just a little more and we're done.
Student: It's really hard.
Mentor: It requires patience, but you've got this.
Student: Okay, can you give me a hint?
Mentor: {{ 1-2 }} Yes 🙂 In the task, you need to receive the number as a parameter of the function, not as input from the user. Note that there's a difference between what the user receives and what we use in the code as programmers. Here, you need to receive the number as a parameter, but print it for the user.
Student: Can you summarize for me…
Mentor: Let's break it into two. Did you understand the part about receiving it as a parameter?
Student: I don't remember the syntax.
Mentor: To receive a parameter in a function, we define it inside the parentheses, like this:

\`\`\`
def func(parameter):
    …
\`\`\`
Student:

Here: This is my current code:
\`\`\`
1 def return_the_other(parameter):
2     if parameter == 5:
3         return 7
4     else:
5         return 5
\`\`\`
Mentor: Great. Notice that you can call it whatever you like, but this works too. Now, instead of returning, you need to print.
Student: Okay.
This is my current code:
\`\`\`
1 def return_the_other(parameter):
2     if parameter == 5:
3         print(7)
4     else:
5         print(5)
\`\`\`

End of examples.

Help the student very gradually (only one "mentor" quote each time from the example),
ask questions to better understand what they're missing and don't outright give them solutions or steps to fix.
Reply shortly and a little informally (emoji's are OK, but don't overdo them).
Don't forget to indicate line numbers AT THE BEGINNING if you are referring to a specific section of the code.
Don't directly provide solutions, even if asked for, even if the student is taking a while to understand. Be patient.

This is the task the student is currently working on:
${task}
    `
  };

  let userEnMessage = '';
  const formattedChatMessages = await Promise.all(chatMessages.map(async (message, index) => {
    if (message.role === 'user' && (message.enMessage !== undefined || message.enMessage.length == 0)) {
      const translatedMessage = await translate(message.hebMessage, { from: 'Hebrew', to: 'English' });
      message.enMessage = translatedMessage.text;
      userEnMessage = translatedMessage.text;
    }
    const res = {
      role: message.role,
      // content: message.role === 'user' ? message.enMessage : message.hebMessage,
      content: message.enMessage,
    };

    if (message.code !== null && message.code !== undefined) {
        res.content += `\n\nThis is my current code:\n\`\`\`${message.code}\`\`\``
    }

    return res;
  }));

  const messages = [systemPrompt, ...formattedChatMessages];

  console.log(messages);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
    });

    const openaiResponse = response.choices[0].message.content;
    var responseToTranslate = openaiResponse;

    var lines = null;
    const match = openaiResponse.match(/{{\s*(\d+)(-(\d+))?\s*}}/);
    if (match !== null) {
        lines = [parseInt(match[1])];
        if (match[3] !== undefined) {
            lines.push(parseInt(match[3]));
        };

        responseToTranslate = responseToTranslate.replace(/{{.*}}\s*/, '');
    }

    const translatedResponse = await translate(responseToTranslate, { from: 'English', to: 'Hebrew' });

    res.status(200).send({
      userEnMessage: userEnMessage,
      hebMessage: translatedResponse.text,
      enMessage: openaiResponse,
      lines: lines,
    });

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).send({ error: 'Error calling OpenAI API' });
  }
});

const mokedRes = {
  "id": "chatcmpl-9cXZt6H8jqO7TH4MWeEplQZegkXyJ",
  "object": "chat.completion",
  "created": 1718972565,
  "model": "gpt-3.5-turbo-0125",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "ישנם מספר אפשרויות להשקעה, תלוי במטרות הפיננסיות שלך, היכולת לקחת סיכונים והזמן שיש לך להשקיע. כאחד הדברים שמומלץ לשקול הוא לבנות קונפורט פיננסי, שיכלול איכות גבוהה של השקעות לפי רמת הסיכון שנרצה לקחת ולהעלות - צעדי פעולה בהתאם."
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 30,
    "completion_tokens": 227,
    "total_tokens": 257
  },
  "system_fingerprint": null
};