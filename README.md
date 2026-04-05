# Passport Photo Suite

A modern web application for creating professional passport photos with ease. Generate multiple passport-sized photos on A4 sheets ready for printing or PDF download.

## Features

### Single Photo Mode
- Upload one photo and create multiple copies
- Automatic layout optimization (e.g., 8 photos = 5 + 3 layout)
- Professional passport photo standards (35mm × 45mm)
- Adjustable cropping and positioning
- Name/date overlay support
- Border options

### Multi Photo Mode
- Upload up to 6 different photos
- Each photo fills one row on the A4 sheet
- Individual photo adjustments per row
- Batch processing for multiple people

### Layout & Printing
- A4 paper format (210mm × 297mm)
- Configurable photos per row (2-5)
- High-resolution output (200 DPI)
- Print-ready PDF generation
- Direct browser printing support

## Technologies Used

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Radix UI components
- **Image Processing**: HTML5 Canvas
- **PDF Generation**: jsPDF
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sahil-Badkul/mypassportpic-sahil371.git
cd mypassportpic-sahil371
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

## Usage

### Single Photo Mode
1. Click "Single Photo Mode" on the home page
2. Upload your photo (drag & drop or click to browse)
3. Adjust cropping and positioning in the "Adjust" step
4. Set the number of photos (1-30) in the "Layout" step
5. Preview the A4 layout
6. Print directly or download as PDF

### Multi Photo Mode
1. Click "Multi Photo Mode" on the home page
2. Upload up to 6 different photos
3. Adjust each photo individually
4. Set photos per row (2-5)
5. Preview and download/print

## Photo Requirements

- **Format**: JPG, PNG, WEBP
- **Size**: Minimum 1000px on the longest side recommended
- **Aspect Ratio**: Will be cropped to passport standards
- **Resolution**: High resolution for best print quality

## Print Settings

- Use A4 paper
- Print at 100% scale
- High quality/color settings
- Borderless printing recommended

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions, please open an issue on GitHub or contact the maintainer.