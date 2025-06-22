# Resume Analyzer

A full-stack application that analyzes resumes against job descriptions using AI to provide skill matches, gaps, and improvement suggestions.

## Features

- **AI-Powered Analysis**: Uses Mixtral-8x7B model via OpenRouter API
- **Skill Matching**: Identifies skills that match between resume and job description
- **Gap Analysis**: Highlights missing skills from the job requirements
- **Improvement Suggestions**: Provides actionable recommendations for resume enhancement
- **RESTful API**: Clean API endpoints for easy integration
- **TypeScript**: Full TypeScript support for better development experience

## Tech Stack

### Backend

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **OpenRouter API** for AI model access
- **CORS** enabled for frontend integration

### Frontend

- **React** with **TypeScript**
- **Vite** for fast development and building

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenRouter API key

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd resume-analyzer
```

### 2. Backend Setup

```bash
cd server
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 4. Frontend Setup

```bash
cd ../client
npm install
```

## Running the Application

### Development Mode

#### Backend (with auto-restart)

```bash
cd server
npm run dev:watch
```

#### Frontend

```bash
cd client
npm run dev
```

### Production Mode

#### Backend

```bash
cd server
npm run build
npm start
```

#### Frontend

```bash
cd client
npm run build
```

## API Documentation

### Base URL

```
http://localhost:5000
```

### Endpoints

#### POST /analyze

Analyzes a resume against a job description.

**Request Body:**

```json
{
  "jobDescription": "We are looking for a backend engineer with experience in Node.js, PostgreSQL, and Docker.",
  "resume": "I have worked with Node.js and MongoDB, and used Docker in personal projects."
}
```

**Response:**

```json
{
  "result": "AI analysis including skill matches, gaps, and improvement suggestions"
}
```

**Error Response:**

```json
{
  "error": "jobDescription and resume are required."
}
```

#### GET /

Health check endpoint.

```json
"Resume Analyzer API is running"
```

## Usage Examples

### Using cURL

```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "We are looking for a backend engineer with experience in Node.js, PostgreSQL, and Docker.",
    "resume": "I have worked with Node.js and MongoDB, and used Docker in personal projects."
  }'
```

### Using JavaScript/Fetch

```javascript
const response = await fetch("http://localhost:5000/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    jobDescription: "We are looking for a backend engineer...",
    resume: "I have worked with Node.js...",
  }),
});

const result = await response.json();
console.log(result.result);
```

## Project Structure

```
resume-analyzer/
├── client/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── ...
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── analyzeRoute.ts
│   │   ├── index.ts
│   │   └── openrouterService.ts
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## Environment Variables

| Variable             | Description                      | Required                  |
| -------------------- | -------------------------------- | ------------------------- |
| `PORT`               | Server port number               | No (default: 5000)        |
| `NODE_ENV`           | Environment mode                 | No (default: development) |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI access | Yes                       |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
