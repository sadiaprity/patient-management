from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions

from .models import Patient, PatientVisit
from .serializers import PatientSerializer, VisitSerializer


class PatientListCreateView(generics.ListCreateAPIView):
    """List patients for authenticated users and allow public patient creation."""

    queryset = Patient.objects.order_by("id")
    serializer_class = PatientSerializer

    def get_permissions(self):
        """Only GET requests require authentication; POST creation stays open."""
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a single patient."""

    queryset = Patient.objects.order_by("id")
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]


class PatientVisitListView(generics.ListAPIView):
    serializer_class = VisitSerializer
    pagination_class = None
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        patient = get_object_or_404(Patient, pk=self.kwargs["pk"])
        return patient.visits.order_by("-visit_date", "-id")


class PatientVisitCreateView(generics.CreateAPIView):
    """Create a visit and keep the patient's counters synchronized."""

    queryset = PatientVisit.objects.all()
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """Create the visit and update the patient aggregate counters in one transaction."""
        with transaction.atomic():
            visit = serializer.save()
            patient = visit.patient

            # Increment the running total for this patient.
            Patient.objects.filter(pk=patient.pk).update(total_visits=F("total_visits") + 1)

            # Recompute the newest visit date after the save, then only move the field forward.
            latest_visit_date = patient.visits.order_by("-visit_date").values_list("visit_date", flat=True).first()
            if latest_visit_date is not None and (patient.last_visit_date is None or latest_visit_date > patient.last_visit_date):
                Patient.objects.filter(pk=patient.pk).update(last_visit_date=latest_visit_date)
