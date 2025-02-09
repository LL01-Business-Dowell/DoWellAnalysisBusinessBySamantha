
from django.contrib import admin
from django.urls import path
from django.urls import path, include
from .views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', healthCheck.as_view()),
    path('api/v1/', include('app.urls')),
]
