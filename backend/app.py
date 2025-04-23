from flask import Flask, request, send_file
import qrcode
import io

app = Flask(__name__)

@app.route('/generate', methods=['GET'])
def generate_qr():
    url = request.args.get('url')
    if not url:
        return {"error": "URL param is required"}, 400

    img = qrcode.make(url)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return send_file(buffer, mimetype='image/png')
