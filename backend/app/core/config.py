from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "AURORA"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    database_url: str = "sqlite:///./aurora.db"

    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    jwt_algorithm: str = "HS256"

    cors_origins: list[str] = ["http://localhost:3000"]

    # OAuth client ID for "Sign in with Google"; empty disables the endpoint.
    google_client_id: str = ""

    default_tax_rate: float = 0.10

    first_admin_email: str = "admin@aurora.dev"
    first_admin_password: str = "admin12345"


@lru_cache
def get_settings() -> Settings:
    return Settings()
