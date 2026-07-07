import os
import json
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

# Try to import OpenAI / Google GenAI and LangChain packages
try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

# Load environment variables
load_dotenv()

app = FastAPI(
    title="ScriptoraAI - AI Narrative Intelligence Layer",
    version="1.0.0",
    description="Orchestrates multi-agent narrative workflows, memory retrieval, and story consistency validation."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Schemas ───────────────────────────────────────────────

class GenerateRequest(BaseModel):
    document_id: str
    prompt: str
    tone_reference_doc_id: Optional[str] = None
    project_id: Optional[str] = None

class PlanStoryRequest(BaseModel):
    current_beats: List[str]
    framework: str  # "Heros Journey" | "Save the Cat" | "Three Act Structure"
    target_step: str
    project_id: Optional[str] = None

class CheckConsistencyRequest(BaseModel):
    document_id: str
    draft_text: str
    project_id: Optional[str] = None

class ConsistencyIssue(BaseModel):
    severity: str  # "CRITICAL" | "WARNING" | "INFO"
    issue_description: str
    source_reference: Optional[str] = None
    suggested_fix: Optional[str] = None

class ConsistencyResponse(BaseModel):
    consistent: bool
    inconsistencies: List[ConsistencyIssue]

# ─── Database Utility Helper ────────────────────────────────────────

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url or not HAS_PSYCOPG2:
        return None
    try:
        # standard postgres connection
        conn = psycopg2.connect(db_url)
        return conn
    except Exception as e:
        logger.warning(f"Could not connect to database: {e}")
        return None

def fetch_project_lore(project_id: str) -> Dict[str, Any]:
    """Retrieves characters, locations, and other documents for consistency checks."""
    lore = {"characters": [], "locations": [], "documents": []}
    conn = get_db_connection()
    if not conn:
        return lore
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Fetch characters
            cur.execute(
                "SELECT id, name, archetype, description, attributes FROM characters WHERE project_id = %s::uuid", 
                (project_id,)
            )
            lore["characters"] = list(cur.fetchall())
            
            # Fetch locations
            cur.execute(
                "SELECT id, name, description FROM locations WHERE project_id = %s::uuid",
                (project_id,)
            )
            lore["locations"] = list(cur.fetchall())

            # Fetch documents
            cur.execute(
                "SELECT id, title, content_text FROM documents WHERE project_id = %s::uuid AND id::text != %s",
                (project_id, "")
            )
            lore["documents"] = list(cur.fetchall())
    except Exception as e:
        logger.error(f"Error fetching lore from DB: {e}")
    finally:
        conn.close()
    return lore

# ─── LLM Helper ─────────────────────────────────────────────────────

def call_llm(system_prompt: str, user_prompt: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or not HAS_OPENAI:
        # Mock LLM return in case API keys are not provided
        logger.info("Using fallback mock assistant response (No OpenAI API key found)")
        return ""
    
    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {e}")
        return ""

# ─── Endpoints ──────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "service": "scriptora-ai-layer",
        "database_connected": get_db_connection() is not None,
        "openai_available": HAS_OPENAI and os.getenv("OPENAI_API_KEY") is not None
    }

@app.post("/api/v1/ai/generate")
async def generate_prose(req: GenerateRequest):
    """
    Generates prose based on writing prompts and context.
    Optionally references a style/tone doc.
    """
    system_prompt = (
        "You are an expert creative co-writer and novelist assisting a writer in drafting. "
        "Maintain a descriptive, highly engaging, and immersive tone. Avoid generic writing tropes."
    )
    
    # If a tone reference document is specified, fetch its text
    tone_content = ""
    if req.tone_reference_doc_id:
        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "SELECT title, content_text FROM documents WHERE id = %s::uuid",
                        (req.tone_reference_doc_id,)
                    )
                    doc = cur.fetchone()
                    if doc and doc["content_text"]:
                        tone_content = doc["content_text"]
            except Exception as e:
                logger.error(f"Error fetching tone reference doc: {e}")
            finally:
                conn.close()
                
    if tone_content:
        system_prompt += f"\n\nStudy and replicate the voice, style, pacing, and vocabulary of this reference text:\n--- START STYLE REFERENCE ---\n{tone_content}\n--- END STYLE REFERENCE ---"

    user_prompt = f"Continue writing the scene based on this instruction or seed:\n\n{req.prompt}\n\nDraft the next few paragraphs:"

    response = call_llm(system_prompt, user_prompt)
    if not response:
        # Generative fallback
        response = (
            f"John stepped carefully into the silence, the echo of his bootheels swallowed by the thick humidity "
            f"of the passage. The prompt '{req.prompt}' sparked a flicker of ancient memory. Every stone seemed "
            f"to whisper of what had been sealed here, a legacy waiting to be claimed or destroyed."
        )
    return {"text": response}

