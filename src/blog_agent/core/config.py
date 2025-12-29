"""Configuration management for blog agent."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Ghost Configuration
    ghost_url: str
    ghost_admin_api_key: str

    # Pipeline Configuration
    max_retries: int = 3
    timeout_seconds: int = 30


settings = Settings()
