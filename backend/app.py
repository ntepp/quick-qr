# backend/app.py
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from flask_limiter import Limiter # Import Flask-Limiter
from flask_limiter.util import get_remote_address # Import helper to get client IP
import qrcode
import io

app = Flask(__name__)

# --- Rate Limiting Configuration ---
# Initialize Limiter
limiter = Limiter(
    get_remote_address, # Use the client's IP address for rate limiting
    app=app,
    default_limits=["10 per day", "5 per hour", "1 per minute"], # Example limits
    storage_uri="memory://",  # Use in-memory storage (suitable for single process)
    # For multi-process/distributed setups, consider Redis: "redis://localhost:6379"
)
# ----------------------------------

# --- CORS Configuration ---
# Initialize CORS, allowing requests specifically from your frontend origin
CORS(app, resources={r"/generate*": {"origins": "http://localhost:3000"}})
# -------------------------

@app.route('/generate', methods=['GET'])
@limiter.limit("2/minute") # Apply rate limit specifically to this endpoint
def generate_qr():
    """
    Generates a QR code image for the provided URL.
    Expects a 'url' query parameter.
    Returns the QR code as a PNG image or a JSON error.
    Rate limited to 10 requests per minute per IP.
    """
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "URL query parameter is required"}), 400

    try:
        # Generate the QR code image
        img = qrcode.make(url)

        # Create an in-memory buffer to hold the image data
        buffer = io.BytesIO()
        img.save(buffer, format="PNG") # Save image to buffer as PNG
        buffer.seek(0) # Rewind buffer to the beginning

        # Send the buffer content as a file with the correct MIME type
        return send_file(
            buffer,
            mimetype='image/png',
            as_attachment=False # Send inline, not as a download
        )
    except Exception as e:
        app.logger.error(f"Error generating QR code for URL '{url}': {e}")
        return jsonify({"error": "Failed to generate QR code"}), 500

# Optional: Define a custom error handler for rate limit exceeded (429 status code)
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify(error=f"Rate limit exceeded: {e.description}"), 429

if __name__ == '__main__':
    # Run the app
    app.run(host='0.0.0.0', port=8080, debug=True) # Keep debug=True for development


