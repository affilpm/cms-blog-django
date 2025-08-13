# Blog Platform

A full-stack Content Management System built with Django backend and frontend templates for publishing and sharing blog content with comprehensive admin management capabilities.

## Overview

This blog platform provides a comprehensive system for content creators to publish, manage, and share blog posts with an integrated admin panel for user and content management. The platform features JWT-based authentication, rich text editing, media management, and interactive engagement features.

## Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with refresh token middleware
- **Blog Management**: Create, edit, delete, and publish blog posts with rich text editor
- **Admin Dashboard**: Comprehensive admin interface for user and content management
- **Comment System**: Interactive commenting with approval/moderation capabilities
- **Engagement Features**: Like/unlike functionality and view tracking
- **Media Management**: File and image upload with organized storage
- **Category System**: Organized content categorization
- **Draft System**: Save posts as drafts before publishing

### User Features
- Browse all published blog posts
- Read full blog post details with attachments
- Like/unlike posts
- Comment on posts with approval system
- User registration and secure authentication
- Responsive design across devices

### Admin Features
- **User Management**: Create, edit, delete users and toggle account status
- **Post Management**: Full CRUD operations, publish/unpublish posts
- **Comment Moderation**: Approve/disapprove user comments
- **Analytics Dashboard**: View platform statistics and metrics
- **Category Management**: Organize content with categories

## Technology Stack

### Backend
- **Framework**: Django 4.x
- **Database**: SQLite (development), PostgreSQL ready
- **Authentication**: JWT tokens with refresh mechanism
- **API**: Django REST Framework
- **Middleware**: Custom JWT refresh and cache clearing

### Frontend
- **Templates**: Django Templates with modular structure
- **Styling**: Custom CSS with responsive design
- **JavaScript**: Vanilla JS with API integration
- **Rich Text Editor**: Quill.js WYSIWYG editor

## Project Structure

```
blog_platform/
├── manage.py
├── requirements.txt
├── db.sqlite3
├── blog_platform/         # Main Django project
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── core/                  # Core utilities and base components
│   ├── api/serializers/   # Base serializers, fields, mixins
│   ├── middleware/        # JWT refresh middleware
│   ├── utils/            # JWT helpers and responses
│   ├── static/core_static/
│   └── templates/core/
├── users/                 # User management
│   ├── api/              # User API endpoints
│   ├── models.py         # Custom user model
│   ├── backends.py       # Authentication backends
│   ├── static/users_static/
│   └── templates/users/
├── posts/                # Blog post management
│   ├── api/              # Post API endpoints
│   ├── models.py         # Post, Comment, Category models
│   ├── static/posts_static/
│   └── templates/posts/
├── home/                 # Public blog interface
│   ├── api/              # Public APIs
│   ├── templatetags/     # Custom template filters
│   ├── static/home_static/
│   └── templates/home/
├── admin_panel/          # Admin management interface
│   ├── api/              # Admin API endpoints
│   ├── static/admin_panel_static/
│   └── templates/admin_panel/
└── media/                # User uploaded files
    ├── post_images/      # Blog post images
    └── post_attachment/  # File attachments
```

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - User logout

### User Management (Admin)
- `GET /api/admin/users/` - List all users
- `POST /api/admin/users/` - Create new user
- `GET /api/admin/users/{id}/` - Get user details
- `PUT /api/admin/users/{id}/` - Update user
- `DELETE /api/admin/users/{id}/` - Delete user
- `POST /api/admin/users/{id}/toggle-status/` - Toggle user status

### Post Management
- `GET /api/posts/categories/` - List categories
- `GET /api/posts/` - List all posts
- `POST /api/posts/` - Create new post
- `GET /api/posts/{id}/` - Get post details
- `PUT /api/posts/{id}/` - Update post
- `DELETE /api/posts/{id}/` - Delete post
- `POST /api/posts/{id}/toggle-status/` - Publish/unpublish post

