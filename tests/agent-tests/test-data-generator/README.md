# Test Data Generator for RADAR

Generates fake contacts for testing the network graph, filters, and UI performance.

## Usage

```bash
# Generate 99 fake contacts
python3 generate.py --count 99 --user-id YOUR_USER_ID

# Clean up test data
python3 generate.py --cleanup --user-id YOUR_USER_ID
```

## Templates
- `templates/names.ru.json` - Russian names
- `templates/bios.ru.json` - Bio descriptions
- `templates/anchors.ru.json` - Conversation anchors
