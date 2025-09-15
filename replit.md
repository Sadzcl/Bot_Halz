# Overview

Bot_Halz is a WhatsApp bot application built using Node.js and the Baileys library. The bot provides various functionality including AI chat integration, TikTok video downloading, Google Drive file management, and administrative controls. It features a command-based interface with prefix support and includes web scraping capabilities for external services.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Bot Framework
- **WhatsApp Integration**: Uses Baileys library (v6.7.18) for WhatsApp Web API connectivity
- **Session Management**: Implements persistent session storage with JSON files for maintaining connection state
- **Authentication**: Supports both QR code and pairing code authentication methods
- **Message Handling**: Event-driven message processing with command parsing and response system

## Command System
- **Prefix-based Commands**: Uses "!" prefix for bot commands
- **Modular Command Structure**: Commands organized in switch-case structure for extensibility
- **Permission System**: Admin-only commands with phone number-based authorization
- **Menu System**: Dynamic menu generation with image support

## Web Services Integration
- **AI Chat Service**: Integrates with Ai4Chat API for conversational AI responses
- **TikTok Downloader**: Custom scraper for TikTok video downloading with watermark removal
- **File Management**: Google Drive integration for document storage and retrieval

## Server Infrastructure
- **Express.js Server**: Provides HTTP server for keep-alive functionality and potential webhooks
- **Environment Configuration**: Uses dotenv for secure configuration management
- **File System Operations**: Handles local file operations for images, sessions, and data storage

## Data Management
- **JSON-based Storage**: File list management using JSON files for document references
- **Session Persistence**: WhatsApp session data stored in dedicated directory structure
- **Configuration Variables**: Global variables for bot settings, admin lists, and message templates

## External Dependencies

- **@adiwajshing/baileys**: Deprecated WhatsApp Web API library (v5.0.0)
- **baileys**: Current WhatsApp Web API library (v6.7.18)
- **express**: Web server framework (v5.1.0)
- **axios**: HTTP client for API requests (v1.11.0)
- **pino**: Logging library (v8.21.0)
- **chalk**: Terminal color formatting (v4.1.2)
- **qrcode-terminal**: QR code generation for authentication (v0.12.0)
- **mime-types**: MIME type detection (v3.0.1)
- **dotenv**: Environment variable management (v16.3.1)

## Third-party Services
- **Ai4Chat API**: AWS-hosted conversational AI service
- **TikWM API**: TikTok video downloading service
- **Google Drive**: File storage and sharing platform

## Security Considerations
- Environment variables for sensitive configuration
- Admin authentication via phone number verification
- Session data encryption and secure storage