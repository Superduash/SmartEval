# SMART EVALUATION — MASTER REFACTOR & FIX PROMPT
# Paste this entire prompt to GPT-4o / Codex. It will rewrite all affected files.

---

You are a senior full-stack engineer. Refactor the **Smart Evaluation** project located at `/Users/ashwin/Downloads/Smart Evaluation`. Apply every change listed below. Output each file as a complete replacement using the format:

```
### FILE: <relative path from project root>
<full file content>
```

Do NOT omit any file. Do NOT abbreviate with "rest stays the same". Output every changed file in full.

---

## STACK CHANGES TO APPLY

### 1. Remove LangChain entirely — use OpenAI SDK directly
- Delete all `langchain` and `langchain-openai` imports everywhere.
- Rewrite `backend/app/agents/evaluation_agent.py` to call `openai.OpenAI().chat.completions.create(...)` directly.
- The agent must still work with no API key (fallback rule-based scoring).

### 2. Switch default DB to SQLite for local dev
- Change `backend/app/core/config.py`: default `database_url` = `"sqlite:///./smart_eval.db"`
- Change `backend/app/core/database.py`: detect SQLite vs Postgres. For SQLite add `connect_args={"check_same_thread": False}` and skip `pool_pre_ping`. For Postgres keep `pool_pre_ping=True`.

### 3. Fix deprecated FastAPI startup event
- In `backend/app/main.py` replace `@app.on_event("startup")` with the modern `lifespan` context manager pattern using `asynccontextmanager`.

### 4. Frontend: swap Chart.js → Recharts
- In `frontend/package.json`: remove `chart.js` and `react-chartjs-2`, add `recharts@^2.12.7`.
- Rewrite every chart component to use Recharts (`LineChart`, `BarChart`, `PieChart`) from `recharts`.
- Remove all `chart.js` register calls (`Chart.register(...)`).

### 5. Fix requirements.txt
Replace `backend/requirements.txt` with this exact list (no langchain):

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
psycopg2-binary==2.9.9
aiosqlite==0.20.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.10
pydantic-settings==2.5.2
email-validator==2.2.0
boto3==1.35.27
openai==1.47.0
pytesseract==0.3.13
pdf2image==1.17.0
Pillow==10.4.0
python-dotenv==1.0.1
httpx==0.27.2
reportlab==4.2.2
```

Also update `backend/requirements-dev.txt`:
```
-r requirements.txt
pytest==8.3.3
pytest-cov==5.0.0
pytest-mock==3.14.0
httpx==0.27.2
```

### 6. Fix backend/.env (create/update)
Create `backend/.env` with these safe defaults so the app runs immediately with SQLite and no external services:
```
APP_NAME=Smart Evaluation Backend
ENV=development
DEBUG=true
SECRET_KEY=dev-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=120
DATABASE_URL=sqlite:///./smart_eval.db
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./storage
TESSERACT_CMD=/opt/homebrew/bin/tesseract
PASSING_MARK=40
```

### 7. Fix frontend/.env
Create `frontend/.env`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 8. Fix the EvaluationAgent test
- In `backend/tests/test_agents_verification.py`, the test `test_evaluation_agent_fallback_logic_without_openai_key` patches `EvaluationAgent.__init__` to `lambda self: None`. After this patch, `agent.llm` won't exist. The agent's `run()` method must check `hasattr(self, 'llm')` and also check `settings.openai_api_key` before calling the LLM. Ensure the fallback path runs cleanly even when `self.llm` is missing.

### 9. Complete missing functionality
The following features are referenced in routes but have incomplete or missing implementations. Fix them all:

**A. Student upload-answer triggers evaluation automatically**
Currently `POST /student/upload-answer` only stores the file but never calls the orchestrator. After saving the upload, check if a question upload and rubric upload exist for the same `exam_id` in the uploads table. If they do, immediately call `orchestrator.evaluate_submission(...)` so students get instant results without teacher manually triggering evaluation.

**B. Teacher report PDF has no student names**
In `GET /teacher/report/{exam_id}`, the PDF only prints `Student {id}`. Fix it to JOIN with the User table and print the student's actual name.

**C. Student trainer-plan crashes if no analytics exist**
In `GET /student/trainer-plan`, `get_student_analytics` returns `average: 0.0` when no results exist. Ensure `orchestrator.trainer_plan(student, 0.0)` handles `average=0` gracefully and returns a valid plan.

**D. Memory insights endpoint is missing from tests**
Add a test `test_memory_insights_endpoint_data` in `backend/tests/test_agents_verification.py` that calls `memory_agent.run([50, 60, 70])` and asserts the response contains `average`, `improvement`, and `insights` keys.

**E. Frontend: missing API client abstraction**
Create `frontend/lib/api.ts` — a typed API client with functions:
- `login(email, password)` → returns `{ access_token }`
- `register(name, email, password, role)` → returns user
- `getMyResults()` → returns `ResultItem[]`
- `getStudentAnalytics()` → returns `StudentAnalytics`
- `getTeacherAnalytics(examId)` → returns `TeacherAnalytics`
- `getParentMessage()` → returns `{ message }`
- `getTrainerPlan()` → returns `TrainerPlan`
- `getMemoryInsights()` → returns `MemoryInsights`
- `getNotifications()` → returns `{ notifications: NotificationItem[] }`
- `uploadAnswerSheet(examId, file)` → returns `UploadResponse`
- `createExam(subject)` → returns `ExamResponse`
- `downloadReport(examId)` → triggers file download

All functions must:
1. Read the token from `localStorage` (key: `"token"`)
2. Throw a typed `ApiError` with status and message on non-2xx responses
3. Use `fetch` with `NEXT_PUBLIC_API_URL` as base

**F. Frontend: auth pages are incomplete**
The login and register pages exist but have no real form submission logic wired to the API client. Fix `frontend/app/auth/login/page.tsx` and `frontend/app/auth/register/page.tsx` to:
- Call `api.login()` / `api.register()` on submit
- Store the token in localStorage on login success
- Redirect to `/teacher` or `/student` based on the returned user role
- Show a red error message below the form on failure
- Disable the submit button and show "Signing in…" / "Creating account…" while the request is in flight

**G. Frontend: dashboard pages must render real data**
Fix `frontend/app/teacher/page.tsx` and `frontend/app/student/page.tsx` to:
- Call the API client functions on mount (useEffect)
- Render actual chart data using Recharts
- Show a loading skeleton while fetching
- Handle API errors gracefully (show error banner)
- The teacher dashboard must have: stat cards (avg marks, pass %, highest mark), a BarChart of marks distribution, a PieChart of pass/fail, and a results table
- The student dashboard must have: stat cards (average, improvement), a LineChart of progress over tests, a PieChart of above/below pass mark, suggestions list, trainer plan section, and parent message card

**H. Fix TypeScript strict errors**
Ensure all frontend TypeScript files compile with `strict: true` (already in tsconfig). Common fixes needed:
- All API response types must be imported from `frontend/types/index.ts` (already defined)
- All `useEffect` and `useState` must have proper types
- No implicit `any`

### 10. Docker: fix SQLite volume issue
In `docker-compose.yml`, the backend service must mount a volume for the SQLite file so it persists across container restarts:
```yaml
volumes:
  - ./backend/storage:/app/storage
  - ./backend/smart_eval.db:/app/smart_eval.db
