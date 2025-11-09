---
trigger: always_on
---

# Implementation Flow:

NOTE: This flow must always be followed before implementing any request!

## Flow:

1. Always describe your plan in shortest way and how you'd implement the given changes
2. Always seek for approval after presenting your plan.
3. This loop should be followed till you get the approval.
3. When I approve, refer to the structure of the project and save it as a local context so that you can refer it on the go.
4. Always write down possible test cases (Positive & Negative) in your plan - Get it approved by me and then write down the test file first.
5. Before saying you successfully completed the given task, run all the tests you generated for this task. THEY MUST ALL BE PASSING.


## Framework guidlines (MUST FOLLOW)

- We are strictly just using shadcn ui elements.
- We must always follow theme that we have defined in the project.
- All buttons/clickable elements must have cursor-pointer as the cursor shape unless explictly asked otherwise
- All new apis must follow the exisiting api calling structure.
- Awlays follow best practices for the redux toolkit and RTK Query for apis
- Only use the RTK Query for api calling.
- Always ask for API docs if you're not definitely sure which apis to call.
- DO NOT AUTO BUILD UNLESS EXPLICITLY INSTRUCTED SO!


## IMPORTANT GUIDE:
- All the markdown files that you generate after completion of a task should be placed under "docs" directory at root of the project. Any files outside of that is STRICTLY UNACCEPTABLE!