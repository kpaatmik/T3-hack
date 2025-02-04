# Smart Highway Web Application

An AI-powered smart highway assistance web application that helps users with rest place booking, voice-controlled AI assistant, real-time traffic suggestions, and public transport integration.

## Features

- Rest Place Booking System
- AI-Powered "Read It to Me" Assistant
- Real-Time Traffic & Route Suggestions
- Public Transport & Credit System

## Tech Stack

### Frontend
- React + Vite
- TailwindCSS / ShadCN
- Axios
- Redux Toolkit / Zustand
- Web Speech API

### Backend
- Django Rest Framework
- PostgreSQL
- JWT Authentication
- Django Channels (optional)

### Automation & Integration
- n8n
- Google Assistant SDK

## Setup Instructions

### Backend Setup
1. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Start development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

## API Documentation
[To be added]

## Contributing
[To be added]

## License
[To be added]
