# About 
I took my UBC CPSC 210 term project, and vibe coded a project out of it, solely out of curiosity. The original project is a productivity app, tailored to the niche hobby of speedcubing, with features similar to csTimer (https://cstimer.net/2015.12.12/) 

## Notes
- The model and persistence packages are taken directly from my term project.
- The rest was created using AI-assisted development. Tech stack includes Spring Boot for the backend and React with Vite for the frontend. As of this commit, I am currently learning React with Vite.
- In the original term project, the custom practice schedule feature used math to divide the total time available by the number of skills to work on, then distributed those times across each day of the week. I found that this was quite a crude method, and decided that for this project, I would replace it with an API call to Gemini. As a result, the practice times are more structured and include variation (Meaning that you cycle through your areas of improvement rather than only working one skill for a few days, then moving on to the next)

## Setup Instructions 
This app has not yet been deployed. To run locally, download the repository, and then:
- Start the backend by inputting these commands into a bash terminal: "cd backend", "./mvnw sprint-boot:run"
- Start the frontend with: "cd frontend", "npm install", "npm run dev"
- This project requires a Gemini API key. Create a .env file and add:
"GEMINI_API_KEY=your_api_key_here"
To get one for free, you can use Google AI studio. 

# Demos in Order
As this app has not been deployed yet, here are some videos that demonstate the app in action (Locally hosted). Note that the second and fourth videos has their speed doubled. 

https://github.com/user-attachments/assets/6d35d29e-f3df-4e69-8ad3-51583914de16


https://github.com/user-attachments/assets/e4b9ccd6-4dd6-4e10-9237-d0893066f33b


https://github.com/user-attachments/assets/1f5cb38c-2b03-420b-9a26-987c7b206fc9


https://github.com/user-attachments/assets/73d6cc00-773b-47ff-bd66-4e1776f4c219



