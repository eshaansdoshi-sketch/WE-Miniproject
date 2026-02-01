"""
Resume PDF parser for text extraction.
"""
import re
from io import BytesIO

import PyPDF2


def clean_resume_text(text: str) -> str:
    """
    Cleans and normalizes extracted resume text.

    Args:
        text: The raw extracted text.

    Returns:
        Cleaned and normalized text.
    """
    # Remove null characters and weird control chars
    text = text.replace("\x00", " ")

    # Remove multiple spaces
    text = re.sub(r"\s+", " ", text)

    # Fix spacing around punctuation
    text = re.sub(r"\s([?.!,])", r"\1", text)

    return text.strip()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text content from a PDF file.

    Args:
        file_bytes: The raw bytes of the PDF file.

    Returns:
        The extracted and cleaned text as a string.
    """
    reader = PyPDF2.PdfReader(BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    
    raw_text = text.strip()
    return clean_resume_text(raw_text)