### Post Interactions
- `GET /api/posts/{id}/like/` - Get like status
- `POST /api/posts/{id}/like/` - Toggle like/unlike
- `GET /api/posts/{id}/comments/` - Fetch post comments
- `POST /api/posts/{id}/comments/` - Add comment
- `POST /api/posts/{id}/view/` - Increment view counter

### Admin Panel
- `GET /api/admin/dashboard/` - Dashboard statistics
- `GET /api/admin/comments/` - Manage comments
- `POST /api/admin/comments/{id}/approve/` - Approve comment

## Installation

### Prerequisites
- Python 3.8+
- Django 4.x
- pip (Python package manager)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blog_platform
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
   The project includes a `.env` file for environment variables. Create your own based on the template:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DATABASE_URL=sqlite:///db.sqlite3
   
   # Optional: For production cloud storage
   # AWS_ACCESS_KEY_ID=your-aws-key
   # AWS_SECRET_ACCESS_KEY=your-aws-secret
   # AWS_STORAGE_BUCKET_NAME=your-bucket-name
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

7. **Access the application**
   - Public Blog: `http://127.0.0.1:8000/`
   - Admin Panel: `http://127.0.0.1:8000/admin-panel/`
   - Django Admin: `http://127.0.0.1:8000/admin/`

## Database Models

### User Model (Custom)
- Extended Django User model with additional fields
- Status tracking (active/inactive)
- Profile management capabilities

### Post Model
- Title, content, author relationship
- Category association
- Publication status (draft/published)
- View count and engagement metrics
- Image and file attachment support
- SEO-friendly slug generation

### Comment Model
- Post reference with foreign key
- Author and content fields
- Approval status for moderation
- Timestamp tracking

### Category Model
- Name and description fields
- Post categorization support
- Admin manageable

## Key Features

### Rich Text Editor
- **Quill.js WYSIWYG editor** for post creation
- Image upload and insertion
- File attachment support
- Draft auto-save functionality

### Advanced Admin Interface
- **Complete Admin Suite**: 7 dedicated admin pages with corresponding CSS/JS files
  - Dashboard with analytics
  - User management (list, create, edit)
  - Post management (list, detail view)
  - Comment moderation
- **Rich Media Management**: Organized file storage with separate directories for images and attachments
- **Comprehensive Logging**: Error and info logging systems built-in

### Security Features
- JWT-based authentication with refresh tokens
- CSRF protection on all forms
- Input validation and sanitization
- File upload restrictions and validation
- SQL injection prevention through ORM

### Template System
- Modular template inheritance
- Responsive design components
- Custom template tags and filters
- SEO-optimized meta tags

## Usage

### For Content Creators
1. Register an account or login
2. Access the post creation interface
3. Write posts using the **Quill.js rich text editor**
4. Upload images and attachments
5. Save as draft or publish immediately
6. Monitor engagement through dashboard

### For Administrators
1. Access admin panel at `/admin-panel/`
2. Manage user accounts and permissions
3. Moderate posts and comments
4. View platform analytics
5. Manage categories and site settings

### For Readers
1. Browse published blog posts on homepage
2. Read full articles with media
3. Engage through likes and comments
4. Register for enhanced features

## Development

### Running in Development
```bash
python manage.py runserver
```

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

## Production Deployment

### Environment Setup
1. Set `DEBUG=False`
2. Configure production database (PostgreSQL)
3. Set up cloud storage (AWS S3)
4. Configure allowed hosts
5. Set up SSL certificates
6. Configure static file serving

### Recommended Deployment Platforms
- AWS (with RDS and S3)
- Heroku
- DigitalOcean App Platform
- Railway
- Render

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**AFFIL P M**  
📧 [affilpm2004@gmail.com](mailto:affilpm2004@gmail.com)  

### 🌐 Social Media:
- **LinkedIn:** [linkedin.com/in/affilpm](https://www.linkedin.com/in/affil-p-m-b9a2b2299)