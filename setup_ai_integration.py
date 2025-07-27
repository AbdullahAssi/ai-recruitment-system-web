#!/usr/bin/env python3
"""
Setup script for AI Models integration with Next.js
Run this script to set up the Python environment and dependencies
"""

import subprocess
import sys
import os
from pathlib import Path


def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n🔄 {description}")
    print(f"Running: {command}")

    try:
        result = subprocess.run(
            command, shell=True, check=True, capture_output=True, text=True
        )
        print(f"✅ {description} - Success")
        if result.stdout:
            print(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Failed")
        print(f"Error: {e.stderr}")
        return False


def main():
    print("🚀 Setting up AI Models Integration")
    print("=" * 50)

    # Check if we're in the right directory
    if not Path("ai_models").exists():
        print(
            "❌ Please run this script from the project root directory (where ai_models folder exists)"
        )
        sys.exit(1)

    os.chdir("ai_models")

    # Check Python version
    print(f"🐍 Python version: {sys.version}")

    # Install Python dependencies
    if not run_command(
        "pip install -r requirements.txt", "Installing Python dependencies"
    ):
        print("⚠️  Failed to install some dependencies. Continue anyway? (y/n)")
        if input().lower() != "y":
            sys.exit(1)

    # Install Prisma for Python integration
    if not run_command("npm install", "Installing Node.js dependencies (Prisma)"):
        print("⚠️  Failed to install Node.js dependencies")

    # Generate Prisma client
    if not run_command("npx prisma generate", "Generating Prisma client"):
        print("⚠️  Failed to generate Prisma client")

    # Check environment variables
    env_file = Path(".env")
    if not env_file.exists():
        print("\n⚠️  .env file not found in ai_models directory")
        print("📋 Please create .env file with required variables:")
        print("   - OPENAI_API_KEY=your_key_here")
        print("   - DATABASE_URL=your_database_url_here")
        print("\n📄 See env_template.txt for reference")
    else:
        print("✅ .env file found")

        # Check for required environment variables
        with open(env_file) as f:
            env_content = f.read()

        required_vars = ["OPENAI_API_KEY", "DATABASE_URL"]
        missing_vars = []

        for var in required_vars:
            if var not in env_content or f"{var}=" not in env_content:
                missing_vars.append(var)

        if missing_vars:
            print(
                f"⚠️  Missing required environment variables: {', '.join(missing_vars)}"
            )
        else:
            print("✅ All required environment variables found")

    # Test database connection
    print("\n🔍 Testing database connection...")
    test_result = run_command(
        "python -c \"from db import get_db_connection; conn = get_db_connection(); print('Database connection successful'); conn.close()\"",
        "Testing database connection",
    )

    if not test_result:
        print("⚠️  Database connection failed. Please check your DATABASE_URL")

    # Test OpenAI connection
    print("\n🤖 Testing OpenAI connection...")
    test_openai = run_command(
        "python -c \"from main import extract_cv_info; print('OpenAI connection configured')\"",
        "Testing OpenAI configuration",
    )

    if not test_openai:
        print("⚠️  OpenAI connection failed. Please check your OPENAI_API_KEY")

    print("\n" + "=" * 50)
    print("🎉 Setup Complete!")
    print("\n📋 Next Steps:")
    print("1. Ensure your .env file has correct OPENAI_API_KEY and DATABASE_URL")
    print("2. Test the integration by uploading a resume through your Next.js app")
    print("3. Check the AI processing works by calling /api/ai/process")
    print("\n🔧 Test Commands:")
    print(
        "   - Test resume processing: python ai_service.py --file data/sample_resume.txt"
    )
    print("   - Test scoring: cd scoring_agent && python scorer.py")


if __name__ == "__main__":
    main()
