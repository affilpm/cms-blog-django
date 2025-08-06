from django.shortcuts import render
from core.views.mixins import SuperUserRequiredMixin, ActiveSectionMixin
from django.views.generic import TemplateView

class DashboardView(SuperUserRequiredMixin, ActiveSectionMixin, TemplateView):
    template_name = 'admin_panel/dashboard.html'
    active_section = 'admin_dashboard'
    
class UsersListView(SuperUserRequiredMixin, ActiveSectionMixin, TemplateView):
    template_name = 'admin_panel/users_list.html'
    active_section = 'admin_users_list'
    