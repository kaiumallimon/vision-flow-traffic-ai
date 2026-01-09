"""
URL configuration for visionflow project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import FileResponse
import os

def serve_react_app(request, path=''):
    """Serve React app"""
    dist_dir = os.path.join(settings.BASE_DIR, 'frontend', 'dist')
    index_path = os.path.join(dist_dir, 'index.html')

    if os.path.exists(index_path):
        return FileResponse(open(index_path, 'rb'))
    else:
        from django.http import JsonResponse
        return JsonResponse({"error": "Frontend build not found. Run 'npm run build' in frontend directory"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),

    # Catch-all route for React app (must be last)
    path('', serve_react_app),
    path('<path:path>', serve_react_app),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
