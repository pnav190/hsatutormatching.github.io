# HSA Tutoring - Tutor Matching Application

A dynamic tutor matching application that helps students find the perfect tutor based on their academic needs, standardized test preparation, or college counseling requirements.

## Features

- **College Counseling**: Match tutors based on your interests and activities
- **SAT/ACT Preparation**: Find tutors with specific test scores and experience
- **General Academics**: Get matched with tutors for specific subjects and courses
- **Real-time Updates**: Automatically syncs tutor data from Google Sheets
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tutor-match
   ```

2. **Open the application**
   - Simply open `Dynamic.html` in your web browser
   - Or serve it using a local server:
     ```bash
     python -m http.server 8000
     # Then visit http://localhost:8000/Dynamic.html
     ```

## Google Sheets Integration

The application automatically syncs tutor data from Google Sheets, ensuring your tutor information is always up-to-date.

### Setup Instructions

1. **Follow the setup guide**: See [setup-google-sheets.md](setup-google-sheets.md) for detailed instructions
2. **Configure your environment**: Copy `env.example` to `.env` and fill in your Google Sheets details
3. **Run the sync**: `npm run sync` to manually sync data

### Automated Sync

Set up automated synchronization to keep your data fresh:

- **GitHub Actions** (Recommended): See the setup guide for GitHub Actions workflow
- **Cron Job**: Run `npm run sync` on a schedule
- **Manual**: Run `npm run sync` whenever you need to update

## Project Structure

```
tutor-match/
├── Dynamic.html          # Main application file
├── sync.js              # Google Sheets sync script
├── package.json          # Node.js dependencies
├── env.example          # Environment variables template
├── setup-google-sheets.md # Setup guide
└── README.md            # This file
```

## How It Works

### Tutor Matching Algorithm

The application uses a sophisticated matching algorithm that considers:

1. **Subject Expertise**: Matches tutors based on the subjects they teach
2. **Test Scores**: For SAT/ACT prep, matches tutors with relevant test experience
3. **Academic Background**: For college counseling, matches based on majors and interests
4. **Course Abbreviations**: Automatically expands common course abbreviations (APUSH → AP U.S. History)

### Data Flow

1. **Google Sheets** → Contains all tutor information
2. **Sync Script** → Fetches data and updates the HTML file
3. **Web Application** → Serves the updated tutor data to users

## Customization

### Adding New Tutors

1. Add tutor information to your Google Sheet
2. Run the sync script: `npm run sync`
3. The changes will automatically appear in the application

### Modifying the Matching Algorithm

The matching logic is in the JavaScript section of `Dynamic.html`. Key functions:

- `matchTutors()`: Main matching function
- `findTutorsByPackages()`: Package-based matching for academics
- `findTutorsBySubjects()`: Subject-based fallback matching

### Styling

The application uses CSS custom properties for easy theming. Modify the `:root` section in the CSS to change colors, fonts, and spacing.

## Troubleshooting

### Common Issues

1. **"No matching tutors found"**
   - Try broadening your search terms
   - Check that tutors have the relevant subjects listed

2. **Sync errors**
   - Verify your Google Sheets setup (see setup guide)
   - Check your environment variables
   - Ensure the service account has proper permissions

3. **Display issues**
   - Clear your browser cache
   - Check browser console for JavaScript errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the setup guide
3. Open an issue on GitHub 