from django.urls import path
from app import views

urlpatterns = [
    path('calculate_cool_power/', views.perform_calculation, name='calc'),
]