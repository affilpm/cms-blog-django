from django.views.generic import TemplateView
from core.views.mixins import JWTLoginRequiredMixin, SuperUserRequiredMixin, RedirectAuthenticatedUserMixin

class RegisterView(SuperUserRequiredMixin, TemplateView):
    template_name = 'users/register.html'

class LoginView(RedirectAuthenticatedUserMixin, TemplateView):
    template_name = 'users/login.html'