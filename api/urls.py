from django.urls import path
from . import views

urlpatterns = [
    # Auth endpoints
    path('register', views.register, name='register'),
    path('login', views.login, name='login'),
    path('auth/google', views.google_auth, name='google_auth'),

    # Detection endpoints
    path('analyze', views.analyze_image, name='analyze_image'),
    path('history', views.get_history, name='get_history'),
    path('history/<int:item_id>', views.delete_history, name='delete_history'),

    # Profile endpoints
    path('profile', views.get_profile, name='get_profile'),
    path('profile/update', views.update_profile, name='update_profile'),

    # Stats endpoint
    path('stats', views.get_stats, name='get_stats'),
]