```
If the compose file uses PostgreSQL as a service, keep it but make it optional — the app should still start cleanly with SQLite when `DATABASE_URL` points to sqlite.

### 11. Fix `backend/app/core/database.py` fully
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

def _make_engine():
    url = settings.database_url
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False})
    return create_engine(url, pool_pre_ping=True)

engine = _make_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 12. Fix `backend/app/agents/evaluation_agent.py` (no LangChain)
```python
import json
from openai import OpenAI
from app.core.config import settings

class EvaluationAgent:
    name = "EvaluationAgent"

    def __init__(self) -> None:
        if settings.openai_api_key:
            self.llm = OpenAI(api_key=settings.openai_api_key)
        else:
            self.llm = None

    def run(self, data: dict) -> dict:
        rubric = data.get("rubric_text", "")
        answer = data.get("answer_text", "")
        question = data.get("question_text", "")

        llm = getattr(self, "llm", None)
        if not llm or not settings.openai_api_key:
            marks = min(100.0, max(20.0, float(len(answer.split())) / 5.0))
            return {
                "marks": round(marks, 2),
                "feedback": "The answer covers key points but can improve with better structure and examples.",
            }

        prompt = (
            "Evaluate the student answer against the rubric. "
            "Return ONLY valid JSON with keys: marks (float 0-100) and feedback (string). "
            f"Question:\n{question}\n\nRubric:\n{rubric}\n\nAnswer:\n{answer}"
        )
        response = llm.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or ""
        try:
            parsed = json.loads(content)
            marks = float(parsed.get("marks", 70.0))
            feedback = str(parsed.get("feedback", content))
        except (json.JSONDecodeError, ValueError):
            marks = 70.0
            feedback = content[:1200]

        return {"marks": round(min(100.0, max(0.0, marks)), 2), "feedback": feedback}
```

---

## FINAL CHECKLIST — verify after making all changes

- [ ] `backend/requirements.txt` has NO langchain lines
- [ ] `backend/app/agents/evaluation_agent.py` imports `openai`, not `langchain_openai`
- [ ] `backend/app/core/database.py` handles sqlite and postgres separately
- [ ] `backend/app/main.py` uses `lifespan` not `on_event`
- [ ] `backend/.env` defaults to `DATABASE_URL=sqlite:///./smart_eval.db`
- [ ] `frontend/package.json` has `recharts`, no `chart.js` or `react-chartjs-2`
- [ ] `frontend/lib/api.ts` exists with all typed functions
- [ ] Login/register pages call real API and redirect by role
- [ ] Teacher and student dashboard pages render real data with Recharts
- [ ] All TypeScript compiles clean under `strict: true`
- [ ] All pytest tests pass (including new `test_memory_insights_endpoint_data`)
- [ ] `docker-compose.yml` has SQLite volume mounts

Output every modified file in full. Start with backend files, then frontend files, then docker/config files.
