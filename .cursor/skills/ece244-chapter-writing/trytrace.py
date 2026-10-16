"""Send each .cpp to pythontutor (same options as viztrace_cpp_folder.py) and
summarize the trace: step count, final event, errors, max heap blocks."""
import json
import sys
from pathlib import Path

import requests

URL = "https://pythontutor.com/web_exec_c.py"
OPTS = {
    "cumulative_mode": False, "heap_primitives": False, "show_only_outputs": False,
    "origin": "opt-frontend.js", "cpp_version": "cpp_g++9.3.0",
    "fe_disableHeapNesting": True, "fe_textualMemoryLabels": False,
}

for f in sys.argv[1:]:
    code = Path(f).read_text()
    r = requests.post(URL, timeout=60, data={
        "user_script": code, "raw_input_json": "", "options_json": json.dumps(OPTS),
        "lang": "cpp", "stdin": "", "backend_options_json": "{}",
        "frontend_options_json": "{}", "starting_instruction": 0,
        "instruction_limit": 10000, "origin": "c"})
    t = r.json().get("trace", [])
    out = Path(f).with_suffix(".trace.json")
    out.write_text(json.dumps(r.json(), indent=1))
    events = [s.get("event") for s in t]
    errs = [s.get("exception_msg") for s in t if s.get("exception_msg")]
    heap = max((len(s.get("heap", {})) for s in t), default=0)
    funcs = sorted({fr["func_name"] for s in t for fr in s.get("stack_to_render", [])})
    print(f"== {Path(f).name}: {len(t)} steps, last={events[-1] if events else None}, "
          f"max heap blocks={heap}")
    print("   frames:", funcs)
    print("   stdout:", repr(t[-1].get("stdout", "")[:120]) if t else None)
    for e in errs[:3]:
        print("   error:", e[:300].replace("\n", " | "))
