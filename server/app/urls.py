from django.urls import path
from .views import *

urlpatterns = [
    path('', serviceInfo.as_view()),
    path('business-analysis/', businessAnalysisBySamanta.as_view()),
]