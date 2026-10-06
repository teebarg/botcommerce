from pathlib import Path

import joblib
import numpy as np
from datasets import load_dataset
from fastembed import TextEmbedding
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split


def run_training():
    print("⚡ Starting model training...", flush=True)
    
    # 1. Ensure artifact output directory exists relative to project root
    artifacts_dir = Path(__file__).resolve().parent.parent / "app/artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    print("📥 Loading BAAI/bge-small-en-v1.5 embedder...", flush=True)
    embedder = TextEmbedding("BAAI/bge-small-en-v1.5")

    def embed(texts):
        return np.array(list(embedder.embed(texts)))

    # In-scope dataset
    in_scope = [
        "where is my order", "track my package", "do you have this in size 42",
        "how much is delivery to abuja", "can i pay on delivery", "is this in stock",
        "my item arrived broken", "i want to return this", "what is your return policy",
        "update my address", "price of this phone", "do you sell laptops",
    ]

    print("📥 Loading SQuAD dataset for off-topic samples...", flush=True)
    squad = load_dataset("rajpurkar/squad", split="train[:1500]")
    off_topic = [x["question"] for x in squad]
    off_topic += [
        "tell me a joke", "can you be my gf", "i need therapy", "write me a poem",
        "relationship advice", "who is the president", "what is 2 + 2",
    ]

    print("⚙️ Generating embeddings...", flush=True)
    X = embed(in_scope + off_topic)
    y = np.array([1] * len(in_scope) + [0] * len(off_topic))

    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y)
    
    print("🎯 Training Logistic Regression classifier...", flush=True)
    clf = LogisticRegression(max_iter=1000, class_weight="balanced")
    clf.fit(X_tr, y_tr)

    acc = clf.score(X_te, y_te)
    print(f"📊 Model Accuracy: {acc:.4f}", flush=True)

    model_file = artifacts_dir / "scope_clf.joblib"
    joblib.dump(clf, model_file)
    print(f"✅ Model saved to {model_file}", flush=True)

if __name__ == "__main__":
    run_training()