from django.views.generic import TemplateView
from core.views.mixins import JWTLoginRequiredMixin, NormalUserOnlyMixin
    
class HomeView(NormalUserOnlyMixin, TemplateView):
    template_name = 'home/home.html'

