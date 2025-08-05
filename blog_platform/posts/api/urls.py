from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CategoryView

router = DefaultRouter()
router.register(r'post', PostViewSet, basename='post')

urlpatterns = [
    path('', include(router.urls)),
    path('category/', CategoryView.as_view()),
]