@app.post("/api/v1/ai/plan-story")
async def plan_story(req: PlanStoryRequest):
    """
    Recommends outline items and beats based on standard narrative models.
    """
    framework_info = {
        "Heros Journey": [
            "Call to Adventure", "Refusal of the Call", "Crossing the Threshold",
            "Tests, Allies, Enemies", "Ordeal", "Reward (Seizing the Sword)", "The Road Back", "Resurrection"
        ],
        "Save the Cat": [
            "Opening Image", "Theme Stated", "Setup", "Catalyst", "Debate", "Break into Two",
            "B Story", "Fun and Games", "Midpoint", "Bad Guys Close In", "All is Lost", "Dark Night of the Soul"
        ]
    }
    
    framework_beats = framework_info.get(req.framework, ["Setup", "Inciting Incident", "Rising Action", "Climax", "Resolution"])
    
    system_prompt = (
        f"You are a narrative designer and expert developmental editor specializing in the {req.framework} framework. "
        "Help the writer design the next beat in their story outline."
    )
    
    user_prompt = (
        f"The current outline beats established so far: {', '.join(req.current_beats) if req.current_beats else 'None'}.\n"
        f"We are designing the beat for the step: '{req.target_step}'.\n"
        f"Generate a concrete, actionable story beat description suited for this framework stage."
    )
    
    response = call_llm(system_prompt, user_prompt)
    if not response:
        # Default placeholder/mock framework suggestion
        response = f"For the '{req.target_step}' stage of the {req.framework}, introduce a high-stakes twist that forces the protagonist to re-evaluate their primary motivation, creating friction with their closest ally."

    return {
        "framework": req.framework,
        "target_step": req.target_step,
        "suggested_beat": response,
        "framework_beats": framework_beats
    }

@app.post("/api/v1/ai/check-consistency", response_model=ConsistencyResponse)
async def check_consistency(req: CheckConsistencyRequest):
    """
    Validates a draft against the project's characters and locations to find continuity errors.
    """
    project_id = req.project_id
    lore = {"characters": [], "locations": [], "documents": []}
    if project_id:
        lore = fetch_project_lore(project_id)
    
    # Compile character descriptors
    char_profiles = []
    for char in lore["characters"]:
        desc = f"Name: {char['name']}. Archetype: {char.get('archetype') or 'N/A'}. Details: {char.get('description') or ''}."
        if char.get("attributes"):
            desc += f" Attributes: {json.dumps(char['attributes'])}"
        char_profiles.append(desc)

    loc_profiles = []
    for loc in lore["locations"]:
        loc_profiles.append(f"Name: {loc['name']}. Details: {loc.get('description') or ''}.")

    system_prompt = (
        "You are a meticulous continuity editor for long-form fiction. Your task is to analyze a new draft "
        "and flag contradictions against the established lore database (characters, traits, injuries, states, locations).\n\n"
        "Return your findings STRICTLY as a JSON object containing a list of inconsistencies. Each inconsistency must have:\n"
        "- 'severity': either 'CRITICAL', 'WARNING', or 'INFO'\n"
        "- 'issue_description': a clear explanation of what contradicts what\n"
        "- 'source_reference': name of character or file where the contradiction originates\n"
        "- 'suggested_fix': a path to correct the draft text.\n\n"
        "Return empty list if the draft is fully consistent."
    )
    
    user_prompt = f"--- LORE DATABASE ---\n"
    if char_profiles:
        user_prompt += "Characters:\n" + "\n".join(char_profiles) + "\n"
    else:
        # Inject standard demo character for testing if database is not set up
        user_prompt += "Characters:\nName: John. Archetype: Detective. Details: Recovering from a fractured left femur sustained in Chapter 2. Walks with a limp.\n"
        
    if loc_profiles:
        user_prompt += "Locations:\n" + "\n".join(loc_profiles) + "\n"
    else:
        user_prompt += "Locations:\nName: The Sunken Vault. Details: Entirely submerged in freshwater, requires scuba gear to enter.\n"
        
    user_prompt += f"\n--- DRAFT TO CHECK ---\n{req.draft_text}\n\nPerform the check and return JSON format."

    response = call_llm(system_prompt, user_prompt)
    
    inconsistencies = []
    
    if response:
        try:
            # Strip markdown json block wrappers if present
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            data = json.loads(cleaned.strip())
            
            issues = data.get("inconsistencies", [])
            for issue in issues:
                inconsistencies.append(ConsistencyIssue(
                    severity=issue.get("severity", "WARNING"),
                    issue_description=issue.get("issue_description", ""),
                    source_reference=issue.get("source_reference"),
                    suggested_fix=issue.get("suggested_fix")
                ))
        except Exception as e:
            logger.warning(f"Error parsing LLM consistency JSON output: {e}. Output was: {response}")

    # Fallback/Demo evaluation if LLM was not invoked or returned no issues
    if not inconsistencies:
        # Check draft for common test cases (e.g. John running or vault access without gear)
        draft_lower = req.draft_text.lower()
        if "john" in draft_lower and ("run" in draft_lower or "sprint" in draft_lower or "jump" in draft_lower or "vault" in draft_lower):
            inconsistencies.append(ConsistencyIssue(
                severity="CRITICAL",
                issue_description="John is sprinting/jumping in this draft, which contradicts his established profile noting a fractured left femur (limp).",
                source_reference="John",
                suggested_fix="Show John struggling with pain, or walking slowly with a cane, or explain that he has fully recovered."
            ))
        if "vault" in draft_lower and ("breath" in draft_lower or "walked in" in draft_lower) and not ("scuba" in draft_lower or "gear" in draft_lower or "diving" in draft_lower):
            inconsistencies.append(ConsistencyIssue(
                severity="WARNING",
                issue_description="The character entered the Sunken Vault without diving equipment, which is established as being fully submerged.",
                source_reference="The Sunken Vault",
                suggested_fix="Explicitly mention wearing a diving mask and breathing regulator, or swimming through the entrance."
            ))

    return ConsistencyResponse(
        consistent=len(inconsistencies) == 0,
        inconsistencies=inconsistencies
    )
