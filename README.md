# EuroTopo Quiz 🌍

An interactive European capitals quiz application built with Next.js, designed to help students learn European geography with visual map-based learning.

## Features ✨

- **Interactive Map**: Accurately positioned capital markers on a detailed Europe map
- **Bilingual Support**: Switch between English 🇬🇧 and Dutch 🇳🇱
- **Visual Learning**: Color-coded difficulty system (Easy/Medium/Hard)
- **Real-time Feedback**: Immediate answer validation with educational info
- **Progress Tracking**: Score and accuracy percentage
- **Mobile Responsive**: Works on all devices
- **Curriculum Focused**: Customized for specific educational requirements

## Technology Stack 🚀

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Build Tool**: Turbopack (fastest bundler)
- **Deployment**: Vercel-optimized
- **Data**: Precisely calibrated coordinate mapping (24 calibration points, 0px accuracy)

## Live Demo 🌐

[Visit EuroTopo Quiz](https://your-app-url.vercel.app) *(URL will be provided after deployment)*

## Quick Start 🏃‍♂️

```bash
# Clone the repository
git clone https://github.com/yourusername/eurotopo-quiz.git

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Educational Content 📚

The quiz includes **40 European capitals** specifically selected for curriculum requirements:
- Major EU capitals: Berlin, Paris, Rome, Madrid, etc.
- Nordic capitals: Stockholm, Oslo, Helsinki, Copenhagen
- Eastern Europe: Warsaw, Prague, Budapest, Kiev
- Balkan region: Belgrade, Zagreb, Ljubljana, Sarajevo
- And many more!

## Language Support 🌐

**English Mode**: "What is the capital of Germany?" → "Berlin"
**Dutch Mode**: "Wat is de hoofdstad van Duitsland?" → "Berlijn"

Both question text and answers are accepted in both languages.

## Development 👨‍💻

### Project Structure
```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── utils/              # Translation system
public/
├── quizCapitals.json   # Quiz data (filtered)
├── map.png             # Europe map image
```

### Key Components
- `MapQuiz.tsx`: Main interactive quiz component
- `translations.ts`: Bilingual translation system
- Coordinate transformation algorithm for precise positioning

## Deployment 🚀

This project is optimized for **Vercel deployment**:
- Automatic builds from Git
- Edge function optimization
- Global CDN distribution
- Perfect for educational use

## License 📄

Created for educational purposes. Map data calibrated manually for accuracy.

---

**Built with ❤️ for geography education**
# Trigger Vercel deployment
