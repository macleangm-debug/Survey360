"""URL Shortening Utility using TinyURL API"""
import httpx
from typing import Optional
import logging

logger = logging.getLogger(__name__)

TINYURL_API_ENDPOINT = "http://tinyurl.com/api-create.php"


async def shorten_url(long_url: str, timeout: float = 5.0) -> Optional[str]:
    """
    Shorten a URL using TinyURL's free API.
    
    Args:
        long_url: The URL to shorten
        timeout: Request timeout in seconds
        
    Returns:
        The shortened URL, or None if shortening failed
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                TINYURL_API_ENDPOINT,
                params={"url": long_url},
                timeout=timeout
            )
            response.raise_for_status()
            
            short_url = response.text.strip()
            
            # Validate response
            if short_url.startswith("http"):
                return short_url
            else:
                logger.warning(f"TinyURL returned unexpected response: {short_url}")
                return None
                
    except httpx.TimeoutException:
        logger.warning(f"TinyURL request timed out for URL: {long_url[:50]}...")
        return None
    except httpx.RequestError as e:
        logger.warning(f"TinyURL request failed: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error shortening URL: {str(e)}")
        return None


def shorten_url_sync(long_url: str, timeout: float = 5.0) -> Optional[str]:
    """
    Synchronous version of URL shortening for use in non-async contexts.
    
    Args:
        long_url: The URL to shorten
        timeout: Request timeout in seconds
        
    Returns:
        The shortened URL, or None if shortening failed
    """
    try:
        with httpx.Client() as client:
            response = client.get(
                TINYURL_API_ENDPOINT,
                params={"url": long_url},
                timeout=timeout
            )
            response.raise_for_status()
            
            short_url = response.text.strip()
            
            if short_url.startswith("http"):
                return short_url
            return None
                
    except Exception as e:
        logger.warning(f"Sync URL shortening failed: {str(e)}")
        return None
