from django.contrib import admin

from .models import Patient, PatientVisit


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("id", "mobile", "first_name", "last_name", "total_visits")


@admin.register(PatientVisit)
class PatientVisitAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "doctor_name", "visit_date")
