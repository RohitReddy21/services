from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    port: int = 8000
    environment: str = "development"
    # Comma-separated list of allowed frontend/backend origins for CORS
    cors_origins: str = (
        "http://localhost:3000,"
        "http://localhost:4000,"
        "https://frontend-silk-seven-87.vercel.app,"
        "https://services-xehg.onrender.com"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        origins = []
        for origin in self.cors_origins.split(","):
            normalized = origin.strip().rstrip("/")
            if normalized and normalized not in origins:
                origins.append(normalized)
        return origins


settings = Settings()
