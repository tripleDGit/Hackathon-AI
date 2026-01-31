# 🧮 Math Quiz Game

A modern, interactive math quiz game built with React, TypeScript, and Vite. The game generates math questions using AI (OpenAI API) or falls back to local generation if API is unavailable.

## 🎯 Features

- **Multiple Difficulty Levels**: Easy, Medium, and Hard
- **Customizable Quiz Settings**: Choose number of questions and time limits
- **AI-Powered Questions**: Integrates with OpenAI API for dynamic question generation
- **Offline Fallback**: Local question generation when API is unavailable
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **Real-time Scoring**: Track your progress and get instant feedback
- **Detailed Results**: Review your performance with comprehensive statistics

## 📁 Project Structure

```
/home/michael/Hackathon-AI/
├── src/
│   ├── components/          # React components
│   │   ├── StartMenu.tsx    # Game start menu with settings
│   │   ├── QuestionDisplay.tsx  # Question display and answer selection
│   │   └── ResultsScreen.tsx    # Results and statistics
│   ├── hooks/               # Custom React hooks
│   │   └── useGameState.ts  # Game state management hook
│   ├── services/            # API and business logic
│   │   └── mathApi.service.ts   # Math question generation
│   ├── types/               # TypeScript type definitions
│   │   └── game.types.ts    # Game-related interfaces and enums
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── .env.example             # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- OpenAI API key (optional - app works without it)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   VITE_API_KEY=your_openai_api_key_here
   VITE_API_BASE_URL=https://api.openai.com/v1
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎮 How to Play

1. **Select Difficulty**: Choose between Easy, Medium, or Hard
2. **Set Questions**: Choose how many questions you want (5-20)
3. **Set Time Limit**: Choose your time limit (1-10 minutes)
4. **Start Game**: Click "Start Game" to begin
5. **Answer Questions**: Select your answer and submit
6. **View Results**: See your score and review your answers

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

### Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **OpenAI API** - AI-powered question generation

## 🔧 Configuration

### Difficulty Levels

- **Easy**: Single-digit addition and subtraction
- **Medium**: Multiplication, division, and multi-digit arithmetic
- **Hard**: Complex problems with fractions, decimals, and multi-step operations

### API Integration

The app uses OpenAI's GPT-3.5 to generate questions. If the API is unavailable or not configured, it automatically falls back to local question generation.

To use a different API, modify [src/services/mathApi.service.ts](src/services/mathApi.service.ts).

## 📝 Key Components

### `StartMenu.tsx`
- Main menu interface
- Game configuration options
- Difficulty selection

### `QuestionDisplay.tsx`
- Question presentation
- Answer selection
- Progress tracking
- Timer display

### `ResultsScreen.tsx`
- Score display
- Performance statistics
- Question review
- Restart options

### `useGameState.ts`
- Centralized game state management
- Question loading
- Answer submission
- Results calculation

### `mathApi.service.ts`
- OpenAI API integration
- Local question generation fallback
- Dynamic question creation based on difficulty

## 🎨 Customization

### Colors
Modify [tailwind.config.js](tailwind.config.js) to change the color scheme.

### Question Generation
Customize question types in [src/services/mathApi.service.ts](src/services/mathApi.service.ts).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning and development.