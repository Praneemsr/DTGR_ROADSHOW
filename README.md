# Microsoft Event Page - Implementation

This project recreates a Microsoft-style event registration page based on the structure analysis document.

## File Structure

```
/project-root
├── index.html          # Main HTML file with event page structure
├── css/
│   └── styles.css      # All styling including layout, typography, and responsive design
├── js/
│   └── scripts.js    # Form handling and submission logic
├── images/
│   └── event-banner.jpg  # Background banner image for event hero section (placeholder needed)
└── README.md          # This file
```

## Image Assets Required

The page expects the following image in the `images/` directory:

- **event-banner.jpg**: A background banner image for the event hero section. This should be a high-quality image (recommended: 1920x600px or larger) that will be used as the background for the event information and registration form section.

### Adding Your Image

1. Place your banner image in the `images/` folder
2. Name it `event-banner.jpg` (or update the CSS file `css/styles.css` line 3 to match your filename)
3. The image will automatically be used as the background for the event hero section

If you don't have an image yet, the page will still work but the background will not display. You can use any image editing tool or find a suitable stock image for your event.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Form Validation**: Client-side validation for all required fields
- **Modern UI**: Clean, Microsoft-style design with Fluent UI principles
- **Accessibility**: Proper labels, form structure, and keyboard navigation support

## Customization

### Changing Event Details

Edit `index.html` to update:
- Event title
- Date and time
- Location
- Description
- Timezone information

### Changing Colors

Edit `css/styles.css` to customize:
- Primary button color (currently Microsoft blue #0078D4)
- Background colors
- Text colors
- Border colors

### Connecting to Backend API

To connect the form to your actual backend:

1. Open `js/scripts.js`
2. Find the commented section around line 50-60
3. Uncomment the fetch API call
4. Replace `'https://your-api-endpoint.com/api/events/register'` with your actual API endpoint
5. Adjust the request body structure if needed to match your API requirements

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Usage

1. Open `index.html` in a web browser
2. Fill out the registration form
3. Submit to test the form validation and submission flow

## Notes

- The form currently shows a success message on submission (demo mode)
- To actually save registrations, you'll need to connect it to a backend API
- All form fields match the expected structure from the analysis document
- The page includes a simplified Microsoft-style header and footer for branding consistency

