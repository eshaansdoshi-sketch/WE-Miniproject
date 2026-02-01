"""
Supabase Storage client using httpx for async file operations.
"""
import os

import httpx

# Load Supabase configuration from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def get_storage_headers() -> dict:
    """
    Returns the required headers for Supabase Storage API requests.
    """
    return {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }


async def upload_resume(file_bytes: bytes, filename: str) -> dict | str:
    """
    Uploads a resume PDF to Supabase Storage.

    Args:
        file_bytes: The raw bytes of the PDF file.
        filename: The name to store the file as.

    Returns:
        The public file path if successful, or an error dictionary.
    """
    url = f"{SUPABASE_URL}/storage/v1/object/resumes/{filename}"

    headers = get_storage_headers()
    headers["Content-Type"] = "application/pdf"

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, content=file_bytes)

    if response.status_code in (200, 201):
        return f"resumes/{filename}"
    else:
        return {
            "error": True,
            "status_code": response.status_code,
            "details": response.text,
        }
