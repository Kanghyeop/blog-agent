"""Simple script to publish markdown to Ghost."""

import jwt
import datetime
import requests
import markdown
from pathlib import Path

# Ghost configuration
GHOST_URL = "https://aiden.ghost.io"
GHOST_ADMIN_API_KEY = "69522d3df6f30a000125b42c:4098e3fcf0d8fb0428c8c3dfe6f18e5eed47f4142a803abcf1461fae1c10ba90"

def create_jwt_token(api_key):
    """Create JWT token for Ghost Admin API."""
    key_id, secret = api_key.split(':')

    iat = int(datetime.datetime.now().timestamp())

    header = {'alg': 'HS256', 'typ': 'JWT', 'kid': key_id}
    payload = {
        'iat': iat,
        'exp': iat + 5 * 60,
        'aud': '/admin/'
    }

    token = jwt.encode(payload, bytes.fromhex(secret), algorithm='HS256', headers=header)
    return token

def markdown_to_html(md_content):
    """Convert markdown to HTML."""
    return markdown.markdown(
        md_content,
        extensions=['fenced_code', 'tables', 'nl2br']
    )

def extract_title(md_content):
    """Extract title from markdown (first # heading)."""
    for line in md_content.split('\n'):
        line = line.strip()
        if line.startswith('# '):
            return line[2:].strip()
    return "Untitled"

def publish_to_ghost(title, html_content):
    """Publish post to Ghost."""
    token = create_jwt_token(GHOST_ADMIN_API_KEY)

    url = f"{GHOST_URL}/ghost/api/admin/posts/"
    headers = {
        'Authorization': f'Ghost {token}',
        'Content-Type': 'application/json'
    }

    data = {
        "posts": [{
            "title": title,
            "html": html_content,
            "status": "published"
        }]
    }

    response = requests.post(url, json=data, headers=headers)
    response.raise_for_status()

    return response.json()

if __name__ == "__main__":
    # Read translation
    translation_path = Path("output/translation.md")
    md_content = translation_path.read_text(encoding='utf-8')

    # Extract title and convert to HTML
    title = extract_title(md_content)
    html_content = markdown_to_html(md_content)

    # Publish
    print(f"Publishing: {title}")
    result = publish_to_ghost(title, html_content)

    post = result['posts'][0]
    print(f"✓ Published successfully!")
    print(f"  Post ID: {post['id']}")
    print(f"  URL: {post['url']}")
    print(f"  Status: {post['status']}")
