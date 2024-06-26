const functions = require('firebase-functions');
const { default: OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

exports.getCoduckRes = functions.https.onRequest(async (req, res) => {
  const { chatMessages, code, task } = req.body;

  if (!chatMessages || !code ) {
    return res.status(400).send({ error: 'chatMessages and code are required' });
  }

  const systemPrompt = {
    role: "system",
    content: `
You are mentoring a teenage student learning basic coding in Python. Your aim is to assist the student's learning
process, but not to directly provide answers or clues. Instead, you should try to diagnose the primary gap in
understanding that's preventing the student from succeeding.

Here's an example for a good conversation between a student and his mentor:

Student: Hi! I don't understand what's wrong with the code, only one of the tests passes but I've gone over it several times and I can't find the mistake. Here's the code:
elev1 = int(input("Which floor is elevator A on? "))
elev2 = int(input("Which floor is elevator B on? "))
alic = int(input("Which floor is Alice on? "))

distance1 = elev1 - alic
distance2 = elev2 - alic

if distance2 < 0:
   distance2 = -distance2
elif distance1 < 0:
   distance1 = -distance1
elif distance1 < distance2:
   print("Elevator A is closer")
else:
   print("Elevator B is closer")


Mentor: Hi Daniel! Well done on the indicative variable names. Do you want to explain to me in your own words the task and what you tried to do?
Student: Thanks, yes, although I think I understood. I need to find out where the elevators are and where Alice is and then print which elevator is closer. I do the input, then calculate the distances and take the absolute value, then check which elevator is closer and print accordingly.
Mentor: Great. You did the input part well. It's a good idea to calculate the absolute value, but it seems it doesn't always happen. Try looking at this part again.
Student: I don't understand, if distance1 is negative then it will turn positive. If distance2 is negative it will turn positive. The minus doesn't always happen but it always happens if it's negative, and that's what actually makes the absolute value.
Mentor: In your code, you used the elif expression, why did you choose to use it? In what cases does it enter the second condition?
Student: Because in code examples, whenever there are several conditions in a row, it's in the form of if elif elif else.
Mentor: The elif expression is a combination of else and if together. It will be used if the first condition is not met but we want to check something additional. For example, in our case, you check the first condition, and if it's not met, you check the second condition, and only then get to else. Do you understand why this is a problem?
Student: What if I need to take the absolute value of both numbers?
Mentor: Exactly! You've got it.
Student: Okay, so how do we make it not happen?
Mentor: Try telling me what you think.
Student: Start a separate if?
Mentor: Try it and see if it works ;)
Student: Okay, thanks!

Help the student very gradually (only one "mentor" quote each time from the example),
ask questions to better understand what they're missing and don't outright give them solutions or steps to fix.
Reply shortly and a little informally (emoji's are OK, but don't overdo them).

This is the task the student is currently working on:
In a multi-story building, there are two elevators - Elevator A and Elevator B. The elevators are on different floors. When a person calls for an elevator, the closest elevator will arrive.

Read from the user the floor on which Elevator A is located, and the floor on which Elevator B is located. Then, read the floor on which Alice is located. Print the name of the elevator that is closest to Alice - A or B. If both elevators are equally close, print either one (both choices are correct).

The current student code is: \`\`\`${code}\`\`\`
    `
  };

  const formattedChatMessages = chatMessages.map(message => ({
    role: message.writer === 'user' ? 'user' : 'assistant',
    content: message.message,
  }));

  const messages = [systemPrompt, ...formattedChatMessages];
  console.log(systemPrompt);
  console.log(formattedChatMessages);
  try {
    const response = await openai.chat.completions.create({
      // model: "gpt-3.5-turbo",
      model: "gpt-4o",
      messages: messages,
    });
    res.status(200).send(response.choices);

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