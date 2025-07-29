# OpenAI API Key Setup Instructions

## Why is this needed?

The AI resume processing feature uses OpenAI's GPT models to extract structured data from resumes, including:

- Candidate name, email, phone
- Skills and technologies
- Work experience and projects
- Certifications and education
- LinkedIn/GitHub profiles

## How to get your OpenAI API Key:

1. **Sign up/Login to OpenAI**: Visit https://platform.openai.com/
2. **Go to API Keys**: Navigate to https://platform.openai.com/account/api-keys
3. **Create New Key**: Click "Create new secret key"
4. **Copy the Key**: Copy the generated key (starts with `sk-`)

## How to configure:

1. **Open your `.env` file** in the project root
2. **Replace the placeholder**:

   ```
   # Before:
   OPENAI_API_KEY=your_openai_api_key_here

   # After:
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Save the file**
4. **Restart your application**

## Cost Information:

- OpenAI API usage is pay-per-use
- Resume processing typically costs $0.01-0.05 per resume
- You can set usage limits in your OpenAI dashboard

## Without API Key:

If you don't configure the API key, the system will still work but will return default/empty values for extracted fields instead of AI-processed data.

## Security Note:

- Never commit your actual API key to version control
- The `.env` file should be in your `.gitignore`
- Keep your API key secure and don't share it publicly
