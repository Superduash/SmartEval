# Infra

Infrastructure assets can be expanded here:

- reverse proxy (Nginx/Caddy)
- CI/CD pipeline definitions
- Terraform/IaC for cloud deployment
- secrets management and observability stack

Current deployment entrypoint is root docker-compose.yml.

## Added Utilities

- `release_healthcheck.sh`: waits for and validates frontend and backend health URLs.
- `release_checklist.md`: consolidated release checklist for final QA.

### Usage

```bash
chmod +x infra/release_healthcheck.sh
./infra/release_healthcheck.sh
```
