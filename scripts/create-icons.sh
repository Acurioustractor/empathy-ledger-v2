#!/bin/bash

# Icon Creation Script for Empathy Ledger
# This creates SVG-based icons that will work until you upload your actual logo

echo "🎨 Creating Empathy Ledger App Icons..."

# Create public directory if it doesn't exist
mkdir -p public

# Your brand colors
CLAY_COLOR="#96643a"
SAGE_COLOR="#5c6d51"
TERRACOTTA_COLOR="#b84a32"

# Create SVG template for each size
create_icon() {
    local size=$1
    local filename=$2
    local stroke_width=$(echo "$size / 10" | bc)
    local circle_radius=$(echo "$size / 2.5" | bc)
    local center=$(echo "$size / 2" | bc)

    cat > "public/$filename" << EOF
<svg width="$size" height="$size" viewBox="0 0 $size $size" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-$size" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:$CLAY_COLOR;stop-opacity:1" />
      <stop offset="50%" style="stop-color:$TERRACOTTA_COLOR;stop-opacity:1" />
      <stop offset="100%" style="stop-color:$SAGE_COLOR;stop-opacity:1" />
    </linearGradient>
    <mask id="mask-$size">
      <rect width="$size" height="$size" fill="white"/>
    </mask>
  </defs>

  <!-- Background -->
  <rect width="$size" height="$size" fill="white"/>

  <!-- Left Arc (interlocking circles design) -->
  <path d="M $(echo "$center * 0.7" | bc) $(echo "$center * 0.6" | bc)
           A $circle_radius $circle_radius 0 1 0
           $(echo "$center * 0.7" | bc) $(echo "$center * 1.4" | bc)"
        stroke="url(#grad-$size)"
        stroke-width="$stroke_width"
        fill="none"
        stroke-linecap="round"/>

  <!-- Right Arc -->
  <path d="M $(echo "$center * 1.3" | bc) $(echo "$center * 1.4" | bc)
           A $circle_radius $circle_radius 0 1 0
           $(echo "$center * 1.3" | bc) $(echo "$center * 0.6" | bc)"
        stroke="url(#grad-$size)"
        stroke-width="$stroke_width"
        fill="none"
        stroke-linecap="round"/>
</svg>
EOF

    echo "✅ Created $filename ($size x $size)"
}

# Create all required sizes
create_icon 72 "icon-72.svg"
create_icon 96 "icon-96.svg"
create_icon 128 "icon-128.svg"
create_icon 144 "icon-144.svg"
create_icon 152 "icon-152.svg"
create_icon 192 "icon-192.svg"
create_icon 384 "icon-384.svg"
create_icon 512 "icon-512.svg"
create_icon 180 "apple-touch-icon.svg"

# Create maskable icon (512x512 with padding)
cat > "public/icon-maskable-512.svg" << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-maskable" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#96643a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#b84a32;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5c6d51;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Safe zone padding (20% on each side) -->
  <rect width="512" height="512" fill="white"/>

  <!-- Logo scaled to 60% and centered -->
  <g transform="translate(128, 128) scale(0.6)">
    <!-- Left Arc -->
    <path d="M 180 150 A 110 110 0 1 0 180 370"
          stroke="url(#grad-maskable)"
          stroke-width="50"
          fill="none"
          stroke-linecap="round"/>

    <!-- Right Arc -->
    <path d="M 330 370 A 110 110 0 1 0 330 150"
          stroke="url(#grad-maskable)"
          stroke-width="50"
          fill="none"
          stroke-linecap="round"/>
  </g>
</svg>
EOF

echo "✅ Created icon-maskable-512.svg (512 x 512 with safe zone)"

echo ""
echo "🎨 SVG icons created successfully!"
echo ""
echo "⚠️  IMPORTANT: These are SVG placeholders."
echo "   For best results, you should:"
echo ""
echo "   1. Go to: https://realfavicongenerator.net/"
echo "   2. Upload your actual logo (PNG/SVG)"
echo "   3. Download all generated sizes"
echo "   4. Replace these files in /public/"
echo ""
echo "   OR use the SVG to PNG converter below:"
echo ""

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "🔄 ImageMagick detected! Converting SVGs to PNGs..."

    convert -background none public/icon-72.svg public/icon-72.png
    convert -background none public/icon-96.svg public/icon-96.png
    convert -background none public/icon-128.svg public/icon-128.png
    convert -background none public/icon-144.svg public/icon-144.png
    convert -background none public/icon-152.svg public/icon-152.png
    convert -background none public/icon-192.svg public/icon-192.png
    convert -background none public/icon-384.svg public/icon-384.png
    convert -background none public/icon-512.svg public/icon-512.png
    convert -background none public/icon-maskable-512.svg public/icon-maskable-512.png
    convert -background none public/apple-touch-icon.svg public/apple-touch-icon.png

    echo "✅ PNG icons created!"
    echo ""

    # Create favicon.ico
    convert public/icon-192.png -resize 32x32 public/favicon-32.png
    convert public/favicon-32.png public/favicon.ico

    echo "✅ favicon.ico created!"
    echo ""
    echo "🎉 All icons generated successfully!"

else
    echo "📦 ImageMagick not installed."
    echo ""
    echo "To convert SVGs to PNGs, either:"
    echo ""
    echo "Option 1: Install ImageMagick"
    echo "  brew install imagemagick"
    echo "  Then run this script again"
    echo ""
    echo "Option 2: Use online converter"
    echo "  Go to: https://cloudconvert.com/svg-to-png"
    echo "  Upload each SVG from /public/"
    echo "  Download as PNG with same name"
    echo ""
    echo "Option 3: Use RealFaviconGenerator.net (RECOMMENDED)"
    echo "  Upload your logo, download all sizes"
fi

echo ""
echo "📁 Icons location: /public/"
echo ""
echo "Next steps:"
echo "1. Check public/ folder for generated icons"
echo "2. Test PWA installation on phone"
echo "3. Deploy to Vercel: vercel --prod"
