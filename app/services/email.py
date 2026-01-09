"""
Email Service
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


async def send_detection_email(user_email: str, user_name: str, detected_object: str, advice: str, heatmap_url: str = None, original_url: str = None):
    """Send email notification after successful image analysis"""

    if not settings.EMAIL_USERNAME or not settings.EMAIL_PASSWORD:
        print("⚠️  Email credentials not configured, skipping email notification")
        return False

    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "🚦 Vision Flow AI - Image Analysis Complete"
        message["From"] = settings.DEFAULT_FROM_EMAIL
        message["To"] = user_email

        # HTML email content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }}
                .content {{
                    background: #f8fafc;
                    padding: 30px;
                    border: 1px solid #e2e8f0;
                    border-top: none;
                }}
                .detection-box {{
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #0ea5e9;
                }}
                .advice-box {{
                    background: #e0f2fe;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 15px;
                }}
                .image-box {{
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    text-align: center;
                }}
                .image-box img {{
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    margin: 10px 0;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 30px;
                    background: #0ea5e9;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                }}
                .footer {{
                    text-align: center;
                    padding: 20px;
                    color: #64748b;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Analysis Complete!</h1>
                    <p>Your traffic image has been analyzed successfully</p>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Your image analysis is complete. Here are the results:</p>

                    <div class="detection-box">
                        <h2 style="margin-top: 0; color: #0ea5e9;">🎯 Detected Object</h2>
                        <p style="font-size: 24px; font-weight: bold; margin: 10px 0; text-transform: capitalize;">
                            {detected_object}
                        </p>
                    </div>

                    {f'''
                    <div class="image-box">
                        <h3 style="margin-top: 0; color: #475569;">📸 Analyzed Images</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                            <div>
                                <p style="font-weight: bold; color: #64748b; margin: 5px 0; font-size: 14px;">Original Image</p>
                                <img src="http://localhost:8000{original_url}" alt="Original" style="max-width: 100%; border-radius: 8px;">
                            </div>
                            <div>
                                <p style="font-weight: bold; color: #64748b; margin: 5px 0; font-size: 14px;">Heatmap Analysis</p>
                                <img src="http://localhost:8000{heatmap_url}" alt="Heatmap" style="max-width: 100%; border-radius: 8px;">
                            </div>
                        </div>
                    </div>
                    ''' if original_url and heatmap_url else ''}

                    <div class="advice-box">
                        <h3 style="margin-top: 0; color: #0369a1;">💡 AI Insights</h3>
                        <p style="margin: 0;">{advice}</p>
                    </div>

                    <div style="text-align: center;">
                        <a href="http://localhost:3000/dashboard/history" class="button">
                            View Full Analysis
                        </a>
                    </div>
                </div>
                <div class="footer">
                    <p>Vision Flow AI - Smart Traffic Detection</p>
                    <p style="font-size: 12px; color: #94a3b8;">
                        This is an automated email. Please do not reply.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text version
        text_content = f"""
        Vision Flow AI - Analysis Complete

        Hi {user_name},

        Your image analysis is complete!

        Detected Object: {detected_object}

        AI Insights:
        {advice}

        View your full analysis at: http://localhost:3000/dashboard/history

        ---
        Vision Flow AI - Smart Traffic Detection
        This is an automated email. Please do not reply.
        """

        # Attach both versions
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        message.attach(part1)
        message.attach(part2)

        # Send email
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
            server.send_message(message)

        print(f"✅ Email sent successfully to {user_email}")
        return True

    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        return False
