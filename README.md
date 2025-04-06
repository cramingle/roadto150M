# RoadTo150M Booking Schedule

A modern, responsive web application for scheduling meetings and appointments, designed to work seamlessly with Telegram Mini Apps. Built for the RoadTo150M project.

## Features

- 📆 Interactive calendar for date selection
- ⏰ Time slot selection
- 📝 User-friendly booking form
- 📱 Telegram Web App integration
- 🔄 API integration for real-time availability

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://your-repository-url/booking-webapp.git
cd booking-webapp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your API URL:
```
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
booking-webapp/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   ├── booking/              # Booking flow
│   │   └── confirmation/         # Confirmation page
│   ├── components/               # Reusable components
│   │   ├── layout/               # Layout components
│   │   └── booking/              # Booking-specific components
│   ├── lib/                      # Utility functions
│   └── hooks/                    # Custom React hooks
├── public/                       # Static assets
├── .env.local                    # Environment variables
└── package.json                  # Project dependencies
```

## Integration with Telegram

This web app is designed to be integrated with Telegram as a Mini App. To test it with Telegram:

1. Create a bot using [BotFather](https://t.me/botfather)
2. Set up your bot to launch this web app
3. Configure the `webapp_url` in your bot's settings

## API Requirements

The backend API should provide the following endpoints:

- `/validate-token` - Validates a booking token
- `/available-dates` - Returns available dates for booking
- `/time-slots` - Returns available time slots for a specific date
- `/create-booking` - Creates a new booking

## Deployment

This app can be deployed to Vercel, Netlify, or any other hosting platform that supports Next.js.

```bash
# Build for production
npm run build
# or
yarn build
```

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [date-fns](https://date-fns.org/) - Date utility library
- [Axios](https://axios-http.com/) - HTTP client
- [React Calendar](https://www.npmjs.com/package/react-calendar) - Calendar component

## License

This project is licensed under the MIT License - see the LICENSE file for details.
