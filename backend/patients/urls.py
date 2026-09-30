from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import PatientDetailView, PatientListCreateView, PatientVisitCreateView

urlpatterns = [
    path("api/patients/", PatientListCreateView.as_view(), name="patient-list-create"),
    path("api/patients/<int:pk>/", PatientDetailView.as_view(), name="patient-detail"),
    path("api/visits/", PatientVisitCreateView.as_view(), name="visit-create"),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
