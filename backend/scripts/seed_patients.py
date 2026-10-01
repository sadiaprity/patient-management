import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Add the backend root to Python's import path so Django can locate the project package.
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from patients.models import Patient


load_dotenv(BASE_DIR / ".env")

PATIENT_DATA = [
    ("Ab.Kader", "MALE", 25, "O+", "01677307926"),
    ("Morshed Khan", "MALE", 29, "O+", "01674205677"),
    ("Jhorna", "FEMALE", 26, "B+", "01675216052"),
    ("Dhuku Miah", "MALE", 32, "B+", "01860280511"),
    ("Aklima", "FEMALE", 30, "AB+", "01912850072"),
    ("Aslam", "MALE", 29, "B+", "01854558127"),
    ("Kobir", "MALE", 33, "A+", "01984605450"),
    ("Kamruzzaman", "MALE", 35, "B+", "01925704524"),
    ("Munna", "MALE", 42, "O+", "01747497279"),
    ("Ashraful", "MALE", 38, "O+", "01910786529"),
]


def split_name(full_name):
    """Split a full name into first_name and last_name using the first space as the divider."""
    first_name, sep, last_name = full_name.partition(" ")
    if not sep:
        last_name = ""
    return first_name, last_name


def seed_patients():
    default_password = os.getenv("SEED_DEFAULT_PASSWORD")
    created_count = 0
    skipped_count = 0

    for name, gender, age, blood_group, mobile in PATIENT_DATA:
        first_name, last_name = split_name(name)
        patient, created = Patient.objects.get_or_create(
            mobile=mobile,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "gender": gender,
                "age": age,
                "blood_group": blood_group,
            },
        )

        if created:
            # Only set a password for newly created users; existing rows remain untouched.
            if default_password:
                patient.set_password(default_password)
                patient.save(update_fields=["password"])
            created_count += 1
            print(f"created: {mobile} - {name}")
        else:
            skipped_count += 1
            print(f"skipped: {mobile} - {name}")

    print(f"\nSummary: created={created_count}, skipped={skipped_count}, total={created_count + skipped_count}")


if __name__ == "__main__":
    seed_patients()
