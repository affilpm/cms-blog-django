from django.urls import path
from . import views
from .views import PostCreateView, PostEditView

urlpatterns = [
    path('create-post/', PostCreateView.as_view(), name='create_post'),
    path('edit-post/<int:post_id>/', PostEditView.as_view(), name='edit_post')   
]


