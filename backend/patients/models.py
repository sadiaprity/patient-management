from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class Patient(AbstractUser):
	class Gender(models.TextChoices):
		MALE = "MALE", "Male"
		FEMALE = "FEMALE", "Female"
    
	class BloodGroup(models.TextChoices):
		A_POSITIVE = "A+", "A+"
		A_NEGATIVE = "A-", "A-"
		B_POSITIVE = "B+", "B+"
		B_NEGATIVE = "B-", "B-"
		AB_POSITIVE = "AB+", "AB+"
		AB_NEGATIVE = "AB-", "AB-"
		O_POSITIVE = "O+", "O+"
		O_NEGATIVE = "O-", "O-"

	username = None
	first_name = models.CharField(max_length=150)
	mobile = models.CharField(max_length=15, unique=True)
	age = models.PositiveSmallIntegerField()
	gender = models.CharField(max_length=6, choices=Gender.choices)
	address = models.TextField(blank=True)
	blood_group = models.CharField(max_length=3, choices=BloodGroup.choices)
	total_visits = models.PositiveIntegerField(default=0)
	last_visit_date = models.DateField(null=True, blank=True)

	USERNAME_FIELD = "mobile"
	REQUIRED_FIELDS = ["first_name", "age"]

	objects = UserManager()

	def __str__(self):
		return f"{self.get_full_name()} ({self.mobile})"


class PatientVisit(models.Model):
	patient = models.ForeignKey(
		Patient,
		related_name="visits",
		on_delete=models.CASCADE,
	)
	doctor_name = models.CharField(max_length=150)
	visit_date = models.DateField()
	clinical_note = models.TextField()
	diagnosis = models.TextField(blank=True)

	def __str__(self):
		return f"{self.patient} - {self.visit_date}"
