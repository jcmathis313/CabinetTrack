#!/bin/bash

echo "🚀 Work Order Management App Deployment Script"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
    echo "✅ Git repository initialized"
else
    echo "📁 Git repository already exists"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Create a GitHub repository"
    echo "2. Push your code:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "3. Deploy to Vercel:"
    echo "   - Go to vercel.com"
    echo "   - Import your repository"
    echo "   - Add environment variables:"
    echo "     VITE_SUPABASE_URL=your_supabase_url"
    echo "     VITE_SUPABASE_ANON_KEY=your_supabase_key"
    echo ""
    echo "4. Connect your custom domain"
    echo ""
    echo "📖 See QUICK_DEPLOY.md for detailed instructions"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
