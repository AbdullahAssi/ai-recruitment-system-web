"""
Text Extraction Module for Resume Processing
Handles extraction from multiple file formats (PDF, DOCX, DOC, TXT)
"""

import os
import re
import logging
from pathlib import Path


def safe_log(message):
    """Safe logging function for Windows console"""
    try:
        print(f"[TEXT_EXTRACTOR] {message}")
    except UnicodeEncodeError:
        print(f"[TEXT_EXTRACTOR] {message.encode('ascii', 'replace').decode('ascii')}")


def extract_text_from_file(file_path):
    """
    Extract text from various file formats

    Args:
        file_path (str): Path to the file to extract text from

    Returns:
        str: Extracted text content

    Raises:
        Exception: If file extraction fails
    """
    try:
        file_path = Path(file_path)

        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        file_extension = file_path.suffix.lower()
        safe_log(f"Extracting text from {file_extension} file: {file_path.name}")

        if file_extension == ".pdf":
            return extract_from_pdf(str(file_path))
        elif file_extension in [".docx", ".doc"]:
            return extract_from_word(str(file_path))
        elif file_extension == ".txt":
            return extract_from_txt(str(file_path))
        else:
            # Fallback: try to read as text
            safe_log(f"Unknown format {file_extension}, attempting text extraction")
            return extract_from_txt(str(file_path))

    except Exception as e:
        safe_log(f"Error extracting text from {file_path}: {str(e)}")
        raise


def extract_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        import PyPDF2

        with open(file_path, "rb") as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""

            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"

            if not text.strip():
                safe_log("No text extracted from PDF, trying alternative method")
                # Alternative extraction method
                try:
                    import pdfplumber

                    with pdfplumber.open(file_path) as pdf:
                        text = ""
                        for page in pdf.pages:
                            text += page.extract_text() + "\n"
                except ImportError:
                    safe_log("pdfplumber not available, using PyPDF2 result")

            return text.strip()

    except ImportError:
        safe_log("PyPDF2 not available, trying textract")
        return extract_with_textract(file_path)
    except Exception as e:
        safe_log(f"PDF extraction failed: {e}")
        return extract_with_textract(file_path)


def extract_from_word(file_path):
    """Extract text from Word document (.docx/.doc)"""
    try:
        if file_path.endswith(".docx"):
            # Handle .docx files with python-docx
            try:
                import docx

                doc = docx.Document(file_path)
                text = ""
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
                safe_log("Successfully extracted text from .docx using python-docx")
                return text.strip()
            except ImportError:
                safe_log("python-docx not available, trying alternative method")
                return extract_with_alternative_methods(file_path)
        else:
            # Handle .doc files (older format)
            safe_log("DOC format detected, trying multiple extraction methods")
            return extract_doc_file(file_path)

    except Exception as e:
        safe_log(f"Word extraction failed: {e}")
        return extract_with_alternative_methods(file_path)


def extract_doc_file(file_path):
    """Extract text from .doc files using multiple methods"""

    # Method 1: Try python-docx2txt (better for .doc files)
    try:
        import docx2txt

        text = docx2txt.process(file_path)
        if text and text.strip():
            safe_log("Successfully extracted text from .doc using docx2txt")
            return text.strip()
    except ImportError:
        safe_log("docx2txt not available")
    except Exception as e:
        safe_log(f"docx2txt extraction failed: {e}")

    # Method 2: Try win32com (Windows only, for .doc files)
    try:
        import win32com.client

        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        doc = word.Documents.Open(os.path.abspath(file_path))
        text = doc.Content.Text
        doc.Close()
        word.Quit()
        if text and text.strip():
            safe_log("Successfully extracted text from .doc using win32com")
            return text.strip()
    except ImportError:
        safe_log("win32com not available")
    except Exception as e:
        safe_log(f"win32com extraction failed: {e}")

    # Method 3: Try textract as fallback
    try:
        return extract_with_textract(file_path)
    except Exception as e:
        safe_log(f"textract extraction failed: {e}")

    # Method 4: Try reading as binary and look for text patterns
    try:
        safe_log("Attempting binary extraction from .doc file")
        with open(file_path, "rb") as file:
            content = file.read()
            # Simple heuristic to extract text from .doc binary
            text = ""
            content_str = content.decode("latin1", errors="ignore")
            # Look for text patterns (very basic approach)
            import re

            text_parts = re.findall(r"[A-Za-z0-9\s@.\-_]+", content_str)
            text = " ".join([part for part in text_parts if len(part) > 3])

            if text and len(text) > 50:  # Only return if we found substantial text
                safe_log("Extracted text using binary parsing method")
                return text
    except Exception as e:
        safe_log(f"Binary extraction failed: {e}")

    # If all methods fail, return an error message
    raise Exception(
        "Unable to extract text from .doc file. Please convert to .docx or .txt format."
    )


def extract_with_alternative_methods(file_path):
    """Try alternative extraction methods when primary methods fail"""

    # Method 1: Try textract
    try:
        return extract_with_textract(file_path)
    except Exception:
        pass

    # Method 2: Try reading as plain text (might work for some formats)
    try:
        safe_log("Attempting to read file as plain text")
        encodings = ["utf-8", "utf-16", "cp1252", "iso-8859-1", "latin1"]

        for encoding in encodings:
            try:
                with open(file_path, "r", encoding=encoding) as file:
                    content = file.read()
                    if content.strip():
                        safe_log(
                            f"Successfully read file as text with {encoding} encoding"
                        )
                        return content
            except UnicodeDecodeError:
                continue

        # If all encodings fail, try binary read with error handling
        with open(file_path, "rb") as file:
            content = file.read().decode("utf-8", errors="replace")
            safe_log("Read file with fallback binary method")
            return content

    except Exception as e:
        safe_log(f"Alternative extraction methods failed: {e}")
        raise Exception(f"Unable to extract text from file: {e}")


def extract_from_txt(file_path):
    """Extract text from plain text file"""
    try:
        encodings = ["utf-8", "utf-16", "cp1252", "iso-8859-1"]

        for encoding in encodings:
            try:
                with open(file_path, "r", encoding=encoding) as file:
                    content = file.read()
                    safe_log(f"Successfully read text file with {encoding} encoding")
                    return content
            except UnicodeDecodeError:
                continue

        # If all encodings fail, read as binary and decode with errors='replace'
        with open(file_path, "rb") as file:
            content = file.read().decode("utf-8", errors="replace")
            safe_log("Read text file with fallback encoding")
            return content

    except Exception as e:
        safe_log(f"Text extraction failed: {e}")
        raise


def extract_with_textract(file_path):
    """Fallback extraction using textract"""
    try:
        import textract

        text = textract.process(file_path).decode("utf-8")
        safe_log("Successfully extracted text using textract")
        return text
    except ImportError:
        safe_log("textract not available")
        raise Exception("Unable to extract text: no suitable library available")
    except Exception as e:
        safe_log(f"textract extraction failed: {e}")
        raise Exception(f"Text extraction failed: {e}")


# Test function
def test_extraction():
    """Test text extraction functionality"""
    test_files = ["test.pdf", "test.docx", "test.txt"]

    for file_name in test_files:
        if os.path.exists(file_name):
            try:
                text = extract_text_from_file(file_name)
                safe_log(
                    f"Successfully extracted {len(text)} characters from {file_name}"
                )
            except Exception as e:
                safe_log(f"Failed to extract from {file_name}: {e}")
        else:
            safe_log(f"Test file {file_name} not found")


if __name__ == "__main__":
    test_extraction()
