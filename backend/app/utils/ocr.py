from pathlib import Path
import logging

import pytesseract
from pdf2image import convert_from_path
from PIL import Image

from app.core.config import settings

pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd
logger = logging.getLogger(__name__)


def extract_text(file_path: str) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if not path.exists():
        logger.warning("OCR requested for missing file: %s", file_path)
        return ""

    if suffix in {".txt", ".md", ".csv", ".json"}:
        try:
            return path.read_text(encoding="utf-8", errors="ignore")
        except Exception:  # noqa: BLE001
            logger.exception("Failed to read text file via fallback OCR: %s", file_path)
            return ""

    if suffix == ".pdf":
        try:
            pages = convert_from_path(str(path))
            text_parts = [pytesseract.image_to_string(page) for page in pages]
            return "\n".join(text_parts)
        except Exception:  # noqa: BLE001
            logger.exception("PDF OCR failed for %s", file_path)
            try:
                # Last-resort fallback for OCR-unavailable environments.
                return path.read_text(encoding="utf-8", errors="ignore")
            except Exception:  # noqa: BLE001
                return ""

    try:
        image = Image.open(path)
        return pytesseract.image_to_string(image)
    except Exception:  # noqa: BLE001
        logger.exception("Image OCR failed for %s", file_path)
        return ""
