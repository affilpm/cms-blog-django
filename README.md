# CMS Application

A full-stack Content Management System built with Django backend and frontend templates for publishing and sharing blog content.

## Overview

This CMS application provides a comprehensive platform for content creators to publish, manage, and share blog posts with an integrated admin panel for user and content management.

## Features

### Core Features
- **User Authentication**: Secure JWT-based authentication system
- **Blog Management**: Create, edit, delete, and publish blog posts
- **User Management**: Admin panel for user administration
- **Comment System**: Interactive commenting with moderation capabilities
- **Engagement Features**: Like/unlike functionality and view tracking
- **Media Management**: Cloud storage integration for images and files
- **Admin Dashboard**: Comprehensive admin interface for content moderation

### User Features
- View all published blog posts
- Read full blog post details
- Like/unlike posts
- Comment on posts
- User registration and authentication
- Profile management

### Admin Features
- User management (create, edit, delete, toggle status)
- Post management (create, edit, delete, publish/unpublish)
- Comment moderation (approve/block)
- Analytics and view tracking
- Media file management

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - User logout

### User Management (Admin)
- `GET /api/users/admin-user-management/` - List all users
- `POST /api/users/admin-user-management/` - Create new user
- `GET /api/users/admin-user-management/{id}/` - Get user details
- `PUT /api/users/admin-user-management/{id}/` - Update user
- `DELETE /api/users/admin-user-management/{id}/` - Delete user
- `POST /api/users/admin-user-management/{id}/toggle-status/` - Toggle user status

### Post Management
- `GET /api/posts/category/` - List categories
- `GET /api/posts/post/` - List all posts
- `POST /api/posts/post/` - Create new post/draft
- `GET /api/posts/post/{id}/` - Get post details
- `PUT /api/posts/post/{id}/` - Update post
- `DELETE /api/posts/post/{id}/` - Delete post
- `POST /api/posts/post/{id}/toggle-status/` - Toggle post status (publish/unpublish)

### Post Interactions
- `GET /api/posts/{id}/like/` - Get like status
- `POST /api/posts/{id}/like/` - Toggle like/unlike
- `GET /api/posts/comments/?post={id}` - Fetch post comments
- `POST /api/posts/{id}/view/` - Increment view counter

## Technology Stack

### Backend
- **Framework**: Django
- **Database**: MySQL/PostgreSQL
- **Authentication**: JWT tokens
- **Storage**: Cloud storage (AWS S3/Azure Blob)
- **API**: Django REST Framework

### Frontend
- **Templates**: Django Templates
- **Styling**: CSS/Bootstrap
- **JavaScript**: Vanilla JS for interactivity

## Installation

### Prerequisites
- Python 3.8+
- Django 4.x
- Database (MySQL/PostgreSQL)
- Cloud storage account (AWS S3/Azure)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cms-application
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   SECRET_KEY=your-secret-key
   DEBUG=True
   DATABASE_URL=your-database-url
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   AWS_STORAGE_BUCKET_NAME=your-bucket-name
   ```

5. **Database Setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Run the application**
   ```bash
   python manage.py runserver
   ```

## Project Structure

```
cms-application/
├── cms/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── users/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── posts/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   └── comments/
├── templates/
│   ├── base.html
│   ├── blog/
│   ├── admin/
│   └── auth/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
├── media/
├── requirements.txt
└── manage.py
```

## Database Models

### User Model
- Extended Django User model
- Additional fields for profile management
- Status tracking (active/inactive)

### Post Model
- Title, content, author
- Category, tags
- Publication status (draft/published)
- Created/updated timestamps
- View count, like count
- Featured image

### Comment Model
- Post reference
- Author, content
- Approval status
- Created timestamp

### Category Model
- Name, description
- Created timestamp

## Usage

### For Content Creators
1. Register/Login to the system
2. Access the dashboard
3. Create new blog posts or drafts
4. Upload images and media files
5. Publish posts when ready
6. Monitor engagement (views, likes, comments)

### For Administrators
1. Access admin panel at `/admin/`
2. Manage users (create, edit, deactivate)
3. Moderate content and comments
4. Monitor site analytics
5. Manage categories and tags

### For Readers
1. Browse published blog posts
2. Read full articles
3. Like/unlike posts
4. Leave comments
5. Register for enhanced features

## Security Features

- JWT-based authentication
- CSRF protection
- Input validation and sanitization
- File upload restrictions
- SQL injection prevention


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Production Setup
1. Set `DEBUG=False` in environment variables
2. Configure production database
3. Set up static file serving
4. Configure cloud storage
5. Set up SSL certificates
6. Deploy using your preferred platform (AWS, Heroku, DigitalOcean)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
