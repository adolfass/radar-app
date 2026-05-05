#!/usr/bin/env python3
"""
Test Data Generator for RADAR

Generates fake contacts via API for testing the network graph, filters, and UI.
"""

import argparse
import json
import random
import os
from datetime import datetime, timedelta

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")


def load_templates():
    with open(os.path.join(TEMPLATES_DIR, "names.ru.json")) as f:
        names = json.load(f)
    with open(os.path.join(TEMPLATES_DIR, "bios.ru.json")) as f:
        bios = json.load(f)
    with open(os.path.join(TEMPLATES_DIR, "anchors.ru.json")) as f:
        anchors = json.load(f)
    return names, bios, anchors


def generate_contact(user_id: str, index: int, names, bios, anchors):
    first = random.choice(names["firstNames"])
    last = random.choice(names["lastNames"])
    username = f"{first.lower()}_{random.choice(['dev', 'ceo', 'hr', 'ops', 'tech', 'biz'])}_{index}"

    circle = random.choices(
        ["SUPPORT", "PRODUCTIVITY", "DEVELOPMENT"],
        weights=[0.05, 0.25, 0.70]
    )[0]

    archetype = random.choice(["PEACH", "POMEGRANATE", "APPLE"])
    role = random.choice(["CONNECTOR", "CONDENSATOR", "BRIDGE", "GATEKEEPER"])
    valence = random.choices(
        ["POSITIVE", "NEGATIVE", "NEUTRAL"],
        weights=[0.7, 0.1, 0.2]
    )[0]

    anchor_count = random.randint(0, 3)
    contact_anchors = random.sample(anchors["anchors"], min(anchor_count, len(anchors["anchors"])))

    days_ago = random.randint(1, 365)
    last_interaction = (datetime.now() - timedelta(days=days_ago)).isoformat()

    return {
        "name": f"{first} {last}",
        "phone": f"+7999{random.randint(1000000, 9999999):07d}",
        "email": f"{first.lower()}.{last.lower()}@test.dev",
        "telegramHandle": f"@{username}",
        "circle": circle,
        "archetype": archetype,
        "aiSuggestedRole": role,
        "bio": random.choice(bios["bios"]),
        "anchors": contact_anchors,
        "isPremium": random.random() < 0.3,
        "lastInteraction": last_interaction,
        "isActive": random.random() < 0.85,
        "resourceImpact": random.choice(["charge", "drain", "neutral"]),
        "valence": valence,
        "isTest": True,
    }


def generate_contacts(count: int, user_id: str):
    names, bios, anchors = load_templates()
    return [generate_contact(user_id, i, names, bios, anchors) for i in range(count)]


def main():
    parser = argparse.ArgumentParser(description="RADAR Test Data Generator")
    parser.add_argument("--count", type=int, default=99, help="Number of contacts to generate")
    parser.add_argument("--user-id", required=True, help="User ID to associate contacts with")
    parser.add_argument("--output", help="Output file path (default: contacts.json)")
    parser.add_argument("--api-url", default="http://localhost:3002", help="Backend API URL")
    parser.add_argument("--token", help="JWT token for API auth")
    args = parser.parse_args()

    contacts = generate_contacts(args.count, args.user_id)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(contacts, f, indent=2, ensure_ascii=False)
        print(f"Generated {len(contacts)} contacts -> {args.output}")
    else:
        print(json.dumps(contacts, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
