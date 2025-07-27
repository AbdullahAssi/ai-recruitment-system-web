def load_knowledge_base(filepath="constraints.txt"):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "No external knowledge found."
