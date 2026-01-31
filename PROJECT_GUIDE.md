# Math Quiz Game - Project Overview

## 🎯 What You've Got

A complete React TypeScript application for a math quiz game with:
- **Clean Architecture**: Organized folder structure
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Tailwind CSS with responsive design
- **API Integration**: OpenAI API with local fallback
- **State Management**: Custom React hooks

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      USER INTERFACE                      │
├─────────────────────────────────────────────────────────┤
│  StartMenu.tsx  →  QuestionDisplay.tsx  →  Results.tsx  │
│       ↓                    ↓                    ↓        │
│                   useGameState Hook                      │
│                          ↓                               │
│                 mathApi.service.ts                       │
│                   ↙             ↘                        │
│         OpenAI API          Local Generator              │
└─────────────────────────────────────────────────────────┘
```

## 📦 Core Components

### 1. **Types** (`src/types/game.types.ts`)
- `GameState`: Menu, Playing, Results
- `Difficulty`: Easy, Medium, Hard
- `MathQuestion`: Question structure
- `GameConfig`: Game settings
- `GameResults`: Score and statistics

### 2. **Services** (`src/services/mathApi.service.ts`)
- `generateMathQuestions()`: Main API function
- `generateLocalQuestions()`: Fallback generator
- Automatic retry and error handling

### 3. **Hooks** (`src/hooks/useGameState.ts`)
- `useGameState()`: Central game state manager
- Methods:
  - `startGame()`: Initialize game with config
  - `submitAnswer()`: Process user answer
  - `resetGame()`: Return to menu
  - `getResults()`: Calculate final score

### 4. **Components**

#### `StartMenu.tsx`
- Difficulty selector (Easy/Medium/Hard)
- Question count slider (5-20)
- Time limit selector (1-10 min)
- Start game button with loading state

#### `QuestionDisplay.tsx`
- Question text display
- Multiple choice options (4 buttons)
- Progress bar
- Timer
- Submit button

#### `ResultsScreen.tsx`
- Score percentage with circular progress
- Correct/Wrong/Time statistics
- Question-by-question review
- Play again button

## 🎮 Game Flow

```
1. Menu Screen
   ↓ (User selects settings)
2. API Call / Generate Questions
   ↓ (Questions loaded)
3. Show Question 1
   ↓ (User answers)
4. Show Question 2
   ↓ (User answers)
   ... (repeat)
   ↓ (All answered)
5. Results Screen
   ↓ (User clicks restart)
6. Back to Menu
```

## 🔧 Configuration Points

### Environment Variables
```env
VITE_API_KEY=your_api_key        # OpenAI API key
VITE_API_BASE_URL=api_url        # API endpoint
```

### Customizable Settings
- **Difficulty algorithms** in `mathApi.service.ts`
- **Color scheme** in `tailwind.config.js`
- **Time limits** in `StartMenu.tsx`
- **Score calculation** in `useGameState.ts`

## 🚀 Next Steps / Extensions

### Easy Additions:
1. **Sound Effects**: Add audio feedback for correct/wrong answers
2. **Leaderboard**: Store high scores in localStorage
3. **More Operations**: Add square roots, percentages, etc.
4. **Hints System**: Give users hints for hard questions
5. **Achievements**: Unlock badges for milestones

### Medium Additions:
1. **User Profiles**: Save progress per user
2. **Practice Mode**: No time limits, show explanations
3. **Multiplayer**: Race mode with friends
4. **Categories**: Geometry, Algebra, etc.
5. **Progressive Difficulty**: Adapt based on performance

### Advanced Additions:
1. **Backend Integration**: Save scores to database
2. **Social Features**: Share results on social media
3. **Analytics Dashboard**: Track learning progress
4. **Mobile App**: React Native version
5. **AI Tutoring**: Explain wrong answers

## 🎨 UI Customization

### Change Primary Color:
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#YOUR_COLOR', // Main color
    600: '#DARKER',     // Hover states
    // ... more shades
  }
}
```

### Modify Animations:
- Progress bars: `QuestionDisplay.tsx` line ~60
- Score circle: `ResultsScreen.tsx` line ~50
- Button hover: All component className props

## 📊 Question Difficulty Settings

### Easy
- Single digit (1-10)
- Addition & subtraction only
- Example: "What is 5 + 3?"

### Medium
- Two digit (1-144)
- Multiplication & division
- Example: "What is 12 × 8?"

### Hard
- Multi-step operations
- Larger numbers (10-30)
- Example: "What is 25 × 12 - 8?"

## 🛠️ Development Tips

### Running in Development:
```bash
npm run dev          # Hot reload enabled
```

### Building for Production:
```bash
npm run build        # Creates optimized build
npm run preview      # Test production build
```

### Common Issues:

**API not working?**
- Check .env file exists
- Verify API key is correct
- App will use local generation automatically

**Styles not loading?**
- Ensure Tailwind is configured
- Check index.css imports Tailwind

**TypeScript errors?**
- Run `npm run lint`
- Check type definitions in `game.types.ts`

## 📚 File Reference

| File | Purpose | Key Exports |
|------|---------|-------------|
| `game.types.ts` | Type definitions | All interfaces |
| `mathApi.service.ts` | Question generation | `generateMathQuestions()` |
| `useGameState.ts` | State management | `useGameState()` hook |
| `StartMenu.tsx` | Menu UI | `StartMenu` component |
| `QuestionDisplay.tsx` | Question UI | `QuestionDisplay` component |
| `ResultsScreen.tsx` | Results UI | `ResultsScreen` component |
| `App.tsx` | Main orchestrator | `App` component |

## 🎓 Learning Resources

- **React Hooks**: Custom hooks pattern in `useGameState.ts`
- **TypeScript**: Strong typing in `game.types.ts`
- **API Integration**: Axios usage in `mathApi.service.ts`
- **State Management**: useState, useCallback patterns
- **CSS Framework**: Tailwind utility classes

---

**Need help?** Check the comments in each file for detailed explanations!