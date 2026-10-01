from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Patient


class PatientAPITests(APITestCase):
    def setUp(self):
        self.user = Patient.objects.create_user(
            first_name="Test",
            last_name="User",
            mobile="01700000000",
            age=30,
            gender=Patient.Gender.MALE,
            blood_group=Patient.BloodGroup.A_POSITIVE,
            password="secret123",
        )
        self.client.force_authenticate(user=self.user)

    def test_create_patient_success(self):
        payload = {
            "first_name": "Alice",
            "last_name": "Rahman",
            "mobile": "01711111111",
            "age": 28,
            "gender": "FEMALE",
            "address": "Dhaka",
            "blood_group": "B+",
            "password": "secret123",
        }

        response = self.client.post(reverse("patient-list-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Patient.objects.filter(mobile="01711111111").count(), 1)

    def test_list_patients_is_paginated(self):
        for i in range(12):
            Patient.objects.create_user(
                first_name=f"User{i}",
                last_name="Test",
                mobile=f"017100000{i:02d}",
                age=25,
                gender=Patient.Gender.MALE,
                blood_group=Patient.BloodGroup.O_POSITIVE,
                password="secret123",
            )

        response = self.client.get(reverse("patient-list-create"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)
        self.assertIn("results", response.data)
        self.assertEqual(len(response.data["results"]), 5)

    def test_update_patient_success(self):
        payload = {"first_name": "Updated", "address": "Chittagong"}

        response = self.client.patch(
            reverse("patient-detail", kwargs={"pk": self.user.pk}),
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")
        self.assertEqual(self.user.address, "Chittagong")

    def test_delete_patient_success(self):
        response = self.client.delete(reverse("patient-detail", kwargs={"pk": self.user.pk}))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Patient.objects.filter(pk=self.user.pk).exists())

    def test_duplicate_mobile_is_rejected(self):
        payload = {
            "first_name": "Dup",
            "last_name": "User",
            "mobile": self.user.mobile,
            "age": 30,
            "gender": "MALE",
            "blood_group": "A+",
            "password": "secret123",
        }

        response = self.client.post(reverse("patient-list-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_age_is_rejected(self):
        payload = {
            "first_name": "Bad",
            "last_name": "Age",
            "mobile": "01722222222",
            "age": 0,
            "gender": "MALE",
            "blood_group": "O+",
            "password": "secret123",
        }

        response = self.client.post(reverse("patient-list-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_visit_increments_total_visits(self):
        patient = Patient.objects.create_user(
            first_name="Visit",
            last_name="User",
            mobile="01733333333",
            age=27,
            gender=Patient.Gender.FEMALE,
            blood_group=Patient.BloodGroup.B_POSITIVE,
            password="secret123",
        )

        payload = {
            "patient": patient.pk,
            "doctor_name": "Dr. Smith",
            "visit_date": "2026-10-01",
            "clinical_note": "Follow-up",
            "diagnosis": "Stable",
        }

        response = self.client.post(reverse("visit-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        patient.refresh_from_db()
        self.assertEqual(patient.total_visits, 1)

    def test_visit_sets_last_visit_date(self):
        patient = Patient.objects.create_user(
            first_name="Date",
            last_name="User",
            mobile="01744444444",
            age=35,
            gender=Patient.Gender.MALE,
            blood_group=Patient.BloodGroup.AB_POSITIVE,
            password="secret123",
        )

        payload = {
            "patient": patient.pk,
            "doctor_name": "Dr. Brown",
            "visit_date": "2026-10-02",
            "clinical_note": "Checkup",
            "diagnosis": "Improving",
        }

        response = self.client.post(reverse("visit-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        patient.refresh_from_db()
        self.assertEqual(str(patient.last_visit_date), "2026-10-02")

    def test_login_returns_tokens(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {"mobile": self.user.mobile, "password": "secret123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_anonymous_get_returns_401(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(reverse("patient-list-create"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
