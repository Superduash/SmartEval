from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Smart Evaluation Backend"
    env: str = "development"
    debug: bool = True
    log_level: str = "INFO"

    secret_key: str = "change-me"
    access_token_expire_minutes: int = 120
    algorithm: str = "HS256"

    database_url: str = "sqlite:///./smart_eval.db"

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    storage_type: str = "local"
    local_storage_path: str = "./storage"

    aws_region: str = "us-east-1"
    aws_s3_bucket: str = ""
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""

    tesseract_cmd: str = "/usr/bin/tesseract"
    passing_mark: int = 40

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
