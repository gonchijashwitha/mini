from flask import Flask, jsonify, render_template, request

from .database import fetch_contacts, get_visitors, increment_visitors, init_db, save_contact


app = Flask(__name__, template_folder="templates", static_folder="static")
init_db()


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/admin")
def admin():
    return render_template("admin.html", contacts=fetch_contacts(), visitors=get_visitors())


@app.get("/api/health")
def api_health():
    return jsonify({"status": "ok"})


@app.post("/api/contact")
def api_contact():
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()
    message = str(payload.get("message", "")).strip()
    if not name or not email or not message:
        return jsonify({"ok": False, "error": "name, email, and message are required"}), 400
    save_contact(name=name, email=email, message=message)
    return jsonify({"ok": True, "message": "Contact saved"})


@app.get("/api/contacts")
def api_contacts():
    return jsonify({"ok": True, "contacts": fetch_contacts()})


@app.post("/api/visit")
def api_visit():
    count = increment_visitors()
    return jsonify({"ok": True, "visitors": count})


@app.get("/api/visitors")
def api_visitors():
    return jsonify({"ok": True, "visitors": get_visitors()})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
