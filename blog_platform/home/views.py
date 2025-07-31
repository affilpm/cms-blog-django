from django.views.generic import TemplateView
from core.views.mixins import JWTLoginRequiredMixin
    
class HomeView(JWTLoginRequiredMixin,TemplateView):
    template_name = 'home/home.html'

